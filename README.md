# 🛡️ WatcherAgent

> **AI-governed incident response that triages, notifies, fixes, and learns — autonomously.**

WatcherAgent is a production-grade, multi-node agentic pipeline that takes an incoming alert from any monitoring system, runs it through LLM-powered triage, asks a human for approval over Discord, automatically raises a GitHub Pull Request with an AI-generated code fix, and then writes the entire resolution into a vector database so the next identical incident is resolved in seconds from memory — no LLM re-analysis required.

---

## Table of Contents

- [How it works](#how-it-works)
- [Architecture](#architecture)
- [Pipeline nodes](#pipeline-nodes)
- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Running locally](#running-locally)
- [Triggering a test incident](#triggering-a-test-incident)
- [Dashboard UI](#dashboard-ui)
- [Memory & recall](#memory--recall)
- [Error categories](#error-categories)
- [Configuration reference](#configuration-reference)

---

## How it works

```
Monitoring alert  ──►  POST /webhook
                              │
                    ┌─────────▼──────────┐
                    │  Node 01 · Triage   │  LLM classifies severity (P1/P2/P3),
                    │                    │  error type, root frame, category tag
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Node 02 · Runbook  │  Pinecone RAG — searches historical
                    │                    │  fixes first; falls back to built-in
                    └─────────┬──────────┘  runbooks if no match found
                              │
                    ┌─────────▼──────────┐
                    │  Node 03 · HITL     │  Discord card with Accept / Ignore
                    │                    │  buttons. Auto-expires after timeout.
                    └─────────┬──────────┘
                    Human clicks "Accept & Fix"
                              │
                    ┌─────────▼──────────┐
                    │  Node 04 · Fixer    │  GitHub PR — 3-phase LLM audit
                    │                    │  OR memory-recall replay (no LLM)
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Node 05 · Narrator │  Stores fix in Pinecone so future
                    │                    │  identical incidents skip the LLM
                    └────────────────────┘
```

---

## Architecture

WatcherAgent is a **monorepo** containing two independent applications:

| Directory | Purpose |
|---|---|
| `watcherai/` | The agentic pipeline — Node.js + Express orchestrator with 5 pipeline nodes |
| `watcher/` | The dashboard UI — Next.js frontend that displays live incidents |

The two communicate over HTTP: the UI polls `GET /api/incidents` on the agent server to display real-time incident state.

---

## Pipeline nodes

### Node 01 — Triage
`watcherai/nodes/node-01-triage/`

Receives the raw webhook payload and calls the LLM (via OpenRouter) to classify the incident. Returns:

- **Severity** — P1 / P2 / P3 derived purely from payload evidence
- **Error category** — one of 11 deterministic categories (HTTP_5XX, DATABASE, NETWORK, etc.)
- **Root frame** — the exact file + line + function the LLM identifies as the origin
- **Normalized error signature** — dynamic values stripped, used as the vector query key
- **Confidence** — 0–100, used downstream to decide whether to escalate

Falls back gracefully if the LLM is unavailable, assigning P2 + 50% confidence.

---

### Node 02 — Runbook
`watcherai/nodes/node-02-runbook/`

Queries Pinecone for historical fixes using the normalized error signature as a vector query.

**Two-pass recall strategy:**
1. Same-service query at threshold `0.78` — finds prior fixes for the exact same service
2. Cross-service fallback at threshold `0.82` — finds fixes for the same error pattern in any service

If Pinecone returns nothing above threshold, falls back to a built-in runbook library keyed by service name and error keywords (DB, Redis, memory, payment, etc.).

---

### Node 03 — HITL (Human-in-the-Loop)
`watcherai/nodes/node-03-hitl/`

Sends a Discord embed card to the configured incident channel. The card shows:

- Severity + confidence
- Error category label
- Top 3 runbook steps (or memory recall notice if a past fix was found)
- **Accept & Fix** button → triggers Node 04 + 05
- **Ignore** button → archives the incident and updates the card in-place (no deletion to avoid visual confusion)

Incidents auto-expire after `HITL_TIMEOUT_MS` (default 15 min) and are cleaned up by a background interval every 5 minutes.

---

### Node 04 — War Room / Fixer
`watcherai/nodes/node-04-warroom/`

Creates a GitHub Pull Request with an AI-generated fix. Runs three phases sequentially:

| Phase | What it does |
|---|---|
| **1 · Keyword extraction** | LLM extracts 3 technical search terms from the error |
| **2 · File discovery & ranking** | Crawls the repo tree, then LLM ranks the top 5 candidate files |
| **3 · Deep audit & fix** | LLM audits the file contents and produces a unified diff + full replacement |

**Memory recall fast-path:** if Node 02 returned a `HISTORICAL_FIX` runbook with a stored diff, phases 1–3 are skipped entirely. The known fix is replayed directly and a "Memory Recall" PR is opened. This is typically **3–5× faster** and uses zero LLM credits.

**Duplicate PR guard:** before running any LLM, the fixer checks GitHub for open PRs on the same branch. If one exists, it returns the existing URL instead of opening a duplicate.

Each PR includes a detailed postmortem document committed to `incidents/<INC-ID>/POSTMORTEM.md`.

---

### Node 05 — Narrator / Memory
`watcherai/nodes/node-05-narrator/`

Writes the resolved incident into Pinecone as 4 vector chunks:

| Chunk type | Embedded text | Purpose |
|---|---|---|
| `error_signature` | Normalized error + fix metadata | Primary recall query target |
| `fix` | Fix reasoning + diff | Stores the actual patch for replay |
| `root_cause` | Root cause explanation | Semantic search for similar causes |
| `symptom` | Service + severity description | Broader symptom matching |

All chunks carry `error_category` in metadata, enabling filtered Pinecone queries like "show all past DATABASE incidents".

---

## Key features

- **Autonomous pipeline** — zero human involvement required until the Discord approval step
- **Memory recall** — identical errors are resolved from Pinecone history without re-running LLM analysis
- **Error taxonomy** — 11 category labels (HTTP_5XX, DATABASE, BUILD_DEPLOY, etc.) flow through every layer: triage output, Discord embed, Pinecone metadata, PR postmortem
- **Noise filter** — low-signal alerts (error rate < 2%, latency < 200 ms, duration < 1 min) are rejected before entering the pipeline
- **Duplicate incident guard** — same `incident_id` triggers a 409 before any work starts
- **Duplicate PR guard** — open PRs on the same fix branch are detected and linked instead of duplicated
- **Stale HITL cleanup** — incidents awaiting approval for longer than 90 minutes are auto-expired
- **Graceful degradation** — Discord, Pinecone, and GitHub are all optional; the pipeline degrades cleanly if any credential is missing
- **Schema validation** — every node input and output is validated with Zod; violations are caught and logged before they cascade

---

## Tech stack

| Layer | Technology |
|---|---|
| Agent orchestrator | Node.js 20+ · Express 5 |
| LLM calls | [OpenRouter](https://openrouter.ai) — `google/gemini-2.5-flash` by default |
| Vector memory | [Pinecone](https://www.pinecone.io) — index `watcher-knowledge` |
| HITL interface | [Discord.js](https://discord.js.org) v14 |
| Code fix deployment | [Octokit](https://github.com/octokit/octokit.js) — GitHub REST API |
| Schema validation | [Zod](https://zod.dev) |
| Dashboard UI | Next.js · Tailwind CSS · Prisma · Neon (PostgreSQL) |

---

## Project structure

```
WatcherAgent/
├── watcherai/                   # Agent pipeline
│   ├── server.js                # Express orchestrator — all routes live here
│   ├── services/
│   │   └── incident-store.js    # File-backed incident state (watcherai/.data/)
│   ├── nodes/
│   │   ├── node-01-triage/      # LLM severity + error classification
│   │   ├── node-02-runbook/     # Pinecone RAG + local runbook fallback
│   │   ├── node-03-hitl/        # Discord bot (approval cards + button handlers)
│   │   ├── node-04-warroom/     # GitHub PR creator (3-phase LLM audit)
│   │   ├── node-05-narrator/    # Pinecone memory writer
│   │   └── shared/
│   │       ├── ai.js            # callLLM + getEmbedding via OpenRouter
│   │       ├── categorize.js    # Deterministic error category classifier
│   │       └── normalize.js     # Error signature normalizer
│   ├── prompts/
│   │   ├── triage.js            # User-customizable triage prompt hook
│   │   └── fixer.js             # Fixer prompt customization
│   └── scripts/
│       ├── trigger-webhook.js   # Fire a test incident
│       ├── seed-pinecone.js     # Populate Pinecone with seed runbooks
│       └── trigger-demo.js      # Full demo run
│
├── watcher/                     # Dashboard UI (Next.js)
│   ├── app/dashboard/           # Incident list + detail views
│   ├── app/sign-in/             # Auth (Better Auth)
│   └── prisma/                  # Database schema
│
└── infra/docker/                # Docker Compose for full-stack local run
```

---

## Prerequisites

- **Node.js 20+**
- **npm 10+** (or pnpm for the `watcher/` UI)
- Four external accounts (all have free tiers):
  - [OpenRouter](https://openrouter.ai) — LLM API
  - [Pinecone](https://www.pinecone.io) — vector database
  - [Discord Developer Portal](https://discord.com/developers) — bot token
  - [GitHub](https://github.com/settings/tokens) — personal access token

---

## Environment variables

Copy `watcherai/.env.example` to `watcherai/.env` and fill in the values.

```env
# ── Server ───────────────────────────────────────────────────────────────────
PORT=3001
INTERNAL_CALLBACK_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
PIPELINE_TIMEOUT_MS=90000

# ── OpenRouter (LLM) ─────────────────────────────────────────────────────────
OPENROUTER_API_KEY=sk-or-v1-...
DEFAULT_LLM_MODEL=google/gemini-2.5-flash

# ── Pinecone (Vector memory) ─────────────────────────────────────────────────
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX_NAME=watcher-knowledge
PINECONE_SCORE_THRESHOLD=0.78        # recall sensitivity (lower = broader)

# ── Discord (HITL) ───────────────────────────────────────────────────────────
DISCORD_BOT_TOKEN=MTU...
DISCORD_INCIDENT_CHANNEL_ID=147396...
HITL_TIMEOUT_MS=900000               # 15 minutes

# ── GitHub (Fix deployment) ──────────────────────────────────────────────────
GITHUB_TOKEN=github_pat_...          # needs Contents + Pull requests: Read & write
GITHUB_REPO_OWNER=your-username
GITHUB_REPO_NAME=your-repo

# ── Noise filter (optional) ──────────────────────────────────────────────────
NOISE_ERROR_RATE_THRESHOLD=0.02      # below this → skip pipeline
NOISE_LATENCY_MS_THRESHOLD=200
NOISE_DURATION_MIN_THRESHOLD=1
```

> **GitHub PAT permissions required:** under Fine-grained tokens → Repository permissions → set **Contents** and **Pull requests** to **Read and write**.

> **Discord bot permissions required:** Send Messages, Create Public Threads, Send Messages in Threads, Embed Links, Read Message History. Invite URL from the Developer Portal → OAuth2 → URL Generator.

---

## Running locally

**1. Install dependencies**

```bash
cd watcherai
npm install
```

**2. Seed Pinecone** (one-time, populates the runbook knowledge base)

```bash
npm run seed:pinecone
```

**3. Start the agent server**

```bash
npm start
# Agent running at http://localhost:3001
```

**4. Start the dashboard UI** (optional, separate terminal)

```bash
cd watcher
pnpm install
pnpm dev
# UI running at http://localhost:3000
```

---

## Triggering a test incident

```bash
cd watcherai
npm run webhook
```

This sends a `checkout-service` P1 incident payload (ECONNREFUSED + MongoNetworkError) to `POST /webhook`. You will see:

```
🚀 Sending test webhook to http://localhost:3001/webhook...
✅ Webhook accepted!
Incident ID: INC-7823
Severity: P1

Next steps:
1. Check your Discord channel for the alert.
2. Click "Accept & Fix" to trigger the GitHub PR.
3. Or click "Ignore" to terminate the incident.
```

Go to your Discord channel. You will see an embed card with the incident details, error category, severity colour, and two buttons:

- **Accept & Fix** — runs Nodes 04 + 05, opens a GitHub PR, stores the fix in Pinecone
- **Ignore** — updates the card to a grey "Ignored" state and archives the thread

---

## Dashboard UI

The `watcher/` Next.js application connects to `GET /api/incidents` on the agent server and displays all incidents currently in the store. Each incident row shows:

- Incident ID + service name
- Severity badge (P1 red / P2 orange / P3 yellow)
- Error category tag
- HITL status (AWAITING_APPROVAL, APPROVED, etc.)
- PR link (once a fix has been deployed)

---

## Memory & recall

After a successful fix, Node 05 writes 4 vector chunks to Pinecone. On the next occurrence of a similar error, Node 02 finds the historical fix above the similarity threshold and returns it as a `HISTORICAL_FIX` runbook.

When Node 04 receives a `HISTORICAL_FIX` runbook with a stored diff:

1. **Phases 1–3 are skipped entirely** (no LLM calls, no repo crawl)
2. The stored diff is replayed directly onto the same file
3. A **Memory Recall PR** is created with a postmortem that cites the original incident and its PR
4. The PR title is prefixed `fix(recall):` so it is visually distinct on GitHub

This is the system's core value proposition: the first fix costs 3 LLM calls and ~30 seconds. Every subsequent identical fix costs 0 LLM calls and ~3 seconds.

---

## Error categories

All incidents are tagged with one of the following categories at triage time. The tag flows through the Discord embed, Pinecone metadata, and the GitHub PR postmortem.

| Category | Triggers on |
|---|---|
| `HTTP_5XX` | 500 / 502 / 503 / 504, internal server error, bad gateway |
| `HTTP_4XX` | 401 / 403 / 404 / 429, unauthorized, rate limit |
| `DATABASE` | MongoNetworkError, connection pool, deadlock, pg/mysql errors |
| `BUILD_DEPLOY` | SyntaxError, build failed, cannot find module, webpack |
| `AUTHENTICATION` | JWT, token expired, OAuth, credentials invalid |
| `NETWORK` | ECONNREFUSED, ETIMEDOUT, socket hang up, DNS failure |
| `MEMORY` | OOMKilled, heap limit, ENOMEM, out of memory |
| `DEPENDENCY` | module not found, version conflict, peer dependency |
| `CONFIGURATION` | missing env/config, schema validation, .env |
| `RUNTIME_ERROR` | generic runtime / logic errors |
| `UNKNOWN` | fallback when no pattern matches |

---

## Configuration reference

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Agent server port |
| `PIPELINE_TIMEOUT_MS` | `90000` | Max ms for triage + runbook + HITL |
| `HITL_TIMEOUT_MS` | `900000` | Discord approval window (15 min) |
| `HITL_EXPIRY_MINUTES` | `90` | Stale incident cleanup threshold |
| `DEFAULT_LLM_MODEL` | `google/gemini-2.5-flash` | OpenRouter model slug |
| `LLM_TIMEOUT_MS` | `30000` | Per-LLM-call timeout |
| `PINECONE_INDEX_NAME` | `watcher-knowledge` | Pinecone index to read/write |
| `PINECONE_SCORE_THRESHOLD` | `0.78` | Same-service recall sensitivity |
| `PINECONE_SCORE_THRESHOLD_BROAD` | `0.82` | Cross-service recall sensitivity |
| `NOISE_ERROR_RATE_THRESHOLD` | `0.02` | Below this error rate → skip pipeline |
| `NOISE_LATENCY_MS_THRESHOLD` | `200` | Below this latency → skip pipeline |
| `NOISE_DURATION_MIN_THRESHOLD` | `1` | Below this duration → skip pipeline |
| `ORCHESTRATOR_URL` | `http://localhost:3001` | URL Discord callbacks POST to |

---

## API routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/webhook` | Ingest a new incident alert |
| `GET` | `/api/incidents` | List all active incidents (used by dashboard) |
| `GET` | `/api/incidents/:id` | Get a single incident by ID |
| `POST` | `/internal/discord-approve` | Discord "Accept" button callback |
| `POST` | `/internal/discord-ignore` | Discord "Ignore" button callback |
