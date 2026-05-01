# 🛡️ Watcher: Quick Start Guide

Guardian is an autonomous SRE agent that triages incidents, retrieves fixes via Pinecone RAG, and deploys GitHub PRs after Discord approval.

## 1. Prerequisites

- **OpenRouter:** API key for LLM orchestration (OpenAI, Gemini, Claude).
- **Pinecone:** API key and Index for Vector RAG.
- **Discord:** A bot token and a channel ID.
- **GitHub:** A Personal Access Token (PAT) with `repo` scope.
- **Node.js:** v20+

## 2. Configuration (.env)

Create a `.env` file in the root directory:

```env
PORT=3000

# OpenRouter (LLM)
OPENROUTER_API_KEY=your_openrouter_api_key
DEFAULT_LLM_MODEL=google/gemini-flash-1.5

# Pinecone (Vector RAG)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=guardian-knowledge

# Discord (HITL)
DISCORD_BOT_TOKEN=your-discord-bot-token
DISCORD_INCIDENT_CHANNEL_ID=your-target-channel-id

# GitHub (Automation)
GITHUB_TOKEN=your-github-pat
GITHUB_REPO_OWNER=your-github-username
GITHUB_REPO_NAME=your-repo-name
```

## 3. Installation

```bash
npm install
```

## 4. Running the Agent

```bash
node server.js
```

## 5. Testing the Architecture

Trigger a sample incident using `curl` to see the entire pipeline in action:

```bash
curl -X POST http://localhost:3000/webhook \\
  -H "Content-Type: application/json" \\
  -d '{
    "service": "user-authentication",
    "alert": {
      "error": "PostgreSQL Connection Timeout",
      "latencyMs": 1200,
      "errorRate": 0.25
    }
  }'
```

### What to expect:
1. **Console:** You'll see "🛡️ Received Webhook" and the Triage results via OpenRouter.
2. **Pinecone:** The agent will search your Pinecone index for similar past fixes.
3. **Discord:** A card will appear in your channel with an "Accept & Fix" button.
4. **Action:** Click "Accept & Fix".
5. **GitHub:** A new PR will be created in your repository with an AI-generated code fix and a `POSTMORTEM.md`.
6. **Learning:** Once the PR is created, the solution is stored back in Pinecone for future incidents.

## 6. Customizing the Agent (Prompt Space)

You can customize how the AI thinks and responds by editing the files in the `prompts/` directory:
- `prompts/triage.js`: Define how the agent classifies incidents and reasoning.
- `prompts/fixer.js`: Define how the agent generates technical code fixes.

This allows you to align the agent with your team's specific coding standards and SRE practices.
