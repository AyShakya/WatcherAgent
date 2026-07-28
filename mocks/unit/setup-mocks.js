// mocks/unit/setup-mocks.js
// Monkey-patches module stubs and constructors to run tests in-memory offline.

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../server/watcherai/.env') });

// Setup mock environment variables so startups don't error out
process.env.DEFAULT_LLM_MODEL = 'google/gemini-2.5-pro';
process.env.OPENROUTER_API_KEY = 'global-mock-or-key';
process.env.PINECONE_API_KEY = 'global-mock-pinecone-key';
process.env.PINECONE_INDEX_NAME = 'watcher-knowledge';
process.env.DISCORD_BOT_TOKEN = 'global-mock-discord-token';
process.env.DISCORD_INCIDENT_CHANNEL_ID = '1234567890';
process.env.GITHUB_TOKEN = 'global-mock-github-token';
process.env.GITHUB_REPO_OWNER = 'global-owner';
process.env.GITHUB_REPO_NAME = 'global-repo';

import axios from 'axios';
import { Octokit } from 'octokit';
import { Client, ChannelManager } from 'discord.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pineconeModule = require('@pinecone-database/pinecone');
const OriginalPinecone = pineconeModule.Pinecone;

// Stateful vector store for testing memory recall / similar error twice
export const mockVectors = [];

class MockPinecone extends OriginalPinecone {
  constructor(opts) {
    super(opts);
    console.log('[MOCK PINECONE CONSTRUCTOR] Intercepted new Pinecone()');
    
    this.index = function (name) {
      console.log(`[MOCK PINECONE] Selected Index: "${name}"`);
      return {
        namespace: function (ns) {
          console.log(`[MOCK PINECONE] Switched to Namespace: "${ns}"`);
          const newIndex = Object.create(this);
          newIndex._ns = ns;
          return newIndex;
        },
        query: async function (options) {
          const ns = this._ns || 'default';
          console.log(`[MOCK PINECONE] Executing query in namespace: "${ns}"`);
          const signatureMatches = mockVectors.filter(v => 
            v.namespace === ns &&
            v.metadata?.chunk_type === 'error_signature' && 
            (!options.filter?.service || v.metadata?.service === (options.filter.service.$eq || options.filter.service))
          );
          if (global.testRecallEmpty) {
            return {
              matches: signatureMatches.map(m => ({
                score: 0.95,
                metadata: m.metadata
              }))
            };
          }
          if (signatureMatches.length > 0) {
            return {
              matches: signatureMatches.map(m => ({
                score: 0.95,
                metadata: m.metadata
              }))
            };
          }
          
          // Only return the hardcoded default database fallback for checkout-service / default connections
          const filterService = options.filter?.service?.$eq || options.filter?.service;
          if (!filterService || filterService === 'checkout-service') {
            return {
              matches: [
                {
                  score: 0.92,
                  metadata: {
                    title: 'Database connection pool runbook',
                    steps: JSON.stringify(['Verify database metrics', 'Increase connection pool limits']),
                    fix_diff: '@@ -42,1 +42,1 @@\n-  poolSize: 5\n+  poolSize: 20',
                    fix_file: 'db.js',
                    root_cause: 'MongoDB Connection pool timeout',
                    pr_url: 'https://github.com/mock/pr/1',
                    source: 'HISTORICAL_FIX',
                    incident_id: 'INC-7890'
                  }
                }
              ]
            };
          }

          return { matches: [] };
        },
        upsert: async function (payload) {
          const ns = this._ns || 'default';
          console.log(`[MOCK PINECONE] Upserted vectors into Pinecone namespace "${ns}":`, JSON.stringify(payload));
          if (payload && Array.isArray(payload.records)) {
            for (const rec of payload.records) {
              mockVectors.push({
                ...rec,
                namespace: ns
              });
            }
          }
          return { upsertedCount: payload.records ? payload.records.length : 0 };
        }
      };
    };

    Object.defineProperty(this, 'inference', {
      value: {
        embed: async (options) => {
          console.log(`[MOCK PINECONE INFERENCE] Generating embedding vector for text: "${options.inputs[0].slice(0, 40)}..."`);
          return {
            data: (options.inputs || []).map(() => ({ values: new Array(1024).fill(0.123) }))
          };
        }
      },
      writable: true,
      configurable: true
    });
  }
}

try {
  Object.defineProperty(pineconeModule, 'Pinecone', {
    value: MockPinecone,
    writable: true,
    configurable: true,
    enumerable: true
  });
} catch (e) {
  console.log('[MOCK PINECONE] Export is read-only, applying prototype monkey-patches to OriginalPinecone...');
  OriginalPinecone.prototype.index = function (name) {
    console.log(`[MOCK PINECONE] Selected Index: "${name}"`);
    return {
      namespace: function (ns) {
        console.log(`[MOCK PINECONE] Switched to Namespace: "${ns}"`);
        const newIndex = Object.create(this);
        newIndex._ns = ns;
        return newIndex;
      },
      query: async function (options) {
        const ns = this._ns || 'default';
        console.log(`[MOCK PINECONE] Executing query in namespace: "${ns}"`);
        console.log(`[MOCK PINECONE DEBUG] options:`, JSON.stringify(options));
        const signatureMatches = mockVectors.filter(v => 
          v.namespace === ns &&
          v.metadata?.chunk_type === 'error_signature' && 
          (!options.filter?.service || v.metadata?.service === (options.filter.service.$eq || options.filter.service))
        );
        if (global.testRecallEmpty) {
          return {
            matches: signatureMatches.map(m => ({
              score: 0.95,
              metadata: m.metadata
            }))
          };
        }
        if (signatureMatches.length > 0) {
          return {
            matches: signatureMatches.map(m => ({
              score: 0.95,
              metadata: m.metadata
            }))
          };
        }
        
        // Only return the hardcoded default database fallback for checkout-service / default connections
        const filterService = options.filter?.service?.$eq || options.filter?.service;
        console.log(`[MOCK PINECONE DEBUG] filterService:`, filterService);
        if (!filterService || filterService === 'checkout-service') {
          return {
            matches: [
              {
                score: 0.92,
                metadata: {
                  title: 'Database connection pool runbook',
                  steps: JSON.stringify(['Verify database metrics', 'Increase connection pool limits']),
                  fix_diff: '@@ -42,1 +42,1 @@\n-  poolSize: 5\n+  poolSize: 20',
                  fix_file: 'db.js',
                  root_cause: 'MongoDB Connection pool timeout',
                  pr_url: 'https://github.com/mock/pr/1',
                  source: 'HISTORICAL_FIX',
                  incident_id: 'INC-7890'
                }
              }
            ]
          };
        }

        return { matches: [] };
      },
      upsert: async function (payload) {
        const ns = this._ns || 'default';
        console.log(`[MOCK PINECONE] Upserted vectors into Pinecone namespace "${ns}":`, JSON.stringify(payload));
        if (payload && Array.isArray(payload.records)) {
          for (const rec of payload.records) {
            mockVectors.push({
              ...rec,
              namespace: ns
            });
          }
        }
        return { upsertedCount: payload.records ? payload.records.length : 0 };
      }
    };
  };

  Object.defineProperty(OriginalPinecone.prototype, 'inference', {
    get() {
      return {
        embed: async (options) => {
          console.log(`[MOCK PINECONE INFERENCE] Generating embedding vector for text: "${options.inputs[0].slice(0, 40)}..."`);
          return {
            data: (options.inputs || []).map(() => ({ values: new Array(1024).fill(0.123) }))
          };
        }
      };
    },
    set(val) {
      // Prevent constructor from overwriting the getter
    },
    configurable: true,
    enumerable: true
  });
}
const Pinecone = MockPinecone;

// Setup relative path to the incident-store service of the watcherai agent
import {
  getIncident,
  removeIncident,
  saveIncidentTimeout,
  clearIncidentTimeout,
} from '../../server/watcherai/services/incident-store.js';

const mockScenarios = [
  {
    key: 'logger is not defined',
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
  },
  {
    key: 'division by zero',
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
  },
  {
    key: 'Unexpected token',
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
  }
];

// 1. Mock Axios POST for LLM (OpenRouter) calls
axios.post = async (url, data, config) => {
  const body = typeof data === 'string' ? JSON.parse(data) : data;
  const systemPrompt = body.messages.find(m => m.role === 'system')?.content || '';
  const userPrompt = body.messages.find(m => m.role === 'user')?.content || '';

  console.log(`[MOCK AXIOS] Intercepted POST to OpenRouter:`, url);
  console.log(`[MOCK AXIOS DEBUG] userPrompt:`, userPrompt);

  if (global.customLlmResponseResolver) {
    const customRes = await global.customLlmResponseResolver(url, body, systemPrompt, userPrompt);
    if (customRes) return customRes;
  }

  // Find if we have a matching scenario
  const scenario = mockScenarios.find(s => 
    userPrompt.includes(s.key) || 
    userPrompt.includes(s.errorMessage) || 
    systemPrompt.includes(s.key)
  );

  if (systemPrompt.includes('Triage')) {
    if (scenario) {
      return {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                service: scenario.service,
                severity: 'P1',
                raw_error_message: scenario.errorMessage,
                normalized_error_signature: scenario.normalizedSignature,
                root_frame: { file: scenario.filePath, line: scenario.errorLine, function: scenario.errorFunction },
                affected_files: [scenario.filePath],
                reasoning: 'Verbatim: ' + scenario.errorMessage,
                confidence: 95,
                is_critical: true,
                error_type: scenario.errorType
              })
            }
          }]
        }
      };
    }
    // Triage Node mock response
    return {
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              service: 'checkout-service',
              severity: 'P1',
              raw_error_message: 'MongoNetworkError: connection pool timeout',
              normalized_error_signature: 'MongoNetworkError: connection pool timeout',
              root_frame: { file: 'db.js', line: 42, function: 'connect' },
              affected_files: ['db.js'],
              reasoning: 'Verbatim: MongoNetworkError: connection pool timeout',
              confidence: 90,
              is_critical: true,
              error_type: 'network'
            })
          }
        }]
      }
    };
  } else if (userPrompt.includes('TASK — complete in order') || userPrompt.includes('STEP 1 — LOCATE')) {
    if (scenario) {
      return {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                file_path: scenario.filePath,
                root_cause_line: scenario.errorLine,
                root_cause_explanation: scenario.explanation,
                uncertain: false,
                diff: scenario.diff,
                new_content: scenario.newContent,
                reasoning: scenario.fixReasoning,
                edge_cases: scenario.edgeCases,
                confidence: 0.98
              })
            }
          }]
        }
      };
    }
    // GitHub Fixer Deep Audit mock response
    return {
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              file_path: 'db.js',
              root_cause_line: 42,
              root_cause_explanation: 'DB connection pool timeout during burst traffic.',
              uncertain: false,
              diff: '@@ -42,1 +42,1 @@\n-  poolSize: 5\n+  poolSize: 20',
              new_content: '// db.js\nconst pool = {\n  poolSize: 20\n};',
              reasoning: 'Increase connection pool size to handle concurrency.',
              edge_cases: ['Excessive memory usage if pool size is too high'],
              confidence: 0.95
            })
          }
        }]
      }
    };
  } else if (userPrompt.includes('technical search keywords')) {
    if (scenario) {
      return {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                keywords: scenario.keywords
              })
            }
          }]
        }
      };
    }
    // Keyword extractor mock response
    return {
      data: {
        choices: [{
          message: {
            content: JSON.stringify({
              keywords: ['mongodb', 'connection', 'timeout']
            })
          }
        }]
      }
    };
  } else if (userPrompt.includes('top 5 most relevant paths')) {
    if (scenario) {
      return {
        data: {
          choices: [{
            message: {
              content: scenario.filePath
            }
          }]
        }
      };
    }
    // Path ranker mock response
    return {
      data: {
        choices: [{
          message: {
            content: 'db.js\ncheckout.js'
          }
        }]
      }
    };
  }

  // General fallback
  return {
    data: {
      choices: [{
        message: {
          content: '{}'
        }
      }]
    }
  };
};

// Helper for HTTP fetch mocking
function makeMockResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => data,
    text: async () => JSON.stringify(data)
  };
}

// 2. Mock network requests to api.github.com
const originalFetch = global.fetch;
global.fetch = async (url, options) => {
  const urlStr = String(url);
  
  if (urlStr.includes('api.github.com')) {
    console.log(`[MOCK FETCH GITHUB] ${options?.method || 'GET'} ${urlStr}`);
    
    if (urlStr.includes('/pulls')) {
      if (options?.method === 'POST') {
        return makeMockResponse({ html_url: 'https://github.com/test-owner/test-repo/pull/1' }, 201);
      }
      return makeMockResponse([]);
    }
    if (urlStr.includes('/git/refs') && options?.method === 'POST') {
      return makeMockResponse({}, 201);
    }
    if (urlStr.includes('/git/ref/')) {
      return makeMockResponse({ object: { sha: 'mocksha1234567890' } });
    }
    if (urlStr.includes('/git/trees/')) {
      const tree = [
        { path: 'db.js', type: 'blob' },
        { path: 'checkout.js', type: 'blob' },
        { path: 'app.js', type: 'blob' },
        { path: 'tax.js', type: 'blob' },
        { path: 'auth.js', type: 'blob' }
      ];
      return makeMockResponse({ tree });
    }
    if (urlStr.includes('/contents/')) {
      if (options?.method === 'PUT') {
        return makeMockResponse({}, 200);
      }
      const pathMatch = urlStr.match(/\/contents\/(.+)$/);
      const filePath = pathMatch ? decodeURIComponent(pathMatch[1]).split('?')[0] : '';
      
      const scenario = mockScenarios.find(s => s.filePath === filePath);
      let fileContent = 'const poolSize = 5;';
      if (scenario) {
        fileContent = scenario.originalContent;
      }
      return makeMockResponse({
        content: Buffer.from(fileContent).toString('base64'),
        sha: 'mockfilesha9876'
      });
    }
    if (urlStr.includes('/search/code')) {
      const q = urlStr;
      let searchPath = 'db.js';
      if (q.includes('logger') || q.includes('app.js')) searchPath = 'app.js';
      else if (q.includes('tax') || q.includes('calculateTax')) searchPath = 'tax.js';
      else if (q.includes('auth') || q.includes('verifyToken')) searchPath = 'auth.js';

      return makeMockResponse({ items: [{ path: searchPath }] });
    }
    // /repos/{owner}/{repo}
    if (urlStr.match(/\/repos\/[^/]+\/[^/]+$/)) {
      return makeMockResponse({ default_branch: 'main' });
    }

    return makeMockResponse({});
  }

  if (urlStr.includes('api.pinecone.io')) {
    console.log(`[MOCK FETCH PINECONE] Intercepted embedding request to URL: ${urlStr}`);
    return makeMockResponse({
      data: [{ values: new Array(1024).fill(0.123) }]
    });
  }

  return originalFetch(url, options);
};

// Prototype level backup mock for Octokit
Octokit.prototype.request = async function(route, options) {
  console.log(`[MOCK OCTOKIT REQUEST] Backup Intercept: ${route}`);
  const cleanRoute = String(route).trim();
  if (cleanRoute.includes('/pulls') && cleanRoute.startsWith('GET')) {
    return { data: [] };
  }
  if (cleanRoute.includes('/pulls') && cleanRoute.startsWith('POST')) {
    return { data: { html_url: `https://github.com/test-owner/test-repo/pull/1` } };
  }
  if (cleanRoute.includes('/git/ref') && cleanRoute.startsWith('GET')) {
    return { data: { object: { sha: 'mocksha1234567890' } } };
  }
  if (cleanRoute.includes('/git/refs') && cleanRoute.startsWith('POST')) {
    return { data: {} };
  }
  if (cleanRoute.includes('/git/trees') && cleanRoute.startsWith('GET')) {
    const tree = [
      { path: 'db.js', type: 'blob' },
      { path: 'checkout.js', type: 'blob' },
      { path: 'app.js', type: 'blob' },
      { path: 'tax.js', type: 'blob' },
      { path: 'auth.js', type: 'blob' }
    ];
    return {
      data: { tree }
    };
  }
  if (cleanRoute.includes('/contents/') && cleanRoute.startsWith('GET')) {
    const urlParts = cleanRoute.split('/contents/');
    const filePath = urlParts[1]?.split(' ')[0] || '';
    
    const scenario = mockScenarios.find(s => s.filePath === filePath);
    let fileContent = 'const poolSize = 5;';
    if (scenario) {
      fileContent = scenario.originalContent;
    }
    return {
      data: {
        content: Buffer.from(fileContent).toString('base64'),
        sha: 'mockfilesha9876'
      }
    };
  }
  if (cleanRoute.includes('/contents/') && cleanRoute.startsWith('PUT')) {
    return { data: {} };
  }
  if (cleanRoute.startsWith('GET /repos/{owner}/{repo}') || cleanRoute.startsWith('GET /repos/:owner/:repo')) {
    return { data: { default_branch: 'main' } };
  }
  if (cleanRoute.startsWith('GET /search/code')) {
    const q = cleanRoute;
    let searchPath = 'db.js';
    if (q.includes('logger') || q.includes('app.js')) searchPath = 'app.js';
    else if (q.includes('tax') || q.includes('calculateTax')) searchPath = 'tax.js';
    else if (q.includes('auth') || q.includes('verifyToken')) searchPath = 'auth.js';

    return { data: { items: [{ path: searchPath }] } };
  }
  return { data: {} };
};

// Mapped via Pinecone constructor above

// 4. Mock Discord Bot Client
Client.prototype.login = async function (token) {
  console.log('[MOCK DISCORD] Logging in client...');
  this.token = token;
  this.user = { tag: 'MockBot#1234' };
  
  process.nextTick(() => {
    this.emit('ready');
  });
  return token;
};

// Intercept at ChannelManager prototype level
ChannelManager.prototype.fetch = async function(id) {
  console.log(`[MOCK DISCORD CHANNEL MANAGER] Fetched channel ID: ${id}`);
  return {
    send: async (embedPayload) => {
      console.log(`[MOCK DISCORD] Sent message embed to channel`);
      return {
        id: 'mock-message-id-5555',
        startThread: async (threadOpts) => {
          console.log(`[MOCK DISCORD] Opened thread: "${threadOpts.name}"`);
          return {
            id: 'mock-thread-id-7777',
            send: async (msg) => {
              console.log(`[MOCK DISCORD] Thread message sent: "${msg}"`);
              return {};
            }
          };
        }
      };
    }
  };
};
