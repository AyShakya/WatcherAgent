import assert from 'node:assert';
import test from 'node:test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const API_BASE = 'http://localhost:3001/api/v1';
const INTERNAL_SECRET = process.env.INTERNAL_CALLBACK_SECRET || 'orchestration-callback-key-9999';

test('E2E integration test: complete namespace isolation & RAG recall', async (t) => {
  const testId = Math.floor(Math.random() * 1000000);
  const email = `e2e-user-${testId}@example.com`;
  const password = 'password123';
  const name = 'QA Namespace Tester';

  // 1. Register test user
  console.log(`\n1. Registering test user: ${email}...`);
  const signupRes = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  assert.ok(signupRes.status === 200 || signupRes.status === 201);
  const signupData = await signupRes.json();
  const token = signupData.token;
  assert.ok(token);

  // 2. Onboard Project A
  console.log('\n2. Onboarding Project A (Namespace: namespace-a)...');
  const projectPayloadA = {
    name: `Billing Service - Project A - ${testId}`,
    description: 'Project A with isolated namespace-a',
    github_owner: 'test-owner',
    github_repo: 'test-repo',
    github_token: 'ghp_mocktokenA123',
    discord_channel_id: '123456',
    openrouter_key: 'sk-or-mock-key-123',
    pinecone_namespace: 'namespace-a'
  };
  const projResA = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(projectPayloadA)
  });
  assert.ok(projResA.ok);
  const projDataA = await projResA.json();
  const webhookSecretA = projDataA.project.webhook_secret;
  assert.ok(webhookSecretA);

  // 3. Onboard Project B
  console.log('\n3. Onboarding Project B (Namespace: namespace-b)...');
  const projectPayloadB = {
    name: `Billing Service - Project B - ${testId}`,
    description: 'Project B with isolated namespace-b',
    github_owner: 'test-owner',
    github_repo: 'test-repo',
    github_token: 'ghp_mocktokenB456',
    discord_channel_id: '123456',
    openrouter_key: 'sk-or-mock-key-123',
    pinecone_namespace: 'namespace-b'
  };
  const projResB = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(projectPayloadB)
  });
  assert.ok(projResB.ok);
  const projDataB = await projResB.json();
  const webhookSecretB = projDataB.project.webhook_secret;
  assert.ok(webhookSecretB);

  // 4. Trigger alert on Project A (Missing error: ReferenceError: logger is not defined)
  console.log('\n4. Triggering Missing Error on Project A (Should result in LOCAL_RUNBOOK fallback)...');
  const alertPayloadA1 = {
    service: 'user-service',
    severity: 'P1',
    category: 'UNKNOWN',
    message: 'ReferenceError: logger is not defined',
    alert: {
      latencyMs: 150,
      errorRate: 0.05,
      durationMin: 2,
      transactionsAffected: 10
    }
  };

  const alertA1Res = await fetch(`${API_BASE}/webhook/${webhookSecretA}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alertPayloadA1)
  });
  assert.strictEqual(alertA1Res.status, 200);
  const alertA1Data = await alertA1Res.json();
  const incidentIdA1 = alertA1Data.incident_id;
  assert.ok(incidentIdA1);

  // Poll Project A alert until AWAITING_APPROVAL
  let incidentA1 = null;
  for (let i = 0; i < 15; i++) {
    const res = await fetch(`${API_BASE}/incidents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    incidentA1 = (data.incidents || []).find(inc => inc.id === incidentIdA1);
    if (incidentA1 && incidentA1.status === 'AWAITING_APPROVAL') break;
    await new Promise(r => setTimeout(r, 1000));
  }
  assert.strictEqual(incidentA1.status, 'AWAITING_APPROVAL');
  
  // Assert fallback source is used on initial run
  const runbooksA1 = incidentA1.runbook || [];
  assert.ok(runbooksA1.length > 0);
  assert.strictEqual(runbooksA1[0].source, 'LOCAL_RUNBOOK');
  console.log('Incident A1 triaged with LOCAL_RUNBOOK successfully.');

  // Approve Project A incident to resolve and learn
  console.log('\n5. Approving Incident A1 to deploy fix and index in vector store...');
  const approveResA1 = await fetch(`${API_BASE}/callback/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-callback-secret': INTERNAL_SECRET
    },
    body: JSON.stringify({
      incidentId: incidentIdA1,
      action: 'APPROVE',
      comment: 'Approved A1'
    })
  });
  assert.strictEqual(approveResA1.status, 200);

  // Poll until Project A incident is CLOSED_AND_LEARNED
  for (let i = 0; i < 15; i++) {
    const res = await fetch(`${API_BASE}/incidents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    incidentA1 = (data.incidents || []).find(inc => inc.id === incidentIdA1);
    if (incidentA1 && incidentA1.status === 'CLOSED_AND_LEARNED') break;
    await new Promise(r => setTimeout(r, 1000));
  }
  assert.strictEqual(incidentA1.status, 'CLOSED_AND_LEARNED');
  console.log('Incident A1 is successfully CLOSED_AND_LEARNED.');

  // 5. Trigger the same alert on Project B (Different Namespace: namespace-b)
  console.log('\n6. Triggering same error on Project B (Should NOT recall Project A fix, falls back to LOCAL_RUNBOOK)...');
  const alertB1Res = await fetch(`${API_BASE}/webhook/${webhookSecretB}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alertPayloadA1)
  });
  assert.strictEqual(alertB1Res.status, 200);
  const alertB1Data = await alertB1Res.json();
  const incidentIdB1 = alertB1Data.incident_id;
  assert.ok(incidentIdB1);

  // Poll Project B alert until AWAITING_APPROVAL
  let incidentB1 = null;
  for (let i = 0; i < 15; i++) {
    const res = await fetch(`${API_BASE}/incidents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    incidentB1 = (data.incidents || []).find(inc => inc.id === incidentIdB1);
    if (incidentB1 && incidentB1.status === 'AWAITING_APPROVAL') break;
    await new Promise(r => setTimeout(r, 1000));
  }
  assert.strictEqual(incidentB1.status, 'AWAITING_APPROVAL');

  // Verify Project B incident falls back to LOCAL_RUNBOOK and did not recall Project A's fix
  const runbooksB1 = incidentB1.runbook || [];
  assert.ok(runbooksB1.length > 0);
  assert.strictEqual(runbooksB1[0].source, 'LOCAL_RUNBOOK');
  console.log('Confirmed: Project B did NOT recall fix from Project A (isolation verified).');

  // Reject / ignore Project B incident to cleanup
  console.log('Muting Project B incident...');
  const rejectResB1 = await fetch(`${API_BASE}/callback/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-callback-secret': INTERNAL_SECRET
    },
    body: JSON.stringify({
      incidentId: incidentIdB1,
      action: 'REJECT',
      comment: 'Rejected B1'
    })
  });
  assert.strictEqual(rejectResB1.status, 200);

  // 6. Trigger the same alert again on Project A (Namespace: namespace-a)
  console.log('\n7. Triggering same error on Project A again (Should recall HISTORICAL_FIX from vector database)...');
  const alertA2Res = await fetch(`${API_BASE}/webhook/${webhookSecretA}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(alertPayloadA1)
  });
  assert.strictEqual(alertA2Res.status, 200);
  const alertA2Data = await alertA2Res.json();
  const incidentIdA2 = alertA2Data.incident_id;
  assert.ok(incidentIdA2);

  // Poll Project A alert A2 until AWAITING_APPROVAL
  let incidentA2 = null;
  for (let i = 0; i < 15; i++) {
    const res = await fetch(`${API_BASE}/incidents`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    incidentA2 = (data.incidents || []).find(inc => inc.id === incidentIdA2);
    if (incidentA2 && incidentA2.status === 'AWAITING_APPROVAL') break;
    await new Promise(r => setTimeout(r, 1000));
  }
  assert.strictEqual(incidentA2.status, 'AWAITING_APPROVAL');

  // Verify Project A incident A2 recalled the historical fix from index vector database
  const runbooksA2 = incidentA2.runbook || [];
  assert.ok(runbooksA2.length > 0);
  assert.strictEqual(runbooksA2[0].source, 'HISTORICAL_FIX');
  console.log('Confirmed: Project A successfully recalled its own historical fix!');

  // Clean up A2 by rejecting/ignoring it
  await fetch(`${API_BASE}/callback/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-callback-secret': INTERNAL_SECRET
    },
    body: JSON.stringify({
      incidentId: incidentIdA2,
      action: 'REJECT',
      comment: 'Rejected A2'
    })
  });

  console.log('\n🎉 E2E Namespace Isolation & RAG Recall test suite completed successfully!');
});
