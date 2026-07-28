// mocks/unit/namespace-isolation.test.js
// Tests WatcherAI code fixing for missing, logical, and syntax errors in isolated namespaces.
// Also tests that RAG memory recall is isolated by namespace and works correctly.

import './setup-mocks.js';
import { runPhase1, runPhase2 } from '../../server/watcherai/index.js';
import { mockVectors } from './setup-mocks.js';
import assert from 'node:assert';
import test from 'node:test';

// Active scenario holder for dynamic LLM & Git mock overrides
let currentScenario = null;

global.customLlmResponseResolver = async (url, body, systemPrompt, userPrompt) => {
  if (!currentScenario) return null;

  if (systemPrompt.includes('Triage')) {
    return {
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              service: currentScenario.service,
              severity: 'P1',
              raw_error_message: currentScenario.errorMessage,
              normalized_error_signature: currentScenario.normalizedSignature,
              root_frame: { file: currentScenario.filePath, line: currentScenario.errorLine, function: currentScenario.errorFunction },
              affected_files: [currentScenario.filePath],
              reasoning: 'Verbatim: ' + currentScenario.errorMessage,
              confidence: 95,
              is_critical: true,
              error_type: currentScenario.errorType
            })
          }
        }]
      }
    };
  }

  if (userPrompt.includes('TASK — complete in order') || userPrompt.includes('STEP 1 — LOCATE')) {
    return {
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              file_path: currentScenario.filePath,
              root_cause_line: currentScenario.errorLine,
              root_cause_explanation: currentScenario.explanation,
              uncertain: false,
              diff: currentScenario.diff,
              new_content: currentScenario.newContent,
              reasoning: currentScenario.fixReasoning,
              edge_cases: currentScenario.edgeCases,
              confidence: 0.98
            })
          }
        }]
      }
    };
  }

  if (userPrompt.includes('technical search keywords')) {
    return {
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              keywords: currentScenario.keywords
            })
          }
        }]
      }
    };
  }

  if (userPrompt.includes('top 5 most relevant paths')) {
    return {
      data: {
        choices: [{
          message: {
            content: currentScenario.filePath
          }
        }]
      }
    };
  }

  return null;
};

function setupScenarioMocks(scenario) {
  currentScenario = scenario;
  global.customGitTree = [
    { path: scenario.filePath, type: 'blob' }
  ];
  global.customFileContents = {
    [scenario.filePath]: scenario.originalContent
  };
  global.customSearchPath = scenario.filePath;
}

const missingErrorScenario = {
  service: 'user-service',
  errorMessage: 'ReferenceError: logger is not defined',
  normalizedSignature: 'ReferenceError: logger is not defined',
  filePath: 'app.js',
  errorLine: 5,
  errorFunction: 'logRequest',
  errorType: 'reference',
  keywords: ['logger', 'app.js', 'ReferenceError'],
  explanation: 'The logger object is used in logRequest but is never defined or imported in this file.',
  diff: '@@ -1,5 +1,6 @@\n+// Import logger helper\n+import logger from "./logger.js";\n \n function logRequest(req) {\n   logger.info(`Request: ${req.url}`);',
  newContent: 'import logger from "./logger.js";\n\nfunction logRequest(req) {\n  logger.info(`Request: ${req.url}`);\n}',
  fixReasoning: 'Add missing import for logger module at the top of app.js.',
  edgeCases: ['logger module not existing', 'incorrect import path'],
  originalContent: 'function logRequest(req) {\n  logger.info(`Request: ${req.url}`);\n}'
};

const logicalErrorScenario = {
  service: 'billing-service',
  errorMessage: 'ZeroDivisionError: division by zero in calculateTax',
  normalizedSignature: 'ZeroDivisionError: division by zero',
  filePath: 'tax.js',
  errorLine: 3,
  errorFunction: 'calculateTax',
  errorType: 'logical',
  keywords: ['tax', 'ZeroDivisionError', 'calculateTax'],
  explanation: 'The calculation divides by the rate parameter when it is zero, leading to a division by zero error.',
  diff: '@@ -2,3 +2,4 @@\n function calculateTax(amount, rate) {\n-  if (rate === 0) return amount / rate;\n+  if (rate === 0) return 0;\n   return amount * rate;',
  newContent: 'function calculateTax(amount, rate) {\n  if (rate === 0) return 0;\n  return amount * rate;\n}',
  fixReasoning: 'Change the check to return 0 tax when rate is 0 instead of attempting division.',
  edgeCases: ['negative rates', 'null rate inputs'],
  originalContent: 'function calculateTax(amount, rate) {\n  if (rate === 0) return amount / rate;\n  return amount * rate;\n}'
};

const syntaxErrorScenario = {
  service: 'auth-service',
  errorMessage: 'SyntaxError: Unexpected token \'}\'',
  normalizedSignature: 'SyntaxError: Unexpected token',
  filePath: 'auth.js',
  errorLine: 6,
  errorFunction: 'verifyToken',
  errorType: 'syntax',
  keywords: ['SyntaxError', 'auth.js', 'verifyToken'],
  explanation: 'An extra closing brace exists at the end of the file, causing a parse syntax error.',
  diff: '@@ -4,4 +4,3 @@\n     return false;\n   }\n }\n-}\n',
  newContent: 'function verifyToken(token) {\n  if (!token) {\n    return false;\n  }\n}',
  fixReasoning: 'Remove the extra closing curly brace at the end of auth.js.',
  edgeCases: ['breaking other function scopes if bracket structure was different'],
  originalContent: 'function verifyToken(token) {\n  if (!token) {\n    return false;\n  }\n}\n}\n'
};

const buildPayloadAndContext = (scenario, namespace, incidentId) => {
  const payload = {
    incident_id: incidentId,
    service: scenario.service,
    triggered_at: new Date().toISOString(),
    alert: {
      latencyMs: 120,
      errorRate: 0.05,
      durationMin: 3,
      transactionsAffected: 10,
      errorTypes: [scenario.errorType]
    },
    message: scenario.errorMessage
  };

  const nsMap = {
    'namespace-missing-error': 'a1234567-e89b-12d3-a456-426614174000',
    'namespace-logical-error': 'b1234567-e89b-12d3-a456-426614174001',
    'namespace-syntax-error':   'c1234567-e89b-12d3-a456-426614174002',
    'namespace-a':              'd1234567-e89b-12d3-a456-426614174003',
    'namespace-b':              'e1234567-e89b-12d3-a456-426614174004'
  };
  const uuid = nsMap[namespace] || 'f1234567-e89b-12d3-a456-426614174005';

  const context = {
    project: {
      id: uuid,
      name: `${scenario.service} Project`,
      githubToken: 'ghp_mocktoken',
      githubOwner: 'test-owner',
      githubRepo: 'test-repo',
      discordChannelId: '123456',
      openrouterKey: 'sk-or-mock-key',
      pineconeNamespace: namespace
    },
    incident: {
      id: incidentId,
      service: scenario.service
    }
  };

  return { payload, context };
};

test('Fixing a Missing Error (ReferenceError) in its own namespace', async (t) => {
  const namespace = 'namespace-missing-error';
  const incidentId = 'INC-MISSING-1';
  setupScenarioMocks(missingErrorScenario);

  // Initialize bot mock
  const { loginBot } = await import('../../server/watcherai/nodes/node-03-hitl/discord-bot.js');
  await loginBot();

  const { payload, context } = buildPayloadAndContext(currentScenario, namespace, incidentId);

  console.log(`\n--- Run Phase 1 for Missing Error (Namespace: ${namespace}) ---`);
  const phase1Result = await runPhase1(payload, context);
  
  assert.strictEqual(phase1Result.service, 'user-service');
  assert.strictEqual(phase1Result.error_type, 'reference');

  // Clear timeout
  const { clearIncidentTimeout } = await import('../../server/watcherai/services/incident-store.js');
  clearIncidentTimeout(phase1Result.incident_id);

  console.log(`\n--- Run Phase 2 for Missing Error (Namespace: ${namespace}) ---`);
  const approvalOutput = {
    ...phase1Result,
    hitl: {
      hitl_status: 'APPROVED',
      approver: 'admin@company.com',
      discord_message_id: 'msg-1',
      discord_thread_id: 'thread-1',
      hitl_initiated_at: new Date().toISOString()
    }
  };

  const phase2Result = await runPhase2(approvalOutput, context);
  
  assert.strictEqual(phase2Result.memory_updated, true);
  assert.ok(phase2Result.pr_url);
});

test('Fixing a Logical Error (ZeroDivisionError) in its own namespace', async (t) => {
  const namespace = 'namespace-logical-error';
  const incidentId = 'INC-LOGICAL-1';
  setupScenarioMocks(logicalErrorScenario);

  const { payload, context } = buildPayloadAndContext(currentScenario, namespace, incidentId);

  console.log(`\n--- Run Phase 1 for Logical Error (Namespace: ${namespace}) ---`);
  const phase1Result = await runPhase1(payload, context);
  
  assert.strictEqual(phase1Result.service, 'billing-service');
  assert.strictEqual(phase1Result.error_type, 'logical');

  const { clearIncidentTimeout } = await import('../../server/watcherai/services/incident-store.js');
  clearIncidentTimeout(phase1Result.incident_id);

  console.log(`\n--- Run Phase 2 for Logical Error (Namespace: ${namespace}) ---`);
  const approvalOutput = {
    ...phase1Result,
    hitl: {
      hitl_status: 'APPROVED',
      approver: 'admin@company.com',
      discord_message_id: 'msg-2',
      discord_thread_id: 'thread-2',
      hitl_initiated_at: new Date().toISOString()
    }
  };

  const phase2Result = await runPhase2(approvalOutput, context);
  
  assert.strictEqual(phase2Result.memory_updated, true);
  assert.ok(phase2Result.pr_url);
});

test('Fixing a Syntax Error in its own namespace', async (t) => {
  const namespace = 'namespace-syntax-error';
  const incidentId = 'INC-SYNTAX-1';
  setupScenarioMocks(syntaxErrorScenario);

  const { payload, context } = buildPayloadAndContext(currentScenario, namespace, incidentId);

  console.log(`\n--- Run Phase 1 for Syntax Error (Namespace: ${namespace}) ---`);
  const phase1Result = await runPhase1(payload, context);
  
  assert.strictEqual(phase1Result.service, 'auth-service');
  assert.strictEqual(phase1Result.error_type, 'syntax');

  const { clearIncidentTimeout } = await import('../../server/watcherai/services/incident-store.js');
  clearIncidentTimeout(phase1Result.incident_id);

  console.log(`\n--- Run Phase 2 for Syntax Error (Namespace: ${namespace}) ---`);
  const approvalOutput = {
    ...phase1Result,
    hitl: {
      hitl_status: 'APPROVED',
      approver: 'admin@company.com',
      discord_message_id: 'msg-3',
      discord_thread_id: 'thread-3',
      hitl_initiated_at: new Date().toISOString()
    }
  };

  const phase2Result = await runPhase2(approvalOutput, context);
  
  assert.strictEqual(phase2Result.memory_updated, true);
  assert.ok(phase2Result.pr_url);
});

test('RAG namespace isolation: a resolution learned in namespace-A is NOT recalled in namespace-B but is recalled in namespace-A', async (t) => {
  // Clear mock Pinecone vectors
  mockVectors.length = 0;
  
  const namespaceA = 'namespace-a';
  const namespaceB = 'namespace-b';
  setupScenarioMocks(missingErrorScenario);
  
  // Set testRecallEmpty = true so Pinecone checks dynamic memory store
  global.testRecallEmpty = true;

  // 1. Run Scenario in Namespace A (should save to Namespace A)
  console.log('\n--- Step 1: Learning missing error resolution in Namespace A ---');
  const { payload: payloadA, context: contextA } = buildPayloadAndContext(missingErrorScenario, namespaceA, 'INC-A-1');
  const phase1A = await runPhase1(payloadA, contextA);
  const { clearIncidentTimeout } = await import('../../server/watcherai/services/incident-store.js');
  clearIncidentTimeout(phase1A.incident_id);

  // Assert it did not recall (since memory is empty)
  assert.strictEqual(phase1A.runbooks[0].source, 'LOCAL_RUNBOOK');

  const approvalA = {
    ...phase1A,
    hitl: {
      hitl_status: 'APPROVED',
      approver: 'admin@company.com',
      discord_message_id: 'msg-a',
      discord_thread_id: 'thread-a',
      hitl_initiated_at: new Date().toISOString()
    }
  };
  await runPhase2(approvalA, contextA); // Writes memory to namespaceA

  // Verify memory has been written to Pinecone under namespaceA
  const nsAVectors = mockVectors.filter(v => v.namespace === namespaceA);
  const nsBVectors = mockVectors.filter(v => v.namespace === namespaceB);
  assert.ok(nsAVectors.length > 0, 'Namespace A should have written memory chunks');
  assert.strictEqual(nsBVectors.length, 0, 'Namespace B should still be empty');

  // 2. Trigger SAME error in Namespace B (should NOT recall from Namespace A)
  console.log('\n--- Step 2: Querying same error in Namespace B (Should NOT recall) ---');
  const { payload: payloadB, context: contextB } = buildPayloadAndContext(missingErrorScenario, namespaceB, 'INC-B-1');
  const phase1B = await runPhase1(payloadB, contextB);
  clearIncidentTimeout(phase1B.incident_id);

  // Assert it did not recall from Namespace A
  assert.strictEqual(phase1B.runbooks.length, 1);
  assert.strictEqual(phase1B.runbooks[0].source, 'LOCAL_RUNBOOK', 'Should use fallback local runbook, not retrieve historical fix from namespaceA');

  // 3. Trigger SAME error in Namespace A again (should recall from Namespace A)
  console.log('\n--- Step 3: Querying same error in Namespace A again (Should recall) ---');
  const { payload: payloadA2, context: contextA2 } = buildPayloadAndContext(missingErrorScenario, namespaceA, 'INC-A-2');
  const phase1A2 = await runPhase1(payloadA2, contextA2);
  clearIncidentTimeout(phase1A2.incident_id);

  // Assert it recalled successfully
  assert.strictEqual(phase1A2.runbooks.length, 1);
  assert.strictEqual(phase1A2.runbooks[0].source, 'HISTORICAL_FIX', 'Should successfully recall from historical fix in namespaceA');
  assert.strictEqual(phase1A2.runbooks[0].incident_id, 'INC-A-1');

  // Cleanup
  delete global.testRecallEmpty;
  console.log('\n--- Namespace Isolation RAG Tests Completed ---\n');
});
