// nodes/node-04-warroom/github-fixer.js
// Guardian Node 04 — GitHub PR Automator (LLM-Guided Auditor Edition)

import { Octokit } from 'octokit';
import dotenv from 'dotenv';
import { callLLM } from '../shared/ai.js';
import { fixerPrompt as userPromptFunc } from '../../prompts/fixer.js';

dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;

const SYSTEM_INSTRUCTIONS = `
You are a Senior Software Engineer and SRE.
Your task is to provide a technical code fix or configuration change.
You MUST return a JSON object with 'file_path', 'new_content', and 'reasoning'.
Do NOT include any preamble or conversational text.
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
async function getCandidatePaths(keywords, service) {
  const candidates = new Set();
  
  // 1. Search for technical keywords
  try {
    const q = `${keywords.join(' ')} repo:${REPO_OWNER}/${REPO_NAME}`;
    const { data: results } = await octokit.rest.search.code({ q });
    results.items.forEach(item => candidates.add(item.path));
  } catch (e) {
    console.warn('⚠️ GitHub Search API limit or failure.');
  }

  // 2. Always crawl the tree for architectural context
  try {
    const { data: tree } = await octokit.rest.git.getTree({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      tree_sha: 'main',
      recursive: true
    });
    
    // Add files that match the service name or keywords in their path
    tree.tree.forEach(f => {
      if (f.type !== 'blob' || f.path.includes('node_modules') || f.path.includes('.git')) return;
      const lowerPath = f.path.toLowerCase();
      if (lowerPath.includes(service.toLowerCase()) || keywords.some(k => lowerPath.includes(k.toLowerCase()))) {
        candidates.add(f.path);
      }
      // Also add common entry points if not already there
      if (['package.json', 'server.js', 'app.js', 'index.js'].includes(f.path)) {
        candidates.add(f.path);
      }
    });
  } catch (e) {
    console.error('❌ Failed to fetch repo tree:', e.message);
  }

  return Array.from(candidates);
}

export async function createFixPR(incidentData) {
  if (!process.env.GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    console.error('❌ GitHub credentials missing. Skipping PR creation.');
    return { ...incidentData, pr_status: 'SKIPPED_NO_AUTH' };
  }

  const branchName = `guardian/fix-${incidentData.incident_id.toLowerCase()}`;
  const baseBranch = 'main';
  let currentContent = null;
  let aiFix = { file_path: 'N/A', new_content: '', reasoning: 'AI could not identify a fix.' };

  try {
    // Phase 1: Keyword Extraction
    console.log('🕵️ Phase 1: Identifying technical search keywords...');
    const keywordsRaw = await callLLM({ 
      prompt: `Based on this technical error, return 3 comma-separated keywords or symbols to find the relevant code: ${incidentData.reasoning}`, 
      systemPrompt: 'Return only keywords. Prioritize specific error strings or function names.',
      responseFormat: 'text' 
    });
    const keywords = keywordsRaw.split(',').map(k => k.trim());

    // Phase 2: Path Discovery & LLM Ranking
    console.log('🕵️ Phase 2: Discovering and ranking candidate files...');
    const allPaths = await getCandidatePaths(keywords, incidentData.service);
    
    const rankingPrompt = `
      You are an expert SRE. Given the incident below, identify which file is the most likely source of the bug.
      
      INCIDENT: ${incidentData.reasoning}
      SERVICE: ${incidentData.service}
      
      REPOSITORY FILES:
      ${allPaths.join('\n')}
      
      Return the top 5 most relevant paths, one per line. Focus on files likely to contain database connection logic or the service name.
    `;

    const rankedPathsRaw = await callLLM({ 
      prompt: rankingPrompt, 
      systemPrompt: 'Return only a list of file paths.',
      responseFormat: 'text' 
    });
    const rankedPaths = rankedPathsRaw.split('\n').map(p => p.trim()).filter(p => p && allPaths.includes(p)).slice(0, 5);
    
    console.log(`🎯 AI selected top candidates for audit: ${rankedPaths.join(', ')}`);

    // Phase 3: Deep Audit & Fix
    console.log('🕵️ Phase 3: Auditing code and generating fix...');
    const audits = await Promise.all(rankedPaths.map(async (path) => {
      const content = await getFileContent(path);
      return `FILE: ${path}\nCONTENT:\n${content || 'Empty'}\n---`;
    }));

    const auditPrompt = `
      ${userPromptFunc(incidentData)}
      
      You have audited the following files from the repository:
      ${audits.join('\n')}
      
      TASK:
      1. Find the specific bug in the code that matches the technical error: ${incidentData.reasoning}.
      2. If you find multiple potential issues, fix the most critical one first.
      3. Return a JSON object with 'file_path', 'new_content', and 'reasoning'.
    `;

    aiFix = await callLLM({ 
      prompt: auditPrompt, 
      systemPrompt: SYSTEM_INSTRUCTIONS,
      responseFormat: 'json_object' 
    });

    currentContent = await getFileContent(aiFix.file_path);

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
**Status:** ${fixApplied ? 'RESOLVED' : 'AWAITING_MANUAL_FIX'} (Automated Pipeline)

## 🚨 Incident Summary
- **Service:** ${incidentData.service}
- **Severity:** ${incidentData.severity}

## 🔍 Root Cause Analysis
${incidentData.reasoning}

## 🛠️ ${fixApplied ? 'Applied Code Fix' : 'Suggested Code Fix (Manual Needed)'}
**File:** \`${aiFix.file_path || 'N/A'}\`
**Reasoning:** ${aiFix.reasoning || 'N/A'}

\`\`\`
${aiFix.new_content || 'No technical fix generated.'}
\`\`\`

## ✅ Audit Trail
- **Approver:** ${incidentData.hitl?.approver || 'Human-in-the-Loop'}
- **Decision:** ACCEPTED
- **PR Created At:** ${new Date().toISOString()}
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
    return { ...incidentData, pr_status: 'FAILED', error: error.message };
  }
}
