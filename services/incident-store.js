// services/incident-store.js
// In-memory store for active incidents and their HITL expiry timers

const activeIncidents = new Map();
const incidentTimeouts = new Map();

export const saveIncident = (id, data) => activeIncidents.set(id, data);
export const getIncident = (id) => activeIncidents.get(id);

export const saveIncidentTimeout = (id, timeoutRef) => {
  const existingTimeout = incidentTimeouts.get(id);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  incidentTimeouts.set(id, timeoutRef);
};

export const clearIncidentTimeout = (id) => {
  const timeoutRef = incidentTimeouts.get(id);
  if (timeoutRef) {
    clearTimeout(timeoutRef);
    incidentTimeouts.delete(id);
  }
};

export const removeIncident = (id) => {
  clearIncidentTimeout(id);
  return activeIncidents.delete(id);
};
