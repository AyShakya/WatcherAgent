// services/incident-store.js
// File-backed store for active incidents and HITL expiry windows

import { promises as fs } from 'node:fs';
import path from 'node:path';

const storeDir = process.env.INCIDENT_STORE_DIR || path.resolve('.data');
const storeFile = path.join(storeDir, 'incidents.json');
const HITL_TIMEOUT_MS = parseInt(process.env.HITL_TIMEOUT_MS || '900000', 10);

const timeouts = new Map();

export function saveIncidentTimeout(id, timeout) {
  timeouts.set(id, timeout);
}

export function clearIncidentTimeout(id) {
  if (timeouts.has(id)) {
    clearTimeout(timeouts.get(id));
    timeouts.delete(id);
  }
}

async function ensureStoreFile() {
  await fs.mkdir(storeDir, { recursive: true });

  try {
    await fs.access(storeFile);
  } catch {
    await fs.writeFile(storeFile, '{}', 'utf8');
  }
}

async function readStore() {
  await ensureStoreFile();
  const content = await fs.readFile(storeFile, 'utf8');

  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeStore(data) {
  await ensureStoreFile();
  const tempFile = `${storeFile}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tempFile, storeFile);
}

function isExpired(expiresAt) {
  return !expiresAt || Date.now() > new Date(expiresAt).getTime();
}

export async function saveIncident(id, data) {
  const incidents = await readStore();
  incidents[id] = {
    data,
    expiresAt: new Date(Date.now() + HITL_TIMEOUT_MS).toISOString(),
  };
  await writeStore(incidents);
}

export async function getIncident(id) {
  const incidents = await readStore();
  const entry = incidents[id];

  if (!entry) {
    return null;
  }

  if (isExpired(entry.expiresAt)) {
    delete incidents[id];
    await writeStore(incidents);
    return null;
  }

  return entry.data;
}

export async function removeIncident(id) {
  const incidents = await readStore();
  delete incidents[id];
  await writeStore(incidents);
}

/**
 * Returns all non-expired incidents as an array, newest first.
 * Used by GET /api/incidents in the dashboard.
 */
export async function getAllIncidents() {
  const incidents = await readStore();
  const now = Date.now();
  return Object.values(incidents)
    .filter((entry) => !entry.expiresAt || now <= new Date(entry.expiresAt).getTime())
    .map((entry) => entry.data)
    .sort((a, b) => new Date(b.hitl?.hitl_initiated_at || b.triggered_at || 0) - new Date(a.hitl?.hitl_initiated_at || a.triggered_at || 0));
}
