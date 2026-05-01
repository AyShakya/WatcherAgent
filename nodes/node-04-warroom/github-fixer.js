// nodes/node-04-warroom/github-fixer.js
// Guardian Node 04 — GitHub PR Automator

import { Octokit } from 'octokit';
import dotenv from 'dotenv';
import { callLLM } from '../shared/ai.js';
import { fixerPrompt as userPromptFunc } from '../../prompts/fixer.js';

dotenv.config();

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const REPO_NAME = process.env.GITHUB_REPO_NAME;

const SYSTEM_INSTRUCTIONS = `
You are a Senior Software Engineer.
Your task is to provide a technical code fix or configuration change.
Return ONLY the technical solution. If you cannot provide code, provide clear technical steps.
`;

const BASE_FIX_PROMPT = (data) => `
Fix the following error for service ${data.service}: ${data.reasoning}. 
Use the suggested runbook steps: ${data.runbooks[0]?.steps.join(', ')}.
`;

export async function createFixPR(incidentData) {
  if (!process.env.GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
    console.error('❌ GitHub credentials missing. Skipping PR creation.');
    return { ...incidentData, pr_status: 'SKIPPED_NO_AUTH' };
  }

  const branchName = `guardian/fix-${incidentData.incident_id.toLowerCase()}`;
  const baseBranch = 'main';

  try {
    console.log('🤖 Generating AI code fix suggestion...');
    
    // 1. Get user instructions with fallback
    let userInstructions = '';
    try {
      userInstructions = userPromptFunc(incidentData);
    } catch (e) {
      userInstructions = BASE_FIX_PROMPT(incidentData);
    }

    // 2. Call LLM with System Safety Shell
    const aiFix = await callLLM({ 
      prompt: userInstructions, 
      systemPrompt: SYSTEM_INSTRUCTIONS,
      responseFormat: 'text' 
    });

    console.log(`🌿 Checking repository state for ${REPO_OWNER}/${REPO_NAME}...`);

    let baseSha;
    try {
      const { data: baseRef } = await octokit.rest.git.getRef({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        ref: `heads/${baseBranch}`,
      });
      baseSha = baseRef.object.sha;
    } catch (error) {
      if (error.status === 404) {
        console.error(`❌ Base branch '${baseBranch}' not found. Is the repository empty?`);
        return { 
          ...incidentData, 
          pr_status: 'FAILED', 
          error: `Base branch '${baseBranch}' not found. Please ensure the repository is initialized with at least one commit.` 
        };
      }
      throw error;
    }

    console.log(`🌿 Creating branch: ${branchName} from ${baseSha}`);

    await octokit.rest.git.createRef({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      ref: `refs/heads/${branchName}`,
      sha: baseSha,
    });

    const postmortemBody = `
# 🛡️ Guardian Incident Postmortem: ${incidentData.incident_id}
**Status:** RESOLVED (Automated AI Fix)

## 🚨 Incident Summary
- **Service:** ${incidentData.service}
- **Severity:** ${incidentData.severity}

## 🔍 Root Cause Analysis
${incidentData.reasoning}

## 🛠️ Suggested Code Fix
\`\`\`
${aiFix || 'No technical fix generated. Manual intervention required.'}
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
      pr_status: 'CREATED',
      ai_fix_suggestion: aiFix,
      resolved_at: new Date().toISOString(),
    };

  } catch (error) {
    console.error('❌ GitHub API Error:', error.message);
    return { ...incidentData, pr_status: 'FAILED', error: error.message };
  }
}
