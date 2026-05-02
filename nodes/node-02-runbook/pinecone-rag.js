// nodes/node-02-runbook/pinecone-rag.js
// Guardian Node 02 — Pinecone Vector RAG Search

import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import { getEmbedding } from '../shared/ai.js';
import { normalizeErrorSignature } from '../shared/normalize.js';

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'guardian-knowledge';

const pc = new Pinecone({ apiKey: PINECONE_API_KEY });
const SCORE_THRESHOLD = 0.87;

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
        steps: (() => { try { return JSON.parse(match.metadata?.steps || '[]'); } catch { return []; } })(),
        fix_diff: match.metadata?.fix_diff || null,
        root_cause: match.metadata?.root_cause || null,
        pr_url: match.metadata?.pr_url || null,
        source: match.metadata?.source || 'PINECONE',
        relevance: match.score,
        incident_id: match.metadata?.incident_id,
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
      steps: [
        'Check application logs.',
        'Verify environment variables.',
        'Escalate to service owner.'
      ],
      fix_diff: null,
      root_cause: null,
      pr_url: null,
      source: 'LOCAL_FALLBACK',
      relevance: 0.5
    }
  ];
}
