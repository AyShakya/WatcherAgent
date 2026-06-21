import { History } from 'lucide-react';

export default function IncidentsTable({
  incidents,
  loadingIncidents,
  setSelectedIncident,
  getSeverityBadgeClass,
  getStatusBadgeClass,
  incidentPage,
  setIncidentPage,
  INCIDENTS_PER_PAGE
}) {
  // Paginated Incidents
  const totalIncidentPages = Math.ceil(incidents.length / INCIDENTS_PER_PAGE) || 1;
  const clampedIncidentPage = Math.min(incidentPage, totalIncidentPages);
  const currentIncidents = incidents.slice((clampedIncidentPage - 1) * INCIDENTS_PER_PAGE, clampedIncidentPage * INCIDENTS_PER_PAGE);

  return (
    <div className="col-span-1 lg:col-span-5 bg-surface-container-low border border-warm-gray/20 rounded-xl flex flex-col overflow-hidden h-[500px] lg:h-full shadow-xs">
      <div className="px-6 py-[18px] border-b border-warm-gray/10 text-left bg-surface-container-low shrink-0">
        <h2 className="font-display text-base font-semibold m-0 text-ink-black">Active Incident Remediation logs</h2>
      </div>

      {loadingIncidents && incidents.length === 0 ? (
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-2 min-h-0">
          <div className="h-12 animate-skeleton rounded-lg shrink-0" />
          <div className="h-12 animate-skeleton rounded-lg shrink-0" style={{ animationDelay: '0.15s' }} />
          <div className="h-12 animate-skeleton rounded-lg shrink-0" style={{ animationDelay: '0.3s' }} />
          <div className="h-12 animate-skeleton rounded-lg shrink-0" style={{ animationDelay: '0.45s' }} />
        </div>
      ) : incidents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center min-h-0">
          <div className="w-16 h-16 mb-4 rounded-full bg-paper-surface flex items-center justify-center text-warm-gray border border-warm-gray/10 shrink-0">
            <History className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-on-surface-variant italic">No incidents logged yet</p>
          <div className="mt-6 w-full max-w-[160px] h-1 bg-warm-gray/10 rounded-full overflow-hidden shrink-0">
            <div className="h-full bg-primary/20 w-1/3"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto min-h-0">
            <table className="w-full border-collapse text-xs text-left table-fixed">
              <thead>
                <tr>
                  <th className="bg-surface-container px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant border-b border-warm-gray/20 sticky top-0 z-[2] w-[20%] text-center">Severity</th>
                  <th className="bg-surface-container px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant border-b border-warm-gray/20 sticky top-0 z-[2] w-[35%]">Service</th>
                  <th className="bg-surface-container px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant border-b border-warm-gray/20 sticky top-0 z-[2] w-[25%] text-center">Status</th>
                  <th className="bg-surface-container px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant border-b border-warm-gray/20 sticky top-0 z-[2] w-[20%] text-right">Logged At</th>
                </tr>
              </thead>
              <tbody>
                {currentIncidents.map(inc => (
                  <tr 
                    key={inc.id} 
                    onClick={() => setSelectedIncident(inc)}
                    className="cursor-pointer transition-colors duration-150 hover:bg-surface-container border-b border-warm-gray/10"
                  >
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[9px] rounded px-1.5 py-0.5 tracking-wide ${getSeverityBadgeClass(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-black truncate">
                      {inc.raw_payload?.service || 'service'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[9px] rounded-full px-2 py-0.5 inline-flex items-center ${getStatusBadgeClass(inc.status)}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[11px] text-on-surface-variant font-mono">
                      {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalIncidentPages > 1 && (
            <div className="px-6 py-4 border-t border-warm-gray/10 flex justify-between items-center bg-surface-container-low shrink-0 select-none rounded-b-xl">
              <span className="text-xs text-on-surface-variant">
                Showing <strong className="text-ink-black">{(clampedIncidentPage - 1) * INCIDENTS_PER_PAGE + 1}-{Math.min(clampedIncidentPage * INCIDENTS_PER_PAGE, incidents.length)}</strong> of <strong className="text-ink-black">{incidents.length}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIncidentPage(p => Math.max(1, p - 1))}
                  disabled={clampedIncidentPage === 1}
                  className="px-3 py-1.5 border border-warm-gray/30 rounded-lg text-xs font-semibold bg-transparent text-on-surface hover:bg-paper-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setIncidentPage(p => Math.min(totalIncidentPages, p + 1))}
                  disabled={clampedIncidentPage === totalIncidentPages}
                  className="px-3 py-1.5 border border-warm-gray/30 rounded-lg text-xs font-semibold bg-transparent text-on-surface hover:bg-paper-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
