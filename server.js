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
import { loginBot } from './nodes/node-03-hitl/discord-bot.js';

// Services
import { saveIncident, getIncident, removeIncident } from './services/incident-store.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

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
    const triage = await runTriageNode(payload);
    const runbook = await runRunbookNode(triage);
    const hitl = await runHITLNode(runbook);

    saveIncident(hitl.incident_id, hitl);

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
  
  const incident = getIncident(incident_id);

  if (!incident) {
    console.error(`❌ Incident ${incident_id} not found in memory store.`);
    return res.status(404).json({ error: 'Incident not found' });
  }

  try {
    console.log(`✅ Approval processed. Executing fix pipeline...`);
    incident.hitl = { ...incident.hitl, status: 'APPROVED', approver };

    const fix = await runFixerNode(incident);
    const learned = await runMemoryNode(fix);

    if (fix.pr_status === 'FAILED') {
      console.error(`❌ Fix execution failed: ${fix.error}`);
    } else {
      console.log(`🚀 Fix deployed successfully: ${learned.pr_url}`);
    }

    removeIncident(incident_id);
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
