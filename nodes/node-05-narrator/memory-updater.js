// nodes/node-05-narrator/memory-updater.js
// Guardian Node 05 — Pinecone RAG Memory Updater
// Feeds successful fixes back into Pinecone for future retrieval

import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import { getEmbedding } from '../shared/ai.js';

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'guardian-knowledge';

const pc = new Pinecone({ apiKey: PINECONE_API_KEY });

/**
 * Updates Pinecone RAG with the latest successful fix.
 */
export async function updateAgentMemory(incidentData) {
  if (!PINECONE_API_KEY) {
    console.warn('⚠️ No Pinecone API Key. Memory update skipped.');
    return { ...incidentData, memory_updated: false };
  }

  const incidentId = incidentData.incident_id || `INC-UNKNOWN-${Date.now()}`;
  const resolution = incidentData.runbooks && incidentData.runbooks[0] && incidentData.runbooks[0].steps 
    ? incidentData.runbooks[0].steps.join(', ') 
    : 'No automated resolution steps recorded.';

  const content = `
    Incident: ${incidentId}
    Service: ${incidentData.service || 'unknown'}
    Technical Error: ${incidentData.reasoning || 'No technical error provided.'}
    Original Code: 
    ${incidentData.original_content || 'N/A'}
    
    Resolution Applied: 
    ${incidentData.ai_fix_suggestion?.new_content || 'N/A'}
    
    Resolution Reasoning: 
    ${incidentData.ai_fix_suggestion?.reasoning || 'No reasoning.'}
    
    GitHub PR: ${incidentData.pr_url || 'N/A'}
  `;

  try {
    console.log(`🧠 Updating Pinecone Memory for ${incidentId}...`);
    
    const index = pc.index(INDEX_NAME);
    
    // 1. Generate embedding for the new knowledge
    const embedding = await getEmbedding(content, pc);
    
    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
      console.warn('⚠️ Could not generate valid embedding. Skipping memory update.');
      return { ...incidentData, memory_updated: false };
    }

    // 2. Upsert to Pinecone
    // Using the 'records' wrapper as some v7 sub-versions prefer this format
    await index.upsert({
      records: [{
        id: incidentId,
        values: embedding,
        metadata: {
          title: `Historical Fix: ${incidentId} - ${incidentData.service || 'unknown'}`,
          content: content,
          service: incidentData.service || 'unknown',
          incident_id: incidentId,
          source: 'HISTORICAL_FIX',
          created_at: new Date().toISOString()
        }
      }]
    });

    return { 
      ...incidentData, 
      incident_id: incidentId,
      memory_updated: true, 
      memory_indexed_at: new Date().toISOString() 
    };

  } catch (error) {
    console.error('❌ Memory Update Error:', error);
    return { ...incidentData, memory_updated: false, error: error.message };
  }
}
