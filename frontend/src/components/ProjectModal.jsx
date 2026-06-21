export default function ProjectModal({
  showProjectModal,
  setShowProjectModal,
  editingProject,
  projName,
  setProjName,
  projDesc,
  setProjDesc,
  projGithubOwner,
  setProjGithubOwner,
  projGithubRepo,
  setProjGithubRepo,
  projGithubToken,
  setProjGithubToken,
  projDiscordChannel,
  setProjDiscordChannel,
  projDiscordBotToken,
  setProjDiscordBotToken,
  projOpenRouterKey,
  setProjOpenRouterKey,
  projFormError,
  setProjFormError,
  projFormLoading,
  handleCreateProject
}) {
  if (!showProjectModal) return null;

  return (
    <div className="fixed inset-0 bg-ink-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-fade">
      <div className="bg-surface-container-lowest border border-warm-gray/20 rounded-xl w-full max-w-[600px] shadow-[0_20px_40px_rgba(36,34,32,0.08)] overflow-hidden flex flex-col max-h-[90vh] text-left">
        <div className="px-8 py-6 border-b border-warm-gray/10 flex justify-between items-center bg-surface-container-lowest shrink-0">
          <div>
            <h2 className="font-display text-xl font-bold m-0 text-ink-black">
              {editingProject ? 'Edit Project Credentials' : 'Onboard New Project'}
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">
              {editingProject 
                ? 'Modify your repository and alert integration parameters.' 
                : 'Configure your repository and alert endpoints to start monitoring.'}
            </p>
          </div>
          <button 
            type="button"
            className="bg-transparent border-none text-warm-gray hover:text-ink-black text-2xl cursor-pointer p-1 leading-none transition-colors" 
            onClick={() => { setShowProjectModal(false); setProjFormError(''); }}
          >
            &times;
          </button>
        </div>
        {projFormError && (
          <div className="bg-danger/10 border-l-[3px] border-l-danger text-danger text-xs px-8 py-3 font-semibold text-left shrink-0">
            {projFormError}
          </div>
        )}
        
        <form onSubmit={handleCreateProject} className="px-8 py-6 overflow-y-auto text-left max-h-[70vh] flex-1">
          <div className="text-[10px] font-bold tracking-widest text-primary uppercase mb-3 pb-1 border-b border-dashed border-warm-gray/20">General Information</div>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-2 text-left">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Project / Service Name</label>
              <input 
                type="text" 
                value={projName} 
                onChange={(e) => setProjName(e.target.value)} 
                placeholder="e.g. Production Analytics API" 
                required 
                className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
              />
            </div>
          </div>

          <div className="text-[10px] font-bold tracking-widest text-primary uppercase mt-6 mb-3 pb-1 border-b border-dashed border-warm-gray/20">Git & Repository Details</div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex flex-col gap-2 text-left flex-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">GitHub Owner</label>
              <input 
                type="text" 
                value={projGithubOwner} 
                onChange={(e) => setProjGithubOwner(e.target.value)} 
                placeholder="org-or-username" 
                required 
                className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
              />
            </div>
            <div className="flex flex-col gap-2 text-left flex-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">GitHub Repo Name</label>
              <input 
                type="text" 
                value={projGithubRepo} 
                onChange={(e) => setProjGithubRepo(e.target.value)} 
                placeholder="repo-slug" 
                required 
                className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-2 text-left">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">GitHub PAT Token</label>
              <input 
                type="password" 
                value={projGithubToken} 
                onChange={(e) => setProjGithubToken(e.target.value)} 
                placeholder="ghp_xxxxxxxxxxxx (Requires repo scopes)" 
                required 
                className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
              />
            </div>
          </div>

          <div className="text-[10px] font-bold tracking-widest text-primary uppercase mt-6 mb-3 pb-1 border-b border-dashed border-warm-gray/20">Integrations & Knowledge Isolation</div>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex flex-col gap-2 text-left flex-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Discord Channel ID</label>
              <input 
                type="text" 
                value={projDiscordChannel} 
                onChange={(e) => setProjDiscordChannel(e.target.value)} 
                placeholder="e.g. 1122334455" 
                required 
                className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
              />
            </div>
            <div className="flex flex-col gap-2 text-left flex-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Discord Bot Token (Optional)</label>
              <input 
                type="password" 
                value={projDiscordBotToken} 
                onChange={(e) => setProjDiscordBotToken(e.target.value)} 
                placeholder="Falls back to global server bot if empty" 
                className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-2 text-left">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">OpenRouter LLM Key</label>
              <input 
                type="password" 
                value={projOpenRouterKey} 
                onChange={(e) => setProjOpenRouterKey(e.target.value)} 
                placeholder="sk-or-v1-..." 
                required 
                className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-2 text-left">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Custom Runbook preferences (Optional)</label>
              <input 
                type="text" 
                value={projDesc} 
                onChange={(e) => setProjDesc(e.target.value)} 
                placeholder="e.g. Run setup scripts before testing patches" 
                className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 shrink-0">
            <button 
              type="button" 
              className="bg-transparent text-on-surface-variant border border-warm-gray/30 rounded-lg px-5 py-2 text-xs font-semibold cursor-pointer transition-all duration-150 hover:bg-paper-surface hover:text-ink-black" 
              onClick={() => { setShowProjectModal(false); setProjFormError(''); }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-primary text-on-primary border-none rounded-lg px-5 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-150 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed" 
              disabled={projFormLoading}
            >
              {projFormLoading 
                ? (editingProject ? 'Saving Changes...' : 'Configuring Project...') 
                : (editingProject ? 'Save Changes' : 'Activate Project Webhook')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
