// services/incident-store.js
// Persistent incident store backed by a local JSON file.
// Falls back gracefully if the file can't be written (e.g. read-only FS).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const STORE_FILE = join(DATA_DIR, 'incidents.json');

// Ensure the data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Reads the current store from disk, returns a plain object { [id]: incident }.
 */
function readStore() {
  try {
    if (!existsSync(STORE_FILE)) return {};
    return JSON.parse(readFileSync(STORE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

/**
 * Writes the store object back to disk.
 */
function writeStore(store) {
  try {
    writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('⚠️  Could not persist incident store to disk:', err.message);
  }
}

export function saveIncident(id, data) {
  const store = readStore();
  store[id] = { ...data, saved_at: new Date().toISOString() };
  writeStore(store);
}

export function getIncident(id) {
  return readStore()[id] ?? null;
}

export function removeIncident(id) {
  const store = readStore();
  delete store[id];
  writeStore(store);
}

/**
 * Returns all incidents as an array, newest first.
 */
export function getAllIncidents() {
  const store = readStore();
  return Object.values(store).sort(
    (a, b) => new Date(b.saved_at) - new Date(a.saved_at)
  );
}
