import { GitBranch, Edit, Trash2, Check, Copy, Play } from 'lucide-react';

export default function ProjectCard({
  project,
  handleOpenEditModal,
  handleDeleteProject,
  handleCopyWebhook,
  copiedStates,
  handleTriggerTestIncident,
  API_BASE
}) {
  return (
    <div className="bg-surface-container border border-warm-gray/20 rounded-lg p-5 text-left transition-all duration-200 hover:border-primary/25">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display text-base font-semibold m-0 mb-1.5 text-ink-black">{project.name}</h3>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
            <GitBranch className="w-3.5 h-3.5 text-primary" />
            <span>{project.github_owner}/{project.github_repo}</span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <button 
            type="button"
            className="bg-transparent border-none text-warm-gray cursor-pointer p-1 rounded-lg transition-all duration-150 hover:bg-primary/10 hover:text-primary" 
            title="Edit Credentials" 
            onClick={() => handleOpenEditModal(project)}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            type="button"
            className="bg-transparent border-none text-warm-gray cursor-pointer p-1 rounded-lg transition-all duration-150 hover:bg-danger/10 hover:text-danger" 
            title="Delete Project" 
            onClick={() => handleDeleteProject(project.id)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Webhook Configuration panel */}
      <div className="bg-surface-container-low border border-warm-gray/20 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">Secure Ingest Webhook</span>
          <span className="text-[9px] font-extrabold bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5">Active</span>
        </div>
        <div className="flex items-center bg-paper-surface border border-warm-gray/20 rounded-lg px-3 py-2 justify-between gap-3 overflow-hidden">
          <code className="font-mono text-xs text-primary whitespace-nowrap overflow-x-auto text-left scrollbar-none flex-1">
            {`${API_BASE}/webhook/${project.webhook_secret}`}
          </code>
          <button 
            type="button"
            className="bg-transparent border-none text-on-surface-variant cursor-pointer p-1.5 rounded-lg flex items-center justify-center transition-all duration-150 hover:text-ink-black hover:bg-surface-container shrink-0" 
            onClick={() => handleCopyWebhook(project.webhook_secret, project.id)}
            title="Copy URL"
          >
            {copiedStates[project.id] ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <div className="mt-3">
          <button 
            type="button"
            className="w-full flex items-center justify-center gap-1.5 bg-success/10 border border-success/20 hover:bg-success/20 text-success rounded-lg py-2.5 text-xs font-semibold cursor-pointer transition-all duration-150 active:scale-[0.98]"
            onClick={() => handleTriggerTestIncident(project.webhook_secret, project.name)}
          >
            <Play className="w-3.5 h-3.5" /> Fire Test Alert (Ingestion Queue)
          </button>
        </div>
      </div>
    </div>
  );
}
