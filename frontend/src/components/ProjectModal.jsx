import { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff, Loader2 } from 'lucide-react';

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
  handleCreateProject,
  projLlmProvider,
  setProjLlmProvider,
  projLlmModel,
  setProjLlmModel,
  projLlmModelsList,
  projLlmCredits,
  projLlmVerifying,
  projLlmVerificationError,
  handleVerifyLlmKey
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Eye toggle states for password/token fields
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showDiscordBotToken, setShowDiscordBotToken] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);

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
          {/* Required Configuration */}
          <div className="text-[10px] font-bold tracking-widest text-primary uppercase mb-3 pb-1 border-b border-dashed border-warm-gray/20">Required Settings</div>
          
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
              <div className="relative w-full">
                <input 
                  type={showGithubToken ? "text" : "password"} 
                  value={projGithubToken} 
                  onChange={(e) => setProjGithubToken(e.target.value)} 
                  placeholder="ghp_xxxxxxxxxxxx (Requires repo scopes)" 
                  required 
                  className="bg-paper-surface border border-warm-gray/20 rounded-lg pl-4 pr-10 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-warm-gray hover:text-ink-black cursor-pointer flex items-center justify-center p-1 outline-none transition-colors"
                >
                  {showGithubToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-2 text-left">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Discord Incident Channel ID</label>
              <input 
                type="text" 
                value={projDiscordChannel} 
                onChange={(e) => setProjDiscordChannel(e.target.value)} 
                placeholder="e.g. 1122334455" 
                required 
                className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
              />
            </div>
          </div>

          {/* Advanced / Optional Configurations */}
          <div className="mt-6 border border-warm-gray/15 rounded-xl overflow-hidden bg-paper-surface/5">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-5 py-4 bg-paper-surface hover:bg-paper-surface/60 transition-colors text-left border-none outline-none cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-ink-black uppercase tracking-wider">Advanced Configuration</span>
                <span className="text-[10px] text-on-surface-variant font-medium">Configure custom models, keys, and bot integrations (with fallbacks)</span>
              </div>
              <div className="text-warm-gray">
                {showAdvanced ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </div>
            </button>

            {showAdvanced && (
              <div className="px-5 py-5 border-t border-warm-gray/10 bg-surface-container-lowest/40 flex flex-col gap-4">
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Discord Bot Token (Optional)</label>
                  <div className="relative w-full">
                    <input 
                      type={showDiscordBotToken ? "text" : "password"} 
                      value={projDiscordBotToken || ''} 
                      onChange={(e) => setProjDiscordBotToken(e.target.value)} 
                      placeholder="Falls back to global server bot if empty" 
                      className="bg-paper-surface border border-warm-gray/20 rounded-lg pl-4 pr-10 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDiscordBotToken(!showDiscordBotToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-warm-gray hover:text-ink-black cursor-pointer flex items-center justify-center p-1 outline-none transition-colors"
                    >
                      {showDiscordBotToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="border-t border-warm-gray/10 my-2"></div>

                <div className="flex flex-col gap-2 text-left w-full">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">LLM Provider</label>
                  <select
                    value={projLlmProvider}
                    onChange={(e) => setProjLlmProvider(e.target.value)}
                    className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                  >
                    <option value="OPENROUTER">OpenRouter (Unified API Gateway)</option>
                    <option value="OPENAI">OpenAI (Direct API Key)</option>
                    <option value="ANTHROPIC">Anthropic Claude (Direct API Key)</option>
                    <option value="GEMINI">Google Gemini (Direct API Key)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 text-left">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    {projLlmProvider === 'OPENROUTER' ? 'OpenRouter API Key (Optional)' :
                     projLlmProvider === 'OPENAI' ? 'OpenAI Secret Key (Optional)' :
                     projLlmProvider === 'ANTHROPIC' ? 'Anthropic API Key (Optional)' :
                     'Google AI Studio API Key (Optional)'}
                  </label>
                  <div className="flex gap-2 w-full">
                    <div className="relative flex-1">
                      <input 
                        type={showOpenRouterKey ? "text" : "password"} 
                        value={projOpenRouterKey || ''} 
                        onChange={(e) => setProjOpenRouterKey(e.target.value)} 
                        placeholder="Falls back to system-wide fallbacks if empty" 
                        className="bg-paper-surface border border-warm-gray/20 rounded-lg pl-4 pr-10 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-warm-gray hover:text-ink-black cursor-pointer flex items-center justify-center p-1 outline-none transition-colors"
                      >
                        {showOpenRouterKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVerifyLlmKey(projLlmProvider, projOpenRouterKey)}
                      disabled={projLlmVerifying}
                      className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 rounded-lg px-4 py-2 text-xs font-semibold shrink-0 cursor-pointer active:scale-95 duration-150 transition-all disabled:opacity-50"
                    >
                      {projLlmVerifying ? 'Verifying...' : 'Verify & Load Models'}
                    </button>
                  </div>
                </div>

                {projLlmVerificationError && (
                  <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 text-xs text-danger text-left font-semibold">
                    ❌ {projLlmVerificationError}
                  </div>
                )}

                {projLlmCredits && (
                  <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-xs text-success text-left font-semibold flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                      <span>Key Verified Successfully: <strong>{projLlmCredits.label || 'Active'}</strong></span>
                    </div>
                    {projLlmCredits.usage !== undefined && (
                      <span className="text-[10px] text-on-surface-variant font-medium ml-3">
                        Usage: ${Number(projLlmCredits.usage).toFixed(4)} {projLlmCredits.limit_remaining !== null ? `| Credits Remaining: $${Number(projLlmCredits.limit_remaining).toFixed(4)}` : ''}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2 text-left w-full">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Target Model</label>
                  {projLlmModelsList && projLlmModelsList.length > 0 ? (
                    <select
                      value={projLlmModel}
                      onChange={(e) => setProjLlmModel(e.target.value)}
                      className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                    >
                      {projLlmModelsList.map((m) => (
                        <option key={m.id} value={m.id}>{m.name || m.id}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={projLlmModel}
                      onChange={(e) => setProjLlmModel(e.target.value)}
                      placeholder="Enter model slug (e.g. google/gemini-2.5-flash)"
                      className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                    />
                  )}
                  <span className="text-[10px] text-warm-gray">
                    {projLlmModelsList && projLlmModelsList.length > 0
                      ? 'Successfully loaded models from API.'
                      : 'Enter a custom model identifier or verify your API key above to load provider directory.'}
                  </span>
                </div>

                <div className="border-t border-warm-gray/10 my-2"></div>

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
            )}
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
              className="bg-primary text-on-primary border-none rounded-lg px-5 py-2.5 text-xs font-semibold cursor-pointer transition-all duration-150 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5" 
              disabled={projFormLoading}
            >
              {projFormLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{editingProject ? 'Saving Changes...' : 'Configuring Project...'}</span>
                </>
              ) : (
                <span>{editingProject ? 'Save Changes' : 'Activate Project Webhook'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
