// nodes/node-02-runbook/index.js
// Guardian Node 02 — Runbook Agent (Pinecone Edition)

import { searchRunbooks } from './pinecone-rag.js';

/**
 * Fetches relevant runbooks and past fixes using Pinecone RAG.
 */
export async function fetchRunbook(input) {
  const { service, reasoning } = input;
  
  const results = await searchRunbooks(service, reasoning);
  
  return {
    ...input,
    runbooks: results.map(r => ({
      title: r.title,
      steps: r.content.split('\n').map(step => step.trim()).filter(Boolean),
      source: r.source,
      relevance: r.relevance
    })),
    runbook_retrieved_at: new Date().toISOString()
  };
}

export default async function runRunbookNode(input) {
  return await fetchRunbook(input);
}
