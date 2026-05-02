// nodes/node-02-runbook/pinecone-rag.js
// Guardian Node 02 — Pinecone Vector RAG Search
// Gracefully falls back to built-in runbooks when Pinecone is unavailable.

import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import { getEmbedding } from '../shared/ai.js';

dotenv.config();

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'watcher-knowledge';

// Lazy-init: only create Pinecone client if we have a key
let pc = null;
function getPineconeClient() {
  if (!PINECONE_API_KEY) return null;
  if (!pc) pc = new Pinecone({ apiKey: PINECONE_API_KEY });
  return pc;
}

/**
 * Queries Pinecone for relevant runbooks and past fixes.
 * Falls back to the built-in runbook library when Pinecone is unavailable.
 */
export async function searchRunbooks(service, errorReasoning) {
  const pinecone = getPineconeClient();

  if (!pinecone) {
    console.warn('⚠️  PINECONE_API_KEY not set — using built-in runbook fallback.');
    return getLocalFallback(service, errorReasoning);
  }

  const query = `${service} ${errorReasoning} resolution steps and past fixes`;

  try {
    const index = pinecone.index(INDEX_NAME);
    console.log(`🔍 Querying Pinecone for: "${query.slice(0, 80)}…"`);

    const queryEmbedding = await getEmbedding(query, pinecone);

    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });

    if (queryResponse?.matches?.length > 0) {
      return queryResponse.matches.map((match) => ({
        title: match.metadata?.title || 'Relevant Fix',
        content: match.metadata?.content || '',
        source: match.metadata?.source || 'PINECONE',
        relevance: match.score,
      }));
    }

    console.warn('⚠️  Pinecone returned no results — using built-in fallback.');
    return getLocalFallback(service, errorReasoning);
  } catch (error) {
    console.error('❌ Pinecone RAG Error:', error.message);
    return getLocalFallback(service, errorReasoning);
  }
}

/**
 * Built-in runbook library keyed by service / error keyword.
 * Gives the pipeline actionable steps even without a Pinecone index.
 */
function getLocalFallback(service, reasoning = '') {
  const s = (service || '').toLowerCase();
  const r = (reasoning || '').toLowerCase();

  // Database / connection issues
  if (r.includes('connection') || r.includes('pool') || r.includes('timeout') || s.includes('db') || s.includes('postgres') || s.includes('mongo')) {
    return [{
      title: 'DB Connection / Pool Exhaustion Runbook',
      content: [
        '1. Check pg_stat_activity or equivalent for active/idle connections.',
        '2. Identify long-running queries and KILL if necessary.',
        '3. Verify DB connection pool settings (max connections, timeout).',
        '4. Restart connection pooler (PgBouncer / RDS Proxy) if applicable.',
        '5. Scale up DB tier or increase pool size in application config.',
        '6. Review recent deployments for connection leak regressions.',
      ].join('\n'),
      source: 'LOCAL_RUNBOOK',
      relevance: 0.85,
    }];
  }

  // OOM / memory issues
  if (r.includes('oom') || r.includes('memory') || r.includes('killed')) {
    return [{
      title: 'OOMKilled / Memory Exhaustion Runbook',
      content: [
        '1. Identify the killed pod/process via kubectl describe pod or dmesg.',
        '2. Check memory usage trend in monitoring (Grafana/CloudWatch).',
        '3. Increase memory limits in Kubernetes deployment spec.',
        '4. Profile application for memory leaks (heap dump if JVM/Node).',
        '5. Add horizontal autoscaling if workload is bursty.',
        '6. Consider moving ML inference to a dedicated GPU node.',
      ].join('\n'),
      source: 'LOCAL_RUNBOOK',
      relevance: 0.85,
    }];
  }

  // Redis / cache issues
  if (r.includes('redis') || r.includes('cache') || s.includes('redis') || s.includes('trading')) {
    return [{
      title: 'Redis Failure / Failover Runbook',
      content: [
        '1. Check Redis cluster status: redis-cli cluster info.',
        '2. Verify replica promotion completed: check master count.',
        '3. Flush stale sessions if session store is corrupted.',
        '4. Restart application pods to re-establish connections.',
        '5. Review Redis maxmemory policy — eviction may have corrupted keys.',
        '6. Enable Redis persistence (AOF/RDB) to prevent future data loss.',
      ].join('\n'),
      source: 'LOCAL_RUNBOOK',
      relevance: 0.85,
    }];
  }

  // Payment / gateway
  if (s.includes('payment') || s.includes('gateway') || s.includes('charge')) {
    return [{
      title: 'Payment Gateway Degradation Runbook',
      content: [
        '1. Check upstream payment provider status page.',
        '2. Verify API keys and credentials have not expired.',
        '3. Review error rate by endpoint — isolate failing operation.',
        '4. Enable circuit breaker / fallback to secondary processor.',
        '5. Alert on-call team and open incident bridge.',
        '6. Capture full error response body for provider support ticket.',
      ].join('\n'),
      source: 'LOCAL_RUNBOOK',
      relevance: 0.80,
    }];
  }

  // Generic fallback
  return [{
    title: 'General Incident Response Runbook',
    content: [
      '1. Check application and infrastructure logs for error patterns.',
      '2. Verify recent deployments — roll back if incident coincides.',
      '3. Check all downstream service health dashboards.',
      '4. Confirm environment variables and secrets are correct.',
      '5. Restart affected pods/processes if safe to do so.',
      '6. Escalate to service owner if not resolved within 15 minutes.',
    ].join('\n'),
    source: 'LOCAL_RUNBOOK',
    relevance: 0.60,
  }];
}
