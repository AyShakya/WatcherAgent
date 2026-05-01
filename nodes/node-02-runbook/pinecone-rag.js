// nodes/node-02-runbook/pinecone-rag.js
// Guardian Node 02 — Pinecone Vector RAG Search

import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import { getEmbedding } from '../shared/ai.js';

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'guardian-knowledge';

const pc = new Pinecone({ apiKey: PINECONE_API_KEY });

/**
 * Queries Pinecone for relevant runbooks and past fixes.
 */
export async function searchRunbooks(service, errorReasoning) {
  if (!PINECONE_API_KEY) {
    console.warn('⚠️ PINECONE_API_KEY not set. Using local knowledge fallback.');
    return getLocalFallback(service);
  }

  const query = `${service} ${errorReasoning} resolution steps and past fixes`;

  try {
    const index = pc.index(INDEX_NAME);
    
    console.log(`🔍 Querying Pinecone RAG for: "${query}"`);
    
    // 1. Generate embedding for the query
    const queryEmbedding = await getEmbedding(query, pc);
    
    // 2. Search Pinecone
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true
    });

    if (queryResponse && queryResponse.matches && queryResponse.matches.length > 0) {
      return queryResponse.matches.map(match => ({
        title: match.metadata?.title || 'Relevant Fix',
        content: match.metadata?.content || '',
        source: match.metadata?.source || 'PINECONE',
        relevance: match.score
      }));
    }

    return getLocalFallback(service);

  } catch (error) {
    console.error('❌ Pinecone RAG Search Error:', error);
    return getLocalFallback(service);
  }
}

function getLocalFallback(service) {
  return [
    {
      title: 'Universal Emergency Procedure',
      content: '1. Check application logs.\\n2. Verify environment variables.\\n3. Escalate to service owner.',
      source: 'LOCAL_FALLBACK',
      relevance: 0.5
    }
  ];
}
