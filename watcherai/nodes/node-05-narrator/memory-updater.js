// nodes/node-05-narrator/memory-updater.js
// Guardian Node 05 — Pinecone RAG Memory Updater
// Feeds successful fixes back into Pinecone for future retrieval

import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import { getEmbedding } from '../shared/ai.js';
import { normalizeErrorSignature } from '../shared/normalize.js';

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'watcher-knowledge';

// Lazy-init: only create client if key is present to avoid crash on startup
let pc = null;
function getPineconeClient() {
  if (!PINECONE_API_KEY) return null;
  if (!pc) pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  return pc;
}

/**
 * Updates Pinecone RAG with the latest successful fix.
 */
export async function updateAgentMemory(incidentData) {
  if (!PINECONE_API_KEY) {
    console.warn('⚠️ No Pinecone API Key. Memory update skipped.');
    return { ...incidentData, memory_updated: false };
  }

  if (
    incidentData.runbooks?.[0]?.source === 'LOCAL_FALLBACK' ||
    incidentData.runbooks?.[0]?.source === 'CACHED_FALLBACK'
  ) {
    console.warn('⚠️ Skipping memory update — resolution came from fallback, not a real fix.');
    return { ...incidentData, memory_updated: false, skip_reason: 'FALLBACK_SOURCE' };
  }

  if (!incidentData.pr_url || incidentData.pr_status !== 'CREATED') {
    console.warn('⚠️ Skipping memory update — no verified PR was created.');
    return { ...incidentData, memory_updated: false, skip_reason: 'NO_VERIFIED_FIX' };
  }

  const incidentId = incidentData.incident_id || `INC-UNKNOWN-${Date.now()}`;
  const normalizedSignature = normalizeErrorSignature(
    incidentData.raw_error_message || incidentData.reasoning || 'Unknown error'
  );
  const fixSteps = incidentData.ai_fix_suggestion?.reasoning
    ? [incidentData.ai_fix_suggestion.reasoning]
    : [];

  const chunks = [
    {
      id: `${incidentId}::error_signature`,
      embedText: `ERROR ${incidentData.error_type || 'runtime'}: ${normalizedSignature}`,
      metadata: {
        chunk_type: 'error_signature',
        incident_id: incidentId,
        service: incidentData.service || 'unknown',
        normalized_signature: normalizedSignature,
        raw_error: incidentData.reasoning || '',
        priority: incidentData.severity || 'unknown',
        title: `Error: ${normalizedSignature.slice(0, 80)}`,
        steps: JSON.stringify(fixSteps),
        pr_url: incidentData.pr_url || null,
        source: 'HISTORICAL_FIX',
        created_at: new Date().toISOString()
      }
    },
    {
      id: `${incidentId}::root_cause`,
      embedText: `ROOT CAUSE in ${incidentData.service || 'unknown'}: ${incidentData.ai_fix_suggestion?.reasoning || ''}`,
      metadata: {
        chunk_type: 'root_cause',
        incident_id: incidentId,
        service: incidentData.service || 'unknown',
        root_cause: incidentData.ai_fix_suggestion?.reasoning || '',
        title: `Root cause: ${incidentId}`,
        steps: JSON.stringify(fixSteps),
        source: 'HISTORICAL_FIX',
        created_at: new Date().toISOString()
      }
    },
    {
      id: `${incidentId}::fix`,
      embedText: `FIX for ${incidentData.error_type || 'error'} in ${incidentData.service || 'unknown'}: ${incidentData.ai_fix_suggestion?.reasoning || ''}`,
      metadata: {
        chunk_type: 'fix',
        incident_id: incidentId,
        service: incidentData.service || 'unknown',
        fix_diff: incidentData.ai_fix_suggestion?.diff || null,
        fix_file: incidentData.ai_fix_suggestion?.file_path || null,
        fix_file_ref: incidentData.ai_fix_suggestion?.file_ref || null,
        fix_reasoning: incidentData.ai_fix_suggestion?.reasoning || '',
        pr_url: incidentData.pr_url || null,
        title: `Fix: ${incidentId}`,
        steps: JSON.stringify(fixSteps),
        source: 'HISTORICAL_FIX',
        created_at: new Date().toISOString()
      }
    },
    {
      id: `${incidentId}::symptom`,
      embedText: `SYMPTOM ${incidentData.service || 'unknown'} ${incidentData.severity || 'unknown'}: ${incidentData.reasoning || ''}`,
      metadata: {
        chunk_type: 'symptom',
        incident_id: incidentId,
        service: incidentData.service || 'unknown',
        title: `Symptom: ${incidentId}`,
        steps: JSON.stringify(fixSteps),
        source: 'HISTORICAL_FIX',
        created_at: new Date().toISOString()
      }
    }
  ];

  try {
    const pinecone = getPineconeClient();
    if (!pinecone) {
      console.warn('⚠️  PINECONE_API_KEY not set — skipping memory update.');
      return { ...incidentData, memory_updated: false, skip_reason: 'NO_PINECONE_KEY' };
    }

    console.log(`🧠 Updating Pinecone Memory for ${incidentId} with ${chunks.length} chunks...`);

    const index = pinecone.index(INDEX_NAME);
    let successCount = 0;

    for (const chunk of chunks) {
      const embedding = await getEmbedding(chunk.embedText, pinecone);
      await index.upsert({
        vectors: [{
          id: chunk.id,
          values: embedding,
          metadata: chunk.metadata
        }]
      });
      successCount += 1;
    }

    return {
      ...incidentData,
      incident_id: incidentId,
      memory_updated: true,
      chunks_stored: successCount,
      memory_indexed_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Memory Update Error:', error);
    return { ...incidentData, memory_updated: false, error: error.message };
  }
}
