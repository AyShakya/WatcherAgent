import { Request, Response } from 'express';
import { getIncidentWithProject, updateIncident } from '../models/incident.js';
import { addFixJob } from '../queue/index.js';
import { config } from '../config/index.js';
import jwt from 'jsonwebtoken';

export async function handleApproval(req: Request, res: Response) {
  try {
    const { incidentId, action, comment } = req.body;
    
    if (!incidentId || !action) {
      return res.status(400).json({ error: 'incidentId and action are required' });
    }

    // 1. Authorize: Check if INTERNAL_CALLBACK_SECRET is sent in headers OR if JWT is valid
    let authorized = false;
    const authHeader = req.headers['authorization'];
    const clientSecret = req.headers['x-callback-secret'];

    if (clientSecret === config.INTERNAL_CALLBACK_SECRET) {
      authorized = true;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        jwt.verify(token, config.JWT_SECRET);
        authorized = true;
      } catch (jwtErr) {
        return res.status(403).json({ error: 'Invalid or expired auth credentials' });
      }
    }

    if (!authorized) {
      return res.status(401).json({ error: 'Unauthorized callback endpoint' });
    }

    // 2. Fetch the incident and its project configuration
    const incidentWithProject = await getIncidentWithProject(incidentId);
    if (!incidentWithProject) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const { status, triage, runbook } = incidentWithProject;

    if (action === 'APPROVE') {
      if (status !== 'AWAITING_APPROVAL' && status !== 'TRIGGERED' && status !== 'TRIAGED') {
        return res.status(400).json({
          error: `Incident cannot be approved from current state: ${status}`,
        });
      }

      // Update incident state to FIXING
      await updateIncident(incidentId, {
        status: 'FIXING',
        updated_at: new Date(),
      });

      // Prepare payload parameter matching runPhase2 input (Phase 1 output)
      const phase1Output = {
        incident_id: incidentId,
        service: (incidentWithProject.raw_payload as any)?.service || incidentWithProject.project.name || 'unknown-service',
        severity: incidentWithProject.severity,
        // Include any details parsed from triage/runbook fields
        raw_error_message: triage?.raw_error_message || triage?.error || incidentWithProject.error_signature,
        normalized_error_signature: triage?.normalized_error_signature || incidentWithProject.error_signature,
        root_frame: triage?.root_frame || undefined,
        affected_files: triage?.affected_files || runbook?.affected_files || [],
        error_type: triage?.error_type || undefined,
        error_category: incidentWithProject.category,
        confidence: triage?.confidence || 100,
        reasoning: triage?.reasoning || 'Approved manually',
        isCriticalService: triage?.isCriticalService || false,
        criticalMultiplierApplied: triage?.criticalMultiplierApplied || false,
        alert_raw: incidentWithProject.raw_payload,
        triggered_at: incidentWithProject.created_at.toISOString(),
        triage_completed_at: new Date().toISOString(),
      };

      // Enqueue job to perform Phase 2 fix (GitHub War Room PR -> Learning update)
      await addFixJob(incidentId, phase1Output);

      return res.json({
        message: 'Incident approved. Remediation queued.',
        status: 'FIXING',
      });
    } 
    
    if (action === 'REJECT') {
      await updateIncident(incidentId, {
        status: 'MUTED',
        root_cause: comment || 'Rejected by operator',
        updated_at: new Date(),
      });

      return res.json({
        message: 'Incident muted and rejected.',
        status: 'MUTED',
      });
    }

    return res.status(400).json({ error: 'Unsupported approval action value' });
  } catch (error: any) {
    console.error('Approval callback error:', error);
    return res.status(500).json({ error: 'Failed to process incident approval request' });
  }
}
