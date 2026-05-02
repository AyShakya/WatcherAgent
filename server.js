// server.js
// Guardian AI SRE — Universal Orchestrator
import express from 'express';
import dotenv from 'dotenv';

// Node logic
import runTriageNode from './nodes/node-01-triage/index.js';
import runRunbookNode from './nodes/node-02-runbook/index.js';
import runHITLNode from './nodes/node-03-hitl/index.js';
import runFixerNode from './nodes/node-04-warroom/index.js';
import runMemoryNode from './nodes/node-05-narrator/index.js';

import { InputSchema as T1In, OutputSchema as T1Out } from './nodes/node-01-triage/schema.js';
import { InputSchema as T2In, OutputSchema as T2Out } from './nodes/node-02-runbook/schema.js';
import { OutputSchema as T3Out } from './nodes/node-03-hitl/schema.js';
import { OutputSchema as T4Out } from './nodes/node-04-warroom/schema.js';
import { OutputSchema as T5Out } from './nodes/node-05-narrator/schema.js';
import { loginBot } from './nodes/node-03-hitl/discord-bot.js';

// Services
import { saveIncident, getIncident, removeIncident } from './services/incident-store.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

function validate(schema, data, label) {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(`❌ Schema validation failed at ${label}:`, result.error.flatten());
    throw new Error(`Schema violation at ${label}`);
  }

  return result.data;
}

/**
 * WEBHOOK RECEIVER
 * Entry point for deployment/error alerts.
 */
app.post('/webhook', async (req, res) => {
  const payload = req.body;

  if (!payload || Object.keys(payload).length === 0) {
    console.error('❌ Webhook received with empty payload.');
    return res.status(400).json({ error: 'Payload is required' });
  }

  console.log('🛡️ Webhook Received. Initiating Pipeline...');

  try {
    const triageInput = validate(T1In, payload, 'Node1 input');
    const triage = validate(T1Out, await runTriageNode(triageInput), 'Node1 output');

    const runbookInput = validate(T2In, triage, 'Node2 input');
    const runbook = validate(T2Out, await runRunbookNode(runbookInput), 'Node2 output');

    const hitl = validate(T3Out, await runHITLNode(runbook), 'Node3 output');

    await saveIncident(hitl.incident_id, hitl);

    res.status(202).json({
      status: 'initiated',
      incident_id: hitl.incident_id,
      severity: hitl.severity
    });
  } catch (error) {
    console.error('❌ Pipeline Entry Failed:', error.message);
    res.status(500).json({ error: 'Pipeline failed to initiate' });
  }
});

/**
 * DISCORD APPROVAL CALLBACK
 * Triggered when a human clicks "Accept & Fix".
 */
app.post('/internal/discord-approve', async (req, res) => {
  const { incident_id, approver } = req.body;
  console.log(`📩 Received internal approval for incident ${incident_id} from ${approver}`);
  
  const incident = await getIncident(incident_id);

  if (!incident) {
    console.error(`❌ Incident ${incident_id} not found in memory store.`);
    return res.status(404).json({ error: 'Incident not found' });
  }

  try {
    console.log(`✅ Approval processed. Executing fix pipeline...`);
    incident.hitl = { ...incident.hitl, status: 'APPROVED', approver };

    const fix = validate(T4Out, await runFixerNode(incident), 'Node4 output');
    const learned = validate(T5Out, await runMemoryNode(fix), 'Node5 output');

    if (fix.pr_status === 'FAILED') {
      console.error(`❌ Fix execution failed: ${fix.error}`);
    } else {
      console.log(`🚀 Fix deployed successfully: ${learned.pr_url}`);
    }

    await removeIncident(incident_id);
    res.json({ status: 'success', pr: learned.pr_url, error: fix.error });
  } catch (error) {
    console.error('❌ Fix Execution Pipeline Crashed:', error.message);
    res.status(500).json({ error: 'Failed to deploy fix' });
  }
});

try {
  await loginBot();
} catch (error) {
  console.error(`❌ Discord bot failed to initialize: ${error.message}`);
}

app.listen(PORT, () => {
  console.log(`🚀 Guardian AI SRE running at http://localhost:${PORT}`);
});
