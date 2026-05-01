// nodes/node-03-hitl/index.js
// Guardian Node 03 — HITL Gate (Discord Edition)

import { sendApprovalCard } from './discord-bot.js';

/**
 * Initiates the Human-in-the-Loop process via Discord.
 */
export async function runHITLNode(input) {
  console.log(`💬 Sending incident ${input.incident_id} to Discord for approval...`);
  
  const result = await sendApprovalCard(input);
  
  return {
    ...result,
    hitl_initiated_at: new Date().toISOString()
  };
}

export default async function runNode(input) {
  return await runHITLNode(input);
}
