// nodes/node-01-triage/index.js
// Guardian Node 01 — Universal Triage (OpenRouter Edition)

import dotenv from 'dotenv';
import { callLLM } from '../shared/ai.js';
import { triagePrompt as userPromptFunc } from '../../prompts/triage.js';

dotenv.config();

const SYSTEM_INSTRUCTIONS = `
You are an expert SRE Triage Agent. 
You MUST return ONLY a JSON object with these exact keys:
- service: string
- severity: "P1" | "P2" | "P3"
- reasoning: string (This MUST be the raw technical error message)
- confidence: number (0-100)
- is_critical: boolean
`;

export async function triageIncident(input) {
  const incident_id = input.incident_id || `INC-${Math.floor(Math.random() * 9000) + 1000}`;
  
  let userInstructions = '';
  try {
    userInstructions = userPromptFunc(input);
  } catch (e) {
    userInstructions = "Analyze the payload and extract the technical error.";
  }

  const finalPrompt = `
    USER INSTRUCTIONS:
    ${userInstructions}
    
    PAYLOAD:
    ${JSON.stringify(input, null, 2)}
  `;

  try {
    const aiResult = await callLLM({ 
      prompt: finalPrompt, 
      systemPrompt: SYSTEM_INSTRUCTIONS 
    });

    console.log(`🎯 Triage Result for ${incident_id}: ${aiResult.reasoning}`);

    // Critical: Ensure reasoning is never generic. If it is, use the raw error field.
    let technicalReasoning = aiResult.reasoning;
    if (!technicalReasoning || technicalReasoning.includes('AI triage analysis completed')) {
       technicalReasoning = input.error || input.message || 'Unknown Technical Error';
    }

    return {
      incident_id,
      service: aiResult.service || input.service || 'unknown-service',
      severity: ['P1', 'P2', 'P3'].includes(aiResult.severity) ? aiResult.severity : 'P2',
      confidence: typeof aiResult.confidence === 'number' ? aiResult.confidence : 50,
      reasoning: technicalReasoning,
      isCriticalService: !!aiResult.is_critical,
      alert_raw: input,
      triggered_at: input.triggered_at || new Date().toISOString(),
      triage_completed_at: new Date().toISOString(),
    };

  } catch (error) {
    console.error('❌ Triage Error:', error.message);
    return getFallbackTriage(input, incident_id);
  }
}

function getFallbackTriage(input, incident_id) {
  return {
    incident_id,
    service: input.service || 'unknown',
    severity: 'P2',
    confidence: 50,
    reasoning: input.error || input.message || 'AI Triage unreachable. Check raw logs.',
    isCriticalService: false,
    alert_raw: input,
    triggered_at: new Date().toISOString(),
    triage_completed_at: new Date().toISOString(),
  };
}

export default async function runTriageNode(input) {
  return await triageIncident(input);
}
