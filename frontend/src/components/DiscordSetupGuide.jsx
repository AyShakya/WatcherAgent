import { useState } from 'react';
import { Settings, Eye, Cpu, Plus, ExternalLink, Check, Copy, CheckCircle2 } from 'lucide-react';

export default function DiscordSetupGuide({ globalBot, loading }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const inviteUrlPlaceholder = "https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=397284485184&scope=bot";

  const inviteUrl = globalBot?.isActive
    ? `https://discord.com/api/oauth2/authorize?client_id=${globalBot.clientId}&permissions=397284485184&scope=bot`
    : inviteUrlPlaceholder;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 text-left animate-fade min-h-0">
      <div className="max-w-[900px] mx-auto bg-surface-container-low border border-warm-gray/20 rounded-2xl p-6 md:p-8 shadow-sm">
        
        {/* Banner header */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10 text-left">
            <h2 className="font-display text-2xl font-bold text-ink-black mb-2 flex items-center gap-2">
              <span className="p-1.5 bg-primary/20 rounded-lg text-primary">
                <Settings className="w-5 h-5" />
              </span>
              Discord Bot Integration Setup
            </h2>
            <p className="text-sm text-on-surface-variant max-w-[650px] leading-relaxed">
              To request fixes and get real-time approvals (HITL - Human-in-the-Loop) directly inside your Discord servers, you must configure a Discord Bot Token and Channel ID for your project. Follow these quick steps to get set up.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 pointer-events-none flex items-center justify-center">
            <Eye className="w-48 h-48" />
          </div>
        </div>

        {/* Global Shared Bot helper card */}
        {loading ? (
          <div className="h-[96px] animate-pulse rounded-xl mb-8 bg-surface-container-lowest border border-warm-gray/20 flex items-center justify-center text-xs text-warm-gray font-semibold">
            Retrieving global shared bot configurations...
          </div>
        ) : globalBot?.isActive ? (
          <div className="bg-gradient-to-r from-[#5865F2]/10 to-[#5865F2]/5 border border-[#5865F2]/20 rounded-xl p-5 md:p-6 mb-8 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade shadow-sm">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-full bg-[#5865F2] flex items-center justify-center text-white shrink-0 relative shadow-sm">
                {globalBot.avatar ? (
                  <img src={globalBot.avatar} alt="Bot Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Cpu className="w-6 h-6" />
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-surface-container-low rounded-full"></span>
              </div>
              <div className="min-w-0 text-left">
                <span className="text-[10px] font-bold text-[#5865F2] uppercase tracking-wider block mb-0.5">Shared Global Bot Configured</span>
                <h4 className="m-0 text-base font-bold text-ink-black truncate">{globalBot.username}</h4>
                <p className="m-0 text-xs text-on-surface-variant leading-relaxed">
                  You can use the platform's shared bot. Simply click invite and set up only the Channel ID in your project!
                </p>
              </div>
            </div>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 bg-[#5865F2] text-white border-none rounded-lg px-5 py-2.5 text-xs font-semibold cursor-pointer transition-all hover:opacity-90 active:scale-95 no-underline shadow-sm"
            >
              <Plus className="w-4 h-4" /> Invite Shared Bot
            </a>
          </div>
        ) : null}

        {/* Steps */}
        <div className="flex flex-col gap-6">
          
          {/* Step 1 */}
          <div className="flex gap-4 md:gap-6 border-b border-warm-gray/10 pb-6 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-bold text-ink-black mb-2">Create a Discord Application</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                Go to the <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold inline-flex items-center gap-1">Discord Developer Portal <ExternalLink className="w-3.5 h-3.5" /></a> and log in with your Discord account.
              </p>
              <ul className="list-disc pl-5 text-sm text-on-surface-variant space-y-1.5 leading-relaxed">
                <li>Click on the <strong>New Application</strong> button at the top right.</li>
                <li>Enter a name for your bot (e.g. <code>WatcherAgent Core</code>) and click <strong>Create</strong>.</li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 md:gap-6 border-b border-warm-gray/10 pb-6 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-bold text-ink-black mb-2">Configure Bot & Retrieve Token</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                In your Application dashboard, navigate to the <strong>Bot</strong> tab on the left sidebar:
              </p>
              <ul className="list-disc pl-5 text-sm text-on-surface-variant space-y-2 leading-relaxed">
                <li>Click <strong>Add Bot</strong> (if prompted) to turn your application into a bot.</li>
                <li>Under the <strong>Token</strong> section, click <strong>Reset Token</strong> to reveal your bot token. Copy this token immediately and save it somewhere secure. This is your <code>Discord Bot Token</code>.</li>
                <li>
                  Scroll down to the <strong>Privileged Gateway Intents</strong> section and enable:
                  <div className="flex flex-col gap-1.5 mt-2 bg-paper-surface border border-warm-gray/10 rounded-lg p-3 max-w-[400px]">
                    <span className="text-xs font-semibold text-ink-black flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Guild Members Intent
                    </span>
                    <span className="text-xs font-semibold text-ink-black flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Message Content Intent
                    </span>
                  </div>
                </li>
                <li>Click <strong>Save Changes</strong> at the bottom.</li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 md:gap-6 border-b border-warm-gray/10 pb-6 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-bold text-ink-black mb-2">Invite the Bot to your Discord Server</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                Generate the invite link to authorize the bot on your target server:
              </p>
              <ul className="list-disc pl-5 text-sm text-on-surface-variant space-y-2 leading-relaxed mb-4">
                <li>Go to the <strong>OAuth2</strong> tab, and click <strong>URL Generator</strong> under it.</li>
                <li>Under <strong>Scopes</strong>, check the <code>bot</code> box.</li>
                <li>Under <strong>Bot Permissions</strong>, select the following permissions:
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2 text-xs font-semibold text-ink-black max-w-[500px]">
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Send Messages</span>
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Create Public Threads</span>
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Send Messages in Threads</span>
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Embed Links</span>
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-primary" /> Read Message History</span>
                  </div>
                </li>
                <li>Copy the generated URL at the bottom and open it in a new browser tab to add the bot to your server.</li>
              </ul>
              <div className="bg-paper-surface border border-warm-gray/20 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="min-w-0 flex-1 text-left">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
                    {globalBot?.isActive ? 'Global Bot Invite Link' : 'Standard Invite URL (Replace client_id with your application ID)'}
                  </span>
                  <code className="text-xs break-all block text-on-surface-variant font-mono">{inviteUrl}</code>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 flex items-center gap-1.5 bg-primary text-on-primary border-none rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer transition-all hover:opacity-90 active:scale-95"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4 md:gap-6 border-b border-warm-gray/10 pb-6 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-bold text-ink-black mb-2">Get Discord Channel ID</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Now open the Discord client:
              </p>
              <ul className="list-disc pl-5 text-sm text-on-surface-variant space-y-1.5 leading-relaxed mt-2">
                <li>Go to <strong>User Settings</strong> → <strong>Advanced</strong>, and toggle <strong>Developer Mode</strong> ON.</li>
                <li>Right-click on the specific channel in your server where alerts should be posted, and select <strong>Copy Channel ID</strong>.</li>
              </ul>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-4 md:gap-6 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
              5
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-bold text-ink-black mb-2">Update Project Settings</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Return to the <strong>Console Dashboard</strong> tab on the left sidebar:
              </p>
              <ul className="list-disc pl-5 text-sm text-on-surface-variant space-y-1.5 leading-relaxed mt-2">
                <li>Create a new project or edit your existing project.</li>
                <li>Paste the <strong>Discord Channel ID</strong> and your copied <strong>Discord Bot Token</strong> into the respective fields.</li>
                <li>Click <strong>Save Changes / Activate Project Webhook</strong> to persist.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Tip Box */}
        <div className="mt-8 bg-paper-surface border border-warm-gray/20 rounded-xl p-5 text-left flex gap-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary h-fit shrink-0">
            <Eye className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left">
            <h4 className="m-0 mb-1 text-sm font-bold text-ink-black">Graceful Fallback Mode</h4>
            <p className="m-0 text-xs text-on-surface-variant leading-relaxed">
              If you leave the <strong>Discord Bot Token</strong> field empty on your project settings, the server will automatically default to using the global bot configured in the system environment (if one exists). This allows administrators to set up one bot for all users, or let users configure their own bots for complete isolation!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
