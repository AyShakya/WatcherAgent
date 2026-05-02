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
<<<<<<< HEAD
import { saveIncident, getIncident, removeIncident } from './services/incident-store.js';
=======
import { saveIncident, getIncident, removeIncident, getAllIncidents } from './services/incident-store.js';
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff

dotenv.config();

const app = express();
app.use(express.json());

<<<<<<< HEAD
const PORT = process.env.PORT || 3000;
const INTERNAL_TOKEN = process.env.INTERNAL_CALLBACK_SECRET;

if (!INTERNAL_TOKEN) {
  console.error('❌ INTERNAL_CALLBACK_SECRET is not set. /internal/discord-approve is disabled.');
  process.exit(1);
}

function requireInternalToken(req, res, next) {
  const token = req.headers['x-internal-token'];

  if (!token || token !== INTERNAL_TOKEN) {
    console.warn(`⚠️ Unauthorized attempt on /internal/discord-approve from ${req.ip}`);
=======
const PORT = process.env.PORT || 3001;
const INTERNAL_TOKEN = process.env.INTERNAL_CALLBACK_SECRET;

if (!INTERNAL_TOKEN) {
  console.warn('⚠️  INTERNAL_CALLBACK_SECRET is not set. /internal/* routes will accept any token (dev mode only).');
}

function requireInternalToken(req, res, next) {
  // If no secret is configured (dev mode), skip token check
  if (!INTERNAL_TOKEN) { next(); return; }

  const token = req.headers['x-internal-token'];
  if (!token || token !== INTERNAL_TOKEN) {
    console.warn(`⚠️ Unauthorized attempt on internal route from ${req.ip}`);
>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

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

  const PIPELINE_TIMEOUT = parseInt(process.env.PIPELINE_TIMEOUT_MS || '90000', 10);
  const pipelinePromise = (async () => {
    const triageInput = validate(T1In, payload, 'Node1 input');
    const triage = validate(T1Out, await runTriageNode(triageInput), 'Node1 output');

    const runbookInput = validate(T2In, triage, 'Node2 input');
    const runbook = validate(T2Out, await runRunbookNode(runbookInput), 'Node2 output');

    const hitl = validate(T3Out, await runHITLNode(runbook), 'Node3 output');

    await saveIncident(hitl.incident_id, hitl);
    return hitl;
  })();

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Pipeline timeout')), PIPELINE_TIMEOUT);
  });

  try {
    const hitl = await Promise.race([pipelinePromise, timeoutPromise]);

    res.status(202).json({
      status: 'initiated',
      incident_id: hitl.incident_id,
      severity: hitl.severity
    });
  } catch (error) {
    if (error.message === 'Pipeline timeout') {
      console.error(`❌ Pipeline Entry Failed: ${error.message} after ${PIPELINE_TIMEOUT}ms`);
      return res.status(504).json({ error: 'Pipeline timed out' });
    }

    console.error('❌ Pipeline Entry Failed:', error.message);
    res.status(500).json({ error: 'Pipeline failed to initiate' });
  }
});

/**
 * DISCORD APPROVAL CALLBACK
 * Triggered when a human clicks "Accept & Fix".
 */
app.post('/internal/discord-approve', requireInternalToken, async (req, res) => {
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

    await removeIncident(incident_id);

    if (fix.pr_status === 'FAILED' || fix.pr_status === 'FAILED_NO_CODE') {
      console.error(`❌ Fix execution failed: ${fix.error || fix.pr_status}`);
      return res.status(500).json({
        status: 'failed',
        reason: fix.pr_status,
        error: fix.error || 'PR creation failed',
        incident_id
      });
    }

    if (fix.pr_status === 'FAILED_INVALID_PATH') {
      console.error(`❌ Fix execution failed: ${fix.pr_status}`);
      return res.status(422).json({
        status: 'failed',
        reason: 'AI could not locate the file to fix',
        incident_id
      });
    }

    console.log(`🚀 Fix deployed successfully: ${learned.pr_url}`);
    return res.status(200).json({
      status: 'success',
      pr: learned.pr_url,
      incident_id
    });
  } catch (error) {
    console.error('❌ Fix Execution Pipeline Crashed:', error.message);
    res.status(500).json({ error: 'Failed to deploy fix' });
  }
});

<<<<<<< HEAD
=======
/**
 * INCIDENTS API — consumed by the Watcher UI dashboard
 */
app.get('/api/incidents', async (req, res) => {
  res.json(await getAllIncidents());
});

app.get('/api/incidents/:id', async (req, res) => {
  const incident = await getIncident(req.params.id);
  if (!incident) return res.status(404).json({ error: 'Not found' });
  res.json(incident);
});

/**
 * DISCORD IGNORE CALLBACK
 */
app.post('/internal/discord-ignore', requireInternalToken, async (req, res) => {
  const { incident_id } = req.body;
  console.log(`🗑️ Incident ${incident_id} ignored. Removing from store.`);
  await removeIncident(incident_id);
  res.json({ status: 'ignored', incident_id });
});

>>>>>>> e19f96c5ecd53a217f15a751e8cc1f73116861ff
try {
  await loginBot();
} catch (error) {
  console.error(`❌ Discord bot failed to initialize: ${error.message}`);
}

app.listen(PORT, () => {
  console.log(`🚀 Guardian AI SRE running at http://localhost:${PORT}`);
});
