// nodes/node-02-runbook/pinecone-rag.js
// Guardian Node 02 — Pinecone Vector RAG Search

import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import { getEmbedding } from '../shared/ai.js';

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'guardian-knowledge';

const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
const SCORE_THRESHOLD = 0.87;

function normalizeErrorSignature(raw) {
  return raw
    .replace(/0x[0-9a-fA-F]+/g, '<ADDR>')
    .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '<UUID>')
    .replace(/\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?/g, '<TIMESTAMP>')
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '<IP>')
    .replace(/(\.js|\.ts|\.py|\.go|\.java):(\d+)/g, '$1:<LINE>')
    .replace(/:\d{4,5}\b/g, ':<PORT>')
    .trim();
}

/**
 * Queries Pinecone for relevant runbooks and past fixes.
 */
export async function searchRunbooks(service, errorReasoning) {
  if (!PINECONE_API_KEY) {
    console.warn('⚠️ PINECONE_API_KEY not set. Using local knowledge fallback.');
    return getLocalFallback(service);
  }

  const normalizedQuery = normalizeErrorSignature(errorReasoning);

  try {
    const index = pc.index(INDEX_NAME);
    
    console.log(`🔍 Querying Pinecone RAG for service ${service} using normalized error signature: "${normalizedQuery}"`);

    // 1. Generate embedding for the normalized error signature
    const queryEmbedding = await getEmbedding(normalizedQuery, pc);
    
    // 2. Search Pinecone
    const queryFilter = {
      chunk_type: { $eq: 'error_signature' }
    };

    if (service) {
      queryFilter.service = { $eq: service };
    }

    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
      filter: queryFilter
    });

    const matches = queryResponse?.matches || [];
    const highConfidenceMatches = matches.filter(match => (match.score || 0) >= SCORE_THRESHOLD);

    if (highConfidenceMatches.length > 0) {
      return highConfidenceMatches.map(match => ({
        title: match.metadata?.title || 'Historical Fix',
        content: match.metadata?.content || '',
        source: match.metadata?.source || 'PINECONE',
        relevance: match.score,
        incident_id: match.metadata?.incident_id,
        chunk_type: match.metadata?.chunk_type
      }));
    }

    return [];

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
