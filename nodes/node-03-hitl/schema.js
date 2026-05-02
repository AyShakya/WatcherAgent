// nodes/node-03-hitl/schema.js
import { z } from 'zod';

export const HITLPendingSchema = z.object({
  hitl_status: z.literal('AWAITING_APPROVAL'),
  discord_message_id: z.string(),
  discord_thread_id: z.string(),
  hitl_initiated_at: z.string(),
  hitl_expires_at: z.string(),
});

export const HITLResolvedSchema = z.object({
  hitl_status: z.enum(['APPROVED', 'IGNORED', 'TIMED_OUT', 'ESCALATED']),
  approver: z.string(),
  approved_at: z.string(),
  response_time_seconds: z.number(),
});

export const OutputSchema = z.object({
  incident_id: z.string(),
  service: z.string(),
  severity: z.enum(['P1', 'P2', 'P3']),
  confidence: z.number(),
  runbooks: z.array(z.record(z.unknown())),
  ai_explanation: z.string().nullable().optional(),
  hitl: HITLPendingSchema,
});
