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

    let service = body.service || 'unknown-service';
    let errorSignature = body.error_signature || body.message || '';
    let incidentId = body.incident_id || body.id || '';
    let triggeredAt = body.triggered_at || body.triggeredAt || '';
    let pagerdutyUrl = body.pagerduty_url || body.pagerdutyUrl || '';
    let runbookHint = body.runbook_hint || body.runbookHint || '';
    
    let latencyMs = 0;
    let errorRate = 0;
    let durationMin = 1;
    let transactionsAffected = 0;
    let p95LatencyMs: number | undefined = undefined;
    let p99LatencyMs: number | undefined = undefined;
    let errorTypes: string[] = [];
    let affectedRegions: string[] = [];

    // 1. Detect Sentry webhook format
    if (body.data?.issue || body.event) {
      const issue = body.data?.issue;
      const event = body.event || body.data?.event;
      
      service = issue?.project?.name || issue?.project?.slug || event?.project || service;
      errorSignature = issue?.title || event?.message || body.message || errorSignature;
      incidentId = issue?.id || event?.event_id || incidentId;
      triggeredAt = event?.datetime || issue?.metadata?.timestamp || triggeredAt;
      
      if (event?.request?.url) {
        runbookHint = `Failed request URL: ${event.request.url}`;
      }
      if (event?.exception?.values?.[0]) {
        const val = event.exception.values[0];
        errorTypes = [val.type || 'SentryException'];
        errorSignature = `${val.type}: ${val.value}`;
      }
    } 
    // 2. Detect Grafana webhook format
    else if (body.evalMatches || body.ruleName || body.ruleUrl) {
      service = body.ruleName || service;
      errorSignature = body.message || body.title || errorSignature;
      incidentId = body.ruleId || incidentId;
      
      // Parse evalMatches for metrics
      if (Array.isArray(body.evalMatches) && body.evalMatches.length > 0) {
        const match = body.evalMatches[0];
        if (match.value !== undefined) {
          latencyMs = Number(match.value);
          errorRate = Number(match.value);
        }
      }
    }
    // 3. Detect Datadog webhook format
    else if (body.event_title || body.alert_type) {
      service = body.tags ? body.tags.split(',').find((t: string) => t.startsWith('service:'))?.split(':')[1] : service;
      errorSignature = body.event_title || body.msg || errorSignature;
      incidentId = body.id || incidentId;
      triggeredAt = body.date || triggeredAt;
    }
    // 4. Detect PagerDuty webhook format
    else if (body.messages && Array.isArray(body.messages) && body.messages[0]?.incident) {
      const pdIncident = body.messages[0].incident;
      service = pdIncident.service?.name || service;
      errorSignature = pdIncident.title || pdIncident.description || errorSignature;
      incidentId = pdIncident.incident_number || pdIncident.id || incidentId;
      triggeredAt = pdIncident.created_at || triggeredAt;
      pagerdutyUrl = pdIncident.html_url || pagerdutyUrl;
    }
    // 5. Detect Render / Deploy webhook formats (Ignore started and succeeded events)
    else if (body.event && typeof body.event === 'string' && body.event.startsWith('deploy.')) {
      const eventType = body.event;
      const deployStatus = body.deploy?.status || '';

      if (eventType === 'deploy.succeeded' || eventType === 'deploy.started' || deployStatus === 'succeeded') {
        return res.json({
          status: 'ignored',
          message: `Webhook ignored: Deployment is successful or started (${eventType})`
        });
      }

      // Populate service and error fields for failures
      service = body.service?.name || service;
      errorSignature = `Deployment Failed: Render deploy [${body.deploy?.id || 'unknown'}] status is '${deployStatus || eventType}'`;
      incidentId = body.deploy?.id || incidentId;
    }

    // Standardize metrics and fallback values
    if (!incidentId) {
      incidentId = `inc_${crypto.randomUUID()}`;
    }
    if (!triggeredAt) {
      triggeredAt = new Date().toISOString();
    }
    try {
      triggeredAt = new Date(triggeredAt).toISOString();
    } catch {
      triggeredAt = new Date().toISOString();
    }
    if (!errorSignature) {
      errorSignature = `Alert in ${service}`;
    }

    latencyMs = Number(body.alert?.latencyMs ?? body.latency ?? latencyMs);
    errorRate = Number(body.alert?.errorRate ?? body.errorRate ?? errorRate);
    durationMin = Number(body.alert?.durationMin ?? body.duration ?? durationMin);
    transactionsAffected = Number(body.alert?.transactionsAffected ?? body.transactionsAffected ?? transactionsAffected);
    p95LatencyMs = body.alert?.p95LatencyMs !== undefined ? Number(body.alert.p95LatencyMs) : p95LatencyMs;
    p99LatencyMs = body.alert?.p99LatencyMs !== undefined ? Number(body.alert.p99LatencyMs) : p99LatencyMs;
    errorTypes = Array.isArray(body.alert?.errorTypes ?? body.errorTypes) 
      ? (body.alert?.errorTypes ?? body.errorTypes) 
      : (errorTypes.length > 0 ? errorTypes : []);
    affectedRegions = Array.isArray(body.alert?.affectedRegions ?? body.regions) 
      ? (body.alert?.affectedRegions ?? body.regions) 
      : affectedRegions;

    const mappedPayload = {
      incident_id: incidentId,
      service,
      alert: {
        latencyMs,
        errorRate,
        durationMin,
        transactionsAffected,
        p95LatencyMs,
        p99LatencyMs,
        errorTypes,
        affectedRegions,
      },
      triggered_at: triggeredAt,
      pagerduty_url: pagerdutyUrl || undefined,
      runbook_hint: runbookHint || undefined,
    };

    // Insert new incident in TRIGGERED state
    const incident = await createIncident({
      project_id: project.id,
      status: 'TRIGGERED',
      severity: body.severity || 'P3',
      category: body.category || 'GENERAL',
      error_signature: errorSignature,
      raw_payload: mappedPayload,
    });

    // Ensure the AI pipeline uses the database UUID as the unique incident_id
    mappedPayload.incident_id = incident.id;

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
