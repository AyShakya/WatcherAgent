import { useState } from 'react';
import { GitBranch, ExternalLink, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export default function IncidentDetailsDrawer({
  selectedIncident,
  setSelectedIncident,
  getSeverityBadgeClass,
  token,
  onActionSuccess
}) {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  if (!selectedIncident) return null;

  const handleAction = async (action) => {
    setActionLoading(true);
    setActionError('');
    try {
      const res = await fetch(`${API_BASE}/callback/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          incidentId: selectedIncident.id,
          action,
          comment: `Manually ${action.toLowerCase()}d via Web Dashboard.`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSelectedIncident(null);
        if (onActionSuccess) onActionSuccess();
      } else {
        setActionError(data.error || `Failed to ${action.toLowerCase()} incident.`);
      }
    } catch {
      setActionError('Network connection failure.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink-black/20 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade" onClick={() => setSelectedIncident(null)}>
      <div 
        className="absolute right-0 top-0 bottom-0 h-full max-w-[520px] w-full bg-surface-container-lowest border-l border-warm-gray/20 shadow-[-10px_0_30px_rgba(36,34,32,0.06)] flex flex-col overflow-hidden animate-slide-in text-left" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 py-6 border-b border-warm-gray/10 flex justify-between items-center bg-surface-container-lowest shrink-0">
          <div className="flex items-center gap-3">
            <span className={`text-[9px] font-extrabold rounded px-1.5 py-0.5 tracking-wide ${getSeverityBadgeClass(selectedIncident.severity)}`}>
              {selectedIncident.severity}
            </span>
            <h2 className="font-display text-lg font-bold m-0 text-ink-black">Incident: {selectedIncident.id.slice(0, 8)}...</h2>
          </div>
          <button 
            type="button"
            className="bg-transparent border-none text-warm-gray hover:text-ink-black text-2xl cursor-pointer p-1 leading-none transition-colors" 
            onClick={() => setSelectedIncident(null)}
          >
            &times;
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6 text-left min-h-0">
          {/* Pipeline Visual Progress */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Pipeline Visual Progress</span>
            <div className="flex items-center justify-between mt-2.5 mb-5 bg-surface-container-low border border-warm-gray/20 px-3 py-4 rounded-lg relative overflow-x-auto">
              {/* Connector line */}
              <div className="absolute top-[26px] left-[10%] right-[10%] h-0.5 bg-warm-gray/20 z-[1]"></div>
              
              {[
                { num: 1, label: 'Triage', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : (selectedIncident.status === 'TRIGGERED' || selectedIncident.status === 'QUEUED') ? 'active' : 'completed' },
                { num: 2, label: 'Approval', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : (selectedIncident.status === 'TRIGGERED' || selectedIncident.status === 'QUEUED') ? 'inactive' : selectedIncident.status === 'AWAITING_APPROVAL' ? 'active' : 'completed' },
                { num: 3, label: 'Fixer', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : (selectedIncident.status === 'TRIGGERED' || selectedIncident.status === 'QUEUED' || selectedIncident.status === 'AWAITING_APPROVAL') ? 'inactive' : selectedIncident.status === 'FIXING' ? 'active' : 'completed' },
                { num: 4, label: 'Memory', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : 'inactive' }
              ].map(step => {
                const state = step.getState();
                const dotClass = state === 'completed' 
                  ? 'bg-success/10 border-success text-success' 
                  : state === 'active' 
                  ? 'bg-primary/10 border-primary text-primary animate-pulse' 
                  : 'bg-surface-container border-warm-gray/20 text-warm-gray';
                const labelClass = state === 'completed' ? 'text-ink-black font-semibold' : state === 'active' ? 'text-primary font-semibold' : 'text-warm-gray';
                return (
                  <div key={step.num} className="flex flex-col items-center flex-1 relative z-10 min-w-[70px]">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${dotClass}`}>
                      {step.num}
                    </div>
                    <div className={`text-[10px] mt-1.5 uppercase tracking-wider text-center ${labelClass}`}>{step.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Incident Metadata Details */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Incident Execution Metadata</span>
            <div className="bg-surface-container-low border border-warm-gray/20 px-4 py-3 rounded-lg grid grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold uppercase text-warm-gray">Remediation Status</span>
                <span className="text-ink-black font-semibold">{selectedIncident.status}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold uppercase text-warm-gray">LLM Model Target</span>
                <span className="text-ink-black font-semibold">Gemini 2.5 Flash</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold uppercase text-warm-gray">Error Category</span>
                <span className="text-ink-black font-semibold">{selectedIncident.category || 'PENDING'}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold uppercase text-warm-gray">Ingested At</span>
                <span className="text-ink-black font-semibold">{new Date(selectedIncident.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Manual Gatekeeper Controls */}
          {['TRIGGERED', 'TRIAGED', 'AWAITING_APPROVAL'].includes(selectedIncident.status) && (
            <div className="flex flex-col gap-2 bg-primary/5 border border-primary/20 rounded-xl p-4 mt-2">
              <span className="text-[10px] font-bold uppercase text-primary tracking-wider">Manual Gatekeeper Controls</span>
              <p className="text-xs text-on-surface-variant m-0 mt-1 leading-relaxed">
                Take immediate action to approve the patch pipeline or dismiss this incident directly from the web console.
              </p>
              {actionError && (
                <div className="text-xs text-danger font-semibold mt-2">
                  ❌ {actionError}
                </div>
              )}
              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => handleAction('APPROVE')}
                  disabled={actionLoading}
                  className="flex-1 bg-success hover:bg-success/90 text-on-primary border border-none rounded-lg py-2.5 text-xs font-bold cursor-pointer active:scale-95 duration-150 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : 'Approve & Patch Code'}
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('REJECT')}
                  disabled={actionLoading}
                  className="bg-transparent hover:bg-danger/10 text-danger border border-danger/30 rounded-lg px-4 py-2.5 text-xs font-bold cursor-pointer active:scale-95 duration-150 transition-all disabled:opacity-60"
                >
                  Dismiss Alert
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Normalized Error Signature</span>
            <pre className="bg-surface-container border border-warm-gray/20 rounded-lg p-4 font-mono text-xs text-danger m-0 whitespace-pre-wrap break-all">
              {selectedIncident.error_signature}
            </pre>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Incident Remediation Timeline</span>
            <div className="flex flex-col gap-5 relative pl-5 border-l-2 border-warm-gray/20 ml-2 py-1">
              {/* Timeline nodes */}
              {[
                { time: selectedIncident.created_at, label: 'Alert received & triaged', desc: `Ingested ${selectedIncident.category || ''} payload.` },
                selectedIncident.discord_message_id && { time: selectedIncident.updated_at, label: 'Discord Approval Card Sent', desc: `Interactive thread initiated in Discord.` },
                selectedIncident.pr_url && { time: selectedIncident.updated_at, label: 'Agent Workspace PR Drafted', desc: 'Code patched, tests verified in isolation.' },
                selectedIncident.status === 'CLOSED_AND_LEARNED' && { time: selectedIncident.updated_at, label: 'Resolution learned', desc: 'Markdown postmortem injected to Pinecone.' }
              ].filter(Boolean).map((node, index) => (
                <div key={index} className="relative text-xs">
                  <span className="absolute -left-[27px] top-[3px] w-2.5 h-2.5 rounded-full bg-primary border-2 border-surface-container-lowest"></span>
                  <div className="font-semibold text-ink-black">{node.label}</div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{node.desc}</div>
                  <div className="text-[10px] text-warm-gray font-mono mt-1">{new Date(node.time).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedIncident.pr_url && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Remediation PR Target</span>
              <a 
                href={selectedIncident.pr_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary border border-none rounded-lg p-3 text-xs font-semibold no-underline transition-opacity duration-150 hover:opacity-90 active:scale-[0.98]"
              >
                <GitBranch className="w-4 h-4" /> View Opened Pull Request <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
