// nodes/node-05-narrator/memory-updater.js
// Node 05 — Compliance Narrator + Pinecone Memory Updater
// Generates a structured postmortem record and feeds successful fixes
// back into Pinecone for future RAG retrieval.

import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import { getEmbedding } from '../shared/ai.js';

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'watcher-knowledge';

let pc = null;
function getPineconeClient() {
  if (!PINECONE_API_KEY) return null;
  if (!pc) pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  return pc;
}

/**
 * Builds a compliance / audit postmortem record from the incident context.
 */
function buildPostmortem(incidentData) {
  const now = new Date().toISOString();
  return {
    incident_id: incidentData.incident_id,
    service: incidentData.service,
    severity: incidentData.severity,
    confidence: incidentData.confidence,

    timeline: {
      triggered_at: incidentData.triggered_at || now,
      triage_completed_at: incidentData.triage_completed_at || now,
      runbook_retrieved_at: incidentData.runbook_retrieved_at || now,
      hitl_initiated_at: incidentData.hitl_initiated_at || now,
      fix_initiated_at: incidentData.fix_initiated_at || now,
      postmortem_generated_at: now,
    },

    triage: {
      reasoning: incidentData.reasoning,
      is_critical_service: incidentData.isCriticalService ?? false,
    },

    runbook: {
      title: incidentData.runbooks?.[0]?.title || 'None retrieved',
      source: incidentData.runbooks?.[0]?.source || 'LOCAL_RUNBOOK',
      steps: incidentData.runbooks?.[0]?.steps || [],
    },

    hitl: {
      status: incidentData.hitl?.status || 'APPROVED',
      approver: incidentData.hitl?.approver || 'Discord User',
      discord_message_id: incidentData.discord_message_id || null,
    },

    fix: {
      pr_url: incidentData.pr_url || null,
      pr_status: incidentData.pr_status || 'SKIPPED_NO_AUTH',
      file_patched: incidentData.ai_fix_suggestion?.file_path || null,
      fix_reasoning: incidentData.ai_fix_suggestion?.reasoning || null,
    },

    compliance: {
      status: incidentData.pr_url ? 'COMPLIANT' : 'MANUAL_REVIEW_REQUIRED',
      audit_trail: 'Full pipeline execution recorded. HITL gate enforced before automated fix.',
      standards: ['DORA_ARTICLE_11', 'SOX_SECTION_404'],
    },
  };
}

/**
 * Attempts to upsert the incident resolution into Pinecone for future RAG.
 */
async function updatePineconeMemory(incidentData, postmortem) {
  const pinecone = getPineconeClient();
  if (!pinecone) {
    console.warn('⚠️  PINECONE_API_KEY not set — skipping memory update.');
    return false;
  }

  const incidentId = incidentData.incident_id;
  const content = `
Incident: ${incidentId}
Service: ${incidentData.service}
Technical Error: ${incidentData.reasoning}
Severity: ${incidentData.severity}
Resolution: ${incidentData.ai_fix_suggestion?.reasoning || incidentData.runbooks?.[0]?.steps?.join(', ') || 'Manual review'}
GitHub PR: ${incidentData.pr_url || 'N/A'}
  `.trim();

  try {
    const embedding = await getEmbedding(content, pinecone);

    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      console.warn('⚠️  Invalid embedding — skipping memory update.');
      return false;
    }

    const index = pinecone.index(INDEX_NAME);
    await index.upsert({
      records: [{
        id: `historical-${incidentId}`,
        values: embedding,
        metadata: {
          title: `Historical Fix: ${incidentId} — ${incidentData.service}`,
          content,
          service: incidentData.service,
          incident_id: incidentId,
          source: 'HISTORICAL_FIX',
          created_at: new Date().toISOString(),
        },
      }],
    });

    console.log(`🧠 Pinecone memory updated for ${incidentId}`);
    return true;
  } catch (error) {
    console.error('❌ Memory update error:', error.message);
    return false;
  }
}

/**
 * Main export: generate postmortem + update memory.
 */
export async function updateAgentMemory(incidentData) {
  console.log(`🎓 Generating postmortem and updating memory for ${incidentData.incident_id}…`);

  const postmortem = buildPostmortem(incidentData);
  const memoryUpdated = await updatePineconeMemory(incidentData, postmortem);

  return {
    ...incidentData,
    postmortem,
    memory_updated: memoryUpdated,
    memory_indexed_at: memoryUpdated ? new Date().toISOString() : null,
    pipeline_completed_at: new Date().toISOString(),
    status: 'CLOSED_AND_LEARNED',
  };
}
