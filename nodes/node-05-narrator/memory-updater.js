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

  const content = `
    Incident: ${incidentData.incident_id}
    Service: ${incidentData.service}
    Error: ${incidentData.reasoning}
    Resolution: ${incidentData.runbooks[0]?.steps.join(', ')}
    GitHub PR: ${incidentData.pr_url}
  `;

  try {
    console.log(`🧠 Updating Pinecone Memory for ${incidentData.incident_id}...`);
    
    const index = pc.index(INDEX_NAME);
    
    // 1. Generate embedding for the new knowledge
    const embedding = await getEmbedding(content, pc);
    
    if (!embedding || embedding.length === 0) {
      console.warn('⚠️ Could not generate embedding. Skipping memory update.');
      return { ...incidentData, memory_updated: false };
    }

    // 2. Upsert to Pinecone
    await index.upsert([{
      id: incidentData.incident_id,
      values: embedding,
      metadata: {
        title: `Historical Fix: ${incidentData.incident_id} - ${incidentData.service}`,
        content: content,
        service: incidentData.service,
        incident_id: incidentData.incident_id,
        source: 'HISTORICAL_FIX',
        created_at: new Date().toISOString()
      }
    }]);

    return { 
      ...incidentData, 
      memory_updated: true, 
      memory_indexed_at: new Date().toISOString() 
    };

  } catch (error) {
    console.error('❌ Memory Update Error:', error);
    return { ...incidentData, memory_updated: false, error: error.message };
  }
}
