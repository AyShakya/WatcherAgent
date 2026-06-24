import { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function ProjectModal({
  showProjectModal,
  setShowProjectModal,
  editingProject,
  projName,
  projDesc,
  projGithubOwner,
  projGithubRepo,
  projGithubToken,
  projDiscordChannel,
  projDiscordBotToken,
  projOpenRouterKey,
  projFormError,
  setProjFormError,
  projFormLoading,
  handleCreateProject,
  projLlmProvider,
  projLlmModel,
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

  // Local state to prevent lag on keystroke
  const [name, setName] = useState(projName || '');
  const [desc, setDesc] = useState(projDesc || '');
  const [githubOwner, setGithubOwner] = useState(projGithubOwner || '');
  const [githubRepo, setGithubRepo] = useState(projGithubRepo || '');
  const [githubToken, setGithubToken] = useState(projGithubToken || '');
  const [discordChannel, setDiscordChannel] = useState(projDiscordChannel || '');
  const [discordBotToken, setDiscordBotToken] = useState(projDiscordBotToken || '');
  const [openRouterKey, setOpenRouterKey] = useState(projOpenRouterKey || '');
  const [llmProvider, setLlmProvider] = useState(projLlmProvider || 'OPENROUTER');
  const [llmModel, setLlmModel] = useState(projLlmModel || '');

  // Adjust local state when parent LLM model changes (e.g. from key verification loaded defaults)
  const [prevProjLlmModel, setPrevProjLlmModel] = useState(projLlmModel);
  if (projLlmModel !== prevProjLlmModel) {
    setPrevProjLlmModel(projLlmModel);
    setLlmModel(projLlmModel || '');
  }

  // Adjust local state when parent LLM provider changes
  const [prevProjLlmProvider, setPrevProjLlmProvider] = useState(projLlmProvider);
  if (projLlmProvider !== prevProjLlmProvider) {
    setPrevProjLlmProvider(projLlmProvider);
    setLlmProvider(projLlmProvider || 'OPENROUTER');
  }

  if (!showProjectModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreateProject(e, {
      name,
      description: desc,
      github_owner: githubOwner,
      github_repo: githubRepo,
      github_token: githubToken,
      discord_channel_id: discordChannel,
      discord_bot_token: discordBotToken,
      openrouter_key: openRouterKey,
      llm_provider: llmProvider,
      llm_model: llmModel
    });
  };

  const renderError = (errorText) => {
    if (!errorText) return null;
    
    const blocks = errorText.split('\n\n').filter(Boolean);
    
    return (
      <div className="flex flex-col gap-3 px-8 pt-4 pb-0 shrink-0">
        {blocks.map((block, idx) => {
          const issueMatch = block.match(/Issue:\s*(.*)/i);
          const solutionMatch = block.match(/Solution:\s*(.*)/i);
          
          if (issueMatch || solutionMatch) {
            const issue = issueMatch ? issueMatch[1] : '';
            const solution = solutionMatch ? solutionMatch[1] : '';
            
            return (
              <div key={idx} className="bg-danger/5 border-l-4 border-danger p-4 rounded-r-lg text-left text-xs font-sans shadow-sm">
                {issue && (
                  <div className="mb-2 flex flex-col gap-0.5">
                    <span className="font-bold text-danger uppercase tracking-wider text-[9px] bg-danger/10 px-1.5 py-0.5 rounded w-max">Issue</span>
                    <span className="text-on-surface font-medium mt-0.5">{issue}</span>
                  </div>
                )}
                {solution && (
                  <div className="flex flex-col gap-0.5 mt-1.5">
                    <span className="font-bold text-success uppercase tracking-wider text-[9px] bg-success/10 px-1.5 py-0.5 rounded w-max">Solution</span>
                    <span className="text-on-surface-variant font-medium mt-0.5">{solution}</span>
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <div key={idx} className="bg-danger/10 border border-danger/20 text-danger text-[13px] p-3 rounded-md text-center font-medium">
              {block}
            </div>
          );
        })}
      </div>
    );
  };

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

        {renderError(projFormError)}
        
        <form onSubmit={handleSubmit} className="px-8 py-6 overflow-y-auto text-left max-h-[70vh] flex-1">
          {/* Required Configuration */}
          <div className="text-[10px] font-bold tracking-widest text-primary uppercase mb-3 pb-1 border-b border-dashed border-warm-gray/20">Required Settings</div>
          
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-2 text-left">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Project / Service Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
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
                value={githubOwner} 
                onChange={(e) => setGithubOwner(e.target.value)} 
                placeholder="org-or-username" 
                required 
                className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
              />
            </div>
            <div className="flex flex-col gap-2 text-left flex-1">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">GitHub Repo Name</label>
              <input 
                type="text" 
                value={githubRepo} 
                onChange={(e) => setGithubRepo(e.target.value)} 
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
                  value={githubToken} 
                  onChange={(e) => setGithubToken(e.target.value)} 
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
                value={discordChannel} 
                onChange={(e) => setDiscordChannel(e.target.value)} 
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
                      value={discordBotToken || ''} 
                      onChange={(e) => setDiscordBotToken(e.target.value)} 
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
                    value={llmProvider}
                    onChange={(e) => setLlmProvider(e.target.value)}
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
                    {llmProvider === 'OPENROUTER' ? 'OpenRouter API Key (Optional)' :
                     llmProvider === 'OPENAI' ? 'OpenAI Secret Key (Optional)' :
                     llmProvider === 'ANTHROPIC' ? 'Anthropic API Key (Optional)' :
                     'Google AI Studio API Key (Optional)'}
                  </label>
                  <div className="flex gap-2 w-full">
                    <div className="relative flex-1">
                      <input 
                        type={showOpenRouterKey ? "text" : "password"} 
                        value={openRouterKey || ''} 
                        onChange={(e) => setOpenRouterKey(e.target.value)} 
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
                      onClick={() => handleVerifyLlmKey(llmProvider, openRouterKey)}
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
                      value={llmModel}
                      onChange={(e) => setLlmModel(e.target.value)}
                      className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                    >
                      {projLlmModelsList.map((m) => (
                        <option key={m.id} value={m.id}>{m.name || m.id}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={llmModel}
                      onChange={(e) => setLlmModel(e.target.value)}
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
                    value={desc} 
                    onChange={(e) => setDesc(e.target.value)} 
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
