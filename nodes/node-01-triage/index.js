// nodes/node-01-triage/index.js
// Guardian Node 01 — Universal Triage (OpenRouter Edition)

import dotenv from 'dotenv';
import { callLLM } from '../shared/ai.js';
import { triagePrompt as userPromptFunc } from '../../prompts/triage.js';

dotenv.config();

/**
 * SYSTEM PROMPT (The "Golden Safety" instructions)
 * These ensure the agent always returns valid data even if the user prompt is bad.
 */
const SYSTEM_INSTRUCTIONS = `
You are an expert SRE Triage Agent. 
You MUST return ONLY a JSON object with these exact keys:
- service: string
- severity: "P1" | "P2" | "P3"
- reasoning: string
- confidence: number (0-100)
- is_critical: boolean
`;

const BASE_FALLBACK_PROMPT = `
Analyze the following incident and classify it.
Identify the service, severity, reasoning, confidence, and if it is critical.
`;

export async function triageIncident(input) {
  const incident_id = input.incident_id || `INC-${Math.floor(Math.random() * 9000) + 1000}`;
  
  // 1. Get user custom instructions
  let userInstructions = '';
  try {
    userInstructions = userPromptFunc(input);
  } catch (e) {
    console.warn('⚠️ User triage prompt failed, using base fallback.');
    userInstructions = BASE_FALLBACK_PROMPT;
  }

  // 2. Combine with Payload
  const finalPrompt = `
    USER INSTRUCTIONS:
    ${userInstructions}
    
    PAYLOAD:
    ${JSON.stringify(input, null, 2)}
  `;

  try {
    // 3. Call LLM with System Safety Shell
    const aiResult = await callLLM({ 
      prompt: finalPrompt, 
      systemPrompt: SYSTEM_INSTRUCTIONS 
    });

    return {
      incident_id,
      service: aiResult.service || input.service || 'unknown-service',
      severity: ['P1', 'P2', 'P3'].includes(aiResult.severity) ? aiResult.severity : 'P2',
      confidence: typeof aiResult.confidence === 'number' ? aiResult.confidence : 50,
      reasoning: aiResult.reasoning || 'AI triage analysis completed.',
      isCriticalService: !!aiResult.is_critical,
      alert_raw: input,
      triggered_at: input.triggered_at || new Date().toISOString(),
      triage_completed_at: new Date().toISOString(),
    };

  } catch (error) {
    console.error('❌ Triage Error (Falling back to safe default):', error.message);
    return getFallbackTriage(input, incident_id);
  }
}

function getFallbackTriage(input, incident_id) {
  return {
    incident_id,
    service: input.service || 'unknown',
    severity: 'P2',
    confidence: 50,
    reasoning: 'AI Triage unreachable or produced invalid output. Defaulting to safe P2.',
    isCriticalService: false,
    alert_raw: input,
    triggered_at: new Date().toISOString(),
    triage_completed_at: new Date().toISOString(),
  };
}

export default async function runTriageNode(input) {
  return await triageIncident(input);
}
