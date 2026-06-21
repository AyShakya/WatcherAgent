import { Cpu, Activity, AlertTriangle } from 'lucide-react';

export default function QuickMetrics({
  projectsCount,
  incidentsCount,
  awaitingApprovalCount
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-8 mt-6 shrink-0 bg-transparent">
      <div className="bg-surface-container-low border border-warm-gray/20 rounded-xl p-6 text-left hover:border-primary/30 transition-all duration-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Active Projects</span>
          <span className="p-2 bg-primary/10 rounded-lg text-primary">
            <Cpu className="w-4 h-4" />
          </span>
        </div>
        <div className="font-display text-4xl font-semibold text-ink-black mb-1">{projectsCount}</div>
        <div className="text-xs text-warm-gray">Configured environments</div>
      </div>
      
      <div className="bg-surface-container-low border border-warm-gray/20 rounded-xl p-6 text-left hover:border-primary/30 transition-all duration-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Total Alert Volume</span>
          <span className="p-2 bg-secondary/10 rounded-lg text-secondary">
            <Activity className="w-4 h-4" />
          </span>
        </div>
        <div className="font-display text-4xl font-semibold text-ink-black mb-1">{incidentsCount}</div>
        <div className="text-xs text-warm-gray">Remediated via pipeline</div>
      </div>

      <div className="bg-surface-container-low border border-warm-gray/20 rounded-xl p-6 text-left hover:border-primary/30 transition-all duration-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Awaiting Approval</span>
          <span className="p-2 bg-tertiary/10 rounded-lg text-tertiary">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>
        <div className="font-display text-4xl font-semibold text-ink-black mb-1">
          {awaitingApprovalCount}
        </div>
        <div className="text-xs text-warm-gray">HITL Discord checkouts</div>
      </div>
    </section>
  );
}
