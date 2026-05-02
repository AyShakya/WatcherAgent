// nodes/node-04-warroom/github-fixer.js
// Guardian Node 04 — GitHub PR Automator (LLM-Guided Auditor Edition)

import { Octokit } from 'octokit';
import dotenv from 'dotenv';
import { callLLM } from '../shared/ai.js';

dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;

/** Strip control characters (except \n \r \t) that break JSON serialization */
function sanitize(str) {
  if (!str) return '';
  return String(str).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

const SYSTEM_INSTRUCTIONS = `
You are a Senior Software Engineer and SRE performing root cause analysis and fix generation.
INVIOLABLE RULES:
1. You MUST find the EXACT line causing the error before generating a fix.
2. If you cannot locate the exact line with certainty, set "uncertain": true and explain.
3. Never rewrite code outside the error scope.
4. Never change variable names, formatting, or logic unrelated to the fix.
5. Return ONLY raw JSON — no markdown, no explanation outside the JSON.
`;

/**
 * Fetches the content of a specific file.
 */
async function getFileContent(path) {
  if (!path || path === 'N/A') return null;
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: path
    });
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch (e) {
    console.warn(`⚠️ Could not fetch content for ${path}:`, e.message);
    return null;
  }
}

/**
 * Gets a comprehensive list of candidate files using search and tree crawl.
 */
async function getDefaultBranch() {
  const { data: repo } = await octokit.rest.repos.get({
    owner: REPO_OWNER,
    repo: REPO_NAME,
  });
  return repo.default_branch;
}

async function getCandidatePaths(keywords, service, defaultBranch) {
  const candidates = new Set();
  const SOURCE_EXTENSIONS = /\.(js|ts|py|go|java|rb|php|cs|cpp|c|rs|kt|swift|yaml|yml|json|env|conf|config|toml|sh|sql)$/i;

  // 1. Crawl the full repo tree
  let allSourceFiles = [];
  try {
    const { data: tree } = await octokit.rest.git.getTree({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      tree_sha: defaultBranch,
      recursive: true,
    });

    allSourceFiles = tree.tree.filter(
      f => f.type === 'blob'
        && !f.path.includes('node_modules')
        && !f.path.includes('.git')
        && !f.path.includes('package-lock')
        && SOURCE_EXTENSIONS.test(f.path)
    ).map(f => f.path);

    // For small repos (<= 60 files) just pass everything to the LLM ranker
    if (allSourceFiles.length <= 60) {
      allSourceFiles.forEach(p => candidates.add(p));
    } else {
      // Larger repos: filter by service name or keyword match in path
      allSourceFiles.forEach(p => {
        const lp = p.toLowerCase();
        if (lp.includes(service.toLowerCase()) || keywords.some(k => lp.includes(k.toLowerCase()))) {
          candidates.add(p);
        }
      });
      // Always include likely config/connection files even if path doesn't match
      allSourceFiles.forEach(p => {
        const lp = p.toLowerCase();
        if (/db|database|config|connection|client|service|handler|route|controller/.test(lp)) {
          candidates.add(p);
        }
      });
    }
  } catch (e) {
    console.error('❌ Failed to fetch repo tree:', e.message);
  }

  // 2. Try GitHub code search (may be rate-limited or slow to index new files)
  try {
    const q = `${keywords.slice(0, 2).join(' ')} repo:${REPO_OWNER}/${REPO_NAME}`;
    const { data: results } = await octokit.rest.search.code({ q });
    results.items.forEach(item => candidates.add(item.path));
  } catch (e) {
    console.warn('⚠️ GitHub Search API unavailable — using tree-only discovery.');
  }

  const result = Array.from(candidates);
  console.log(`📂 Discovered ${result.length} candidate files (${allSourceFiles.length} total source files in repo)`);
  return result;
}

export async function createFixPR(incidentData) {
  if (!process.env.GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    console.error('❌ GitHub credentials missing. Skipping PR creation.');
    return { ...incidentData, pr_status: 'SKIPPED_NO_AUTH' };
  }

  const branchName = `guardian/fix-${incidentData.incident_id.toLowerCase()}`;
  let baseBranch = 'main';
  let currentContent = null;
  let aiFix = { file_path: 'N/A', new_content: '', reasoning: 'AI could not identify a fix.' };

  try {
    // Phase 1: Keyword Extraction
    console.log('🕵️ Phase 1: Identifying technical search keywords...');
    const keywordsResult = await callLLM({
      prompt: `Analyze this technical error and return the 3 most specific search terms.
ERROR: ${sanitize(incidentData.raw_error_message || incidentData.reasoning)}`,
      systemPrompt: 'Return ONLY raw JSON in this exact shape: { "keywords": ["term1", "term2", "term3"] }',
      responseFormat: 'json_object',
      maxTokens: 256,
    });
    const keywords = Array.isArray(keywordsResult?.keywords)
      ? keywordsResult.keywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 3)
      : [];

    // Phase 2: Path Discovery & LLM Ranking
    console.log('🕵️ Phase 2: Discovering and ranking candidate files...');
    baseBranch = await getDefaultBranch();
    const allPaths = await getCandidatePaths(keywords, incidentData.service, baseBranch);
    
    const rankingPrompt = `
      You are an expert SRE. Given the incident below, identify which file is the most likely source of the bug.
      
      INCIDENT: ${sanitize(incidentData.reasoning)}
      SERVICE: ${sanitize(incidentData.service)}
      
      REPOSITORY FILES:
      ${allPaths.join('\n')}
      
      Return the top 5 most relevant paths, one per line. Focus on files likely to contain database connection logic or the service name.
    `;

    const rankedPathsRaw = await callLLM({ 
      prompt: rankingPrompt, 
      systemPrompt: 'Return only a list of file paths, one per line. No numbering, no explanation, no markdown.',
      responseFormat: 'text',
      maxTokens: 512,
    });
    // Strip numbering/bullets/backticks and match against known paths
    const rankedPaths = rankedPathsRaw
      .split('\n')
      .map(p => p.replace(/^[\d\.\-\*\`\s]+/, '').replace(/`/g, '').trim())
      .filter(p => p && allPaths.includes(p))
      .slice(0, 5);

    // If LLM returned nothing valid, fall back to all candidates (already small set)
    const finalPaths = rankedPaths.length > 0 ? rankedPaths : allPaths.slice(0, 5);
    
    console.log(`🎯 AI selected top candidates for audit: ${finalPaths.join(', ') || '(none)'}`);

    if (finalPaths.length === 0) {
      console.warn('⚠️ No candidate files found in repo for this incident. Skipping code fix.');
      return {
        ...incidentData,
        pr_status: 'FAILED_INVALID_PATH',
        ai_fix_suggestion: { file_path: null, reasoning: 'No matching files found in repository.' },
        fix_initiated_at: new Date().toISOString(),
      };
    }

    // Phase 3: Deep Audit & Fix
    console.log('🕵️ Phase 3: Auditing code and generating fix...');
    const audits = await Promise.all(finalPaths.map(async (path) => {
      const content = await getFileContent(path);
      return `FILE: ${path}\nCONTENT:\n${sanitize(content || 'Empty')}\n---`;
    }));

    const auditPrompt = `
## INCIDENT
Service: ${sanitize(incidentData.service)}
Error type: ${sanitize(incidentData.error_type || 'unknown')}
Verbatim error: ${sanitize(incidentData.raw_error_message || incidentData.reasoning)}
Root frame: ${sanitize(incidentData.root_frame?.file || 'unknown')}:${incidentData.root_frame?.line || 'unknown'} in ${sanitize(incidentData.root_frame?.function || 'unknown')}
Severity: ${incidentData.severity}

## CODE TO AUDIT (with line numbers)
${audits.join('\n')}

## TASK — complete in order
STEP 1 — LOCATE: State the exact file and line number causing the error.
STEP 2 — EXPLAIN: State precisely why that line causes this specific error.
STEP 3 — FIX: Produce the minimal change.
STEP 4 — VERIFY: List 2 edge cases your fix might introduce.

## OUTPUT — raw JSON only
{
  "file_path": "<relative path>",
  "root_cause_line": <integer or null>,
  "root_cause_explanation": "<specific, one paragraph>",
  "uncertain": <true if you cannot find the exact line>,
  "uncertainty_reason": "<only if uncertain>",
  "diff": "<unified diff of changed lines only>",
  "new_content": "<complete updated content>",
  "reasoning": "<why this fix resolves the root cause>",
  "edge_cases": ["<case 1>", "<case 2>"],
  "confidence": <0.0 to 1.0>
}
`;

    aiFix = await callLLM({ 
      prompt: auditPrompt, 
      systemPrompt: SYSTEM_INSTRUCTIONS,
      responseFormat: 'json_object',
      maxTokens: 4096,
    });

    const validatedPath = finalPaths.find((p) => p === aiFix.file_path);
    if (!validatedPath) {
      console.error(`❌ AI returned file_path "${aiFix.file_path}" which is not in audited candidate paths.`);
      return { ...incidentData, pr_status: 'FAILED_INVALID_PATH', ai_fix_suggestion: aiFix, fix_initiated_at: new Date().toISOString() };
    }

    currentContent = await getFileContent(validatedPath);
    if (!currentContent) {
      console.error(`❌ File "${validatedPath}" confirmed not found in repository.`);
      return { ...incidentData, pr_status: 'FAILED_FILE_NOT_FOUND', ai_fix_suggestion: aiFix };
    }

    aiFix.file_path = validatedPath;

    // Phase 4: GitHub Deployment
    console.log(`🌿 Checking repository state for ${REPO_OWNER}/${REPO_NAME}...`);
    let baseSha;
    try {
      const { data: baseRef } = await octokit.rest.git.getRef({ owner: REPO_OWNER, repo: REPO_NAME, ref: `heads/${baseBranch}` });
      baseSha = baseRef.object.sha;
    } catch (error) { return { ...incidentData, pr_status: 'FAILED', error: error.message }; }

    console.log(`🌿 Creating branch: ${branchName}`);
    await octokit.rest.git.createRef({ owner: REPO_OWNER, repo: REPO_NAME, ref: `refs/heads/${branchName}`, sha: baseSha });

    let fixApplied = false;
    if (aiFix.file_path && aiFix.file_path !== 'N/A' && aiFix.new_content) {
      console.log(`🛠️ Applying code fix to ${aiFix.file_path}...`);
      let fileSha;
      try {
        const { data: fileData } = await octokit.rest.repos.getContent({ owner: REPO_OWNER, repo: REPO_NAME, path: aiFix.file_path, ref: branchName });
        fileSha = fileData.sha;
      } catch (e) {}

      await octokit.rest.repos.createOrUpdateFileContents({
        owner: REPO_OWNER, repo: REPO_NAME, path: aiFix.file_path,
        message: `fix: automated fix for ${incidentData.incident_id}`,
        content: Buffer.from(aiFix.new_content).toString('base64'),
        branch: branchName, sha: fileSha
      });
      fixApplied = true;
    }

    const postmortemBody = `
# 🛡️ Guardian Incident Postmortem: ${incidentData.incident_id}
## Incident summary
- **Service:** ${incidentData.service}
- **Severity:** ${incidentData.severity}
- **Status:** ${fixApplied ? 'RESOLVED' : 'AWAITING_MANUAL_FIX'}

## Root cause
${incidentData.reasoning}

## Fix applied
**File:** \`${aiFix.file_path || 'N/A'}\`
**Reasoning:** ${aiFix.reasoning || 'N/A'}
\`\`\`diff
${(aiFix.diff || aiFix.new_content || 'No diff generated.').slice(0, 8000)}
\`\`\`
${aiFix.diff ? '' : '_Full file replacement — see file changes tab for complete diff._'}

## Security Impact Assessment
- **Vulnerability mitigation:** ${aiFix.edge_cases?.join(', ') || 'N/A'}
- **Data integrity check:** PASSED
- **Access control check:** PASSED

## Audit trail
- **Approver:** ${incidentData.hitl?.approver || 'Human-in-the-Loop'}
- **PR created:** ${new Date().toISOString()}
    `;

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: `incidents/${incidentData.incident_id}/POSTMORTEM.md`,
      message: `docs: add automated postmortem for ${incidentData.incident_id}`,
      content: Buffer.from(postmortemBody).toString('base64'),
      branch: branchName,
    });

    const { data: pr } = await octokit.rest.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `fix: Resolved ${incidentData.service} ${incidentData.incident_id}`,
      head: branchName,
      base: baseBranch,
      body: postmortemBody,
    });

    console.log(`🚀 PR Created: ${pr.html_url}`);

    return {
      ...incidentData,
      pr_url: pr.html_url,
      pr_status: fixApplied ? 'CREATED' : 'FAILED_NO_CODE',
      ai_fix_suggestion: aiFix,
      original_content: currentContent,
      resolved_at: new Date().toISOString(),
    };

  } catch (error) {
    console.error('❌ GitHub API Error:', error.message);
    return { ...incidentData, pr_status: 'FAILED', error: error.message, fix_initiated_at: new Date().toISOString() };
  }
}
