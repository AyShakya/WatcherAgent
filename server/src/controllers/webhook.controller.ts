import { Request, Response } from 'express';
import crypto from 'crypto';
import { getProjectBySecret } from '../models/project.js';
import { createIncident } from '../models/incident.js';
import { addIngestionJob } from '../queue/index.js';

export async function handleWebhook(req: Request, res: Response) {
  try {
    const { secret } = req.params;
    const body = req.body || {};

    const project = await getProjectBySecret(secret);
    if (!project) {
      return res.status(404).json({ error: 'Project not found or inactive' });
    }

    // Map incoming body to standard triage InputSchema parameters to satisfy Node 1
    const incidentId = body.incident_id || body.id || `inc_${crypto.randomUUID()}`;
    const service = body.service || 'unknown-service';
    const triggeredAt = body.triggered_at || body.triggeredAt || new Date().toISOString();

    const alertDetails = {
      latencyMs: Number(body.alert?.latencyMs ?? body.latency ?? 0),
      errorRate: Number(body.alert?.errorRate ?? body.errorRate ?? 0),
      durationMin: Number(body.alert?.durationMin ?? body.duration ?? 1),
      transactionsAffected: Number(body.alert?.transactionsAffected ?? body.transactionsAffected ?? 0),
      p95LatencyMs: body.alert?.p95LatencyMs !== undefined ? Number(body.alert.p95LatencyMs) : undefined,
      p99LatencyMs: body.alert?.p99LatencyMs !== undefined ? Number(body.alert.p99LatencyMs) : undefined,
      errorTypes: Array.isArray(body.alert?.errorTypes ?? body.errorTypes) ? (body.alert?.errorTypes ?? body.errorTypes) : [],
      affectedRegions: Array.isArray(body.alert?.affectedRegions ?? body.regions) ? (body.alert?.affectedRegions ?? body.regions) : [],
    };

    const mappedPayload = {
      incident_id: incidentId,
      service,
      alert: alertDetails,
      triggered_at: triggeredAt,
      pagerduty_url: body.pagerduty_url || body.pagerdutyUrl || undefined,
      runbook_hint: body.runbook_hint || body.runbookHint || undefined,
    };

    // Insert new incident in TRIGGERED state
    const errorSignature = body.error_signature || body.message || `Alert in ${service}`;
    const incident = await createIncident({
      project_id: project.id,
      status: 'TRIGGERED',
      severity: body.severity || 'P3',
      category: body.category || 'GENERAL',
      error_signature: errorSignature,
      raw_payload: mappedPayload,
    });

    // Enqueue job to execute Phase 1 pipeline (Triage -> Runbook -> Discord Notification)
    await addIngestionJob(incident.id, mappedPayload);

    return res.json({
      status: 'queued',
      message: 'Incident alert successfully received and queued',
      incident_id: incident.id,
    });
  } catch (error: any) {
    console.error('Webhook ingestion error:', error);
    return res.status(500).json({ error: 'Failed to process webhook alert' });
  }
}
