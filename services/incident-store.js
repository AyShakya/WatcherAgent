// services/incident-store.js
// In-memory store for active incidents

const activeIncidents = new Map();

export const saveIncident = (id, data) => activeIncidents.set(id, data);
export const getIncident = (id) => activeIncidents.get(id);
export const removeIncident = (id) => activeIncidents.delete(id);
