// prompts/triage.js
// USER CUSTOMIZATION SPACE
// Structured customization only: this module composes safe prompt fragments.

const MAX_ESCALATION_NOTES_LENGTH = 500;

const FOCUS_AREA_MAP = {
  database_connections: 'Pay special attention to database connection errors and pool exhaustion patterns.',
  deployment_errors: 'Flag errors that correlate with recent deployments or rollbacks.',
  payment_failures: 'Prioritize payment failures and transaction-path disruptions.',
  authentication: 'Highlight authentication and authorization failures affecting user access.',
};

function sanitizeEscalationNotes(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, MAX_ESCALATION_NOTES_LENGTH);
}

export function buildUserInstructions(config = {}) {
  const focusAreas = Array.isArray(config.focus_areas) ? config.focus_areas : [];
  const focusSentences = focusAreas
    .map((focusArea) => FOCUS_AREA_MAP[focusArea] || '')
    .filter(Boolean)
    .join(' ');

  const verbosity = config.verbosity === 'detailed'
    ? 'Provide detailed analysis with relevant payload evidence.'
    : 'Keep analysis concise while preserving key technical details.';

  const escalationNotes = sanitizeEscalationNotes(config.escalation_notes);
  const escalation = escalationNotes ? `Escalation note: ${escalationNotes}` : '';

  return [focusSentences, verbosity, escalation].filter(Boolean).join('\n');
}

export const triagePrompt = (input = {}) => {
  const userConfig = input?.user_config && typeof input.user_config === 'object'
    ? input.user_config
    : {};

  return buildUserInstructions(userConfig);
};
