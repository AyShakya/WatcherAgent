import { useState } from 'react';
import { Settings, Zap, AlertTriangle, Check, Copy } from 'lucide-react';

export default function WebhookSetupGuide() {
  const [copiedLink, setCopiedLink] = useState(false);
  const sampleSecret = "wh_b78e89f81ca90bd847ef89dc7e36ad18";
  
  const getSampleWebhookUrl = () => {
    // Generate dynamically from current browser location or fallback
    const origin = window.location.origin;
    const apiBase = origin.includes('localhost') ? 'http://localhost:3001' : origin;
    return `${apiBase}/api/v1/webhook/${sampleSecret}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getSampleWebhookUrl());
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
                <Zap className="w-5 h-5" />
              </span>
              Webhook Alert Ingestion Setup
            </h2>
            <p className="text-sm text-on-surface-variant max-w-[650px] leading-relaxed">
              Watcher Agent listens to incident alerts and triggers automated remediation runs using HTTP webhook payloads. Set up webhooks in your monitoring and hosting platforms to start auto-healing alerts.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 pointer-events-none flex items-center justify-center">
            <Zap className="w-48 h-48" />
          </div>
        </div>

        {/* Mandatory Setup Warning */}
        <div className="bg-warning/10 border-l-[4px] border-warning rounded-r-xl p-5 mb-8 text-left flex gap-4">
          <div className="p-1.5 bg-warning/20 rounded-lg text-warning h-fit shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <h4 className="m-0 mb-1 text-sm font-bold text-ink-black uppercase tracking-wider">Mandatory Production Requirement</h4>
            <p className="m-0 text-xs text-on-surface-variant leading-relaxed font-medium">
              You must set up the project webhook inside your production application, deployment pipeline, or incident management console. <strong>The Watcher Agent cannot detect problems on its own; it relies entirely on a successful webhook payload delivery to trigger the remediation steps.</strong>
            </p>
          </div>
        </div>

        {/* Memory Recall Accuracy Tip */}
        <div className="bg-primary/5 border-l-[4px] border-primary rounded-r-xl p-5 mb-8 text-left flex gap-4">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary h-fit shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div className="text-left flex-1">
            <h4 className="m-0 mb-1 text-sm font-bold text-ink-black uppercase tracking-wider">Maximizing Agent Accuracy</h4>
            <p className="m-0 text-xs text-on-surface-variant leading-relaxed font-medium">
              To drastically improve the agent's code fixing accuracy, make sure your webhook logs or payloads contain the **recall trace** (error signature, stack trace, and root frames). Including these details allows the Watcher Agent's Pinecone vector engine to perform precision memory recall matching, helping it identify the correct historical fix.
            </p>
          </div>
        </div>

        {/* Webhook Endpoint Box */}
        <h3 className="font-display text-base font-bold text-ink-black mb-2">Your Webhook URL Format</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
          Each project generates a secure, unique <code>webhook_secret</code> during creation. You can find this secret key directly on your project card in the Console Dashboard. The endpoint accepts POST requests in the following format:
        </p>
        <div className="bg-paper-surface border border-warm-gray/20 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="min-w-0 flex-1 text-left">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">PROJECT WEBHOOK ENDPOINT</span>
            <code className="text-xs break-all block text-on-surface-variant font-mono">{getSampleWebhookUrl()}</code>
          </div>
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 flex items-center gap-1.5 bg-primary text-on-primary border-none rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer transition-all hover:opacity-90 active:scale-95"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? 'Copied' : 'Copy Sample URL'}
          </button>
        </div>

        {/* Deployment Platform Examples */}
        <h3 className="font-display text-base font-bold text-ink-black mb-4 pb-2 border-b border-warm-gray/15">Integration Examples</h3>
        <div className="flex flex-col gap-6">

          {/* Example 1: PagerDuty */}
          <div className="text-left">
            <h4 className="font-sans text-sm font-bold text-ink-black mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span> PagerDuty / Incident Alert Managers
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
              Route alerts through PagerDuty to automatically trigger the auto-healer whenever an incident is triggered on a service:
            </p>
            <ol className="list-decimal pl-5 text-xs text-on-surface-variant space-y-1.5 leading-relaxed">
              <li>In PagerDuty, navigate to <strong>Services</strong> → <strong>Service Directory</strong> and select your service.</li>
              <li>Click the <strong>Integrations</strong> tab, and click <strong>Add an integration</strong>.</li>
              <li>Select <strong>Generic Webhooks v3</strong> and click Add.</li>
              <li>Paste your Watcher project webhook URL into the <strong>Webhook URL</strong> field.</li>
              <li>Under <strong>Event Subscription</strong>, select <code>incident.triggered</code> and <code>incident.reopened</code>.</li>
            </ol>
          </div>

          {/* Example 2: Render */}
          <div className="text-left mt-2">
            <h4 className="font-sans text-sm font-bold text-ink-black mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span> Render (PaaS Deployment Platform)
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
              Triggers the agent when build or deploy events succeed or fail on Render:
            </p>
            <ol className="list-decimal pl-5 text-xs text-on-surface-variant space-y-1.5 leading-relaxed">
              <li>Log in to your Render Dashboard and select your Web Service.</li>
              <li>Go to the <strong>Settings</strong> tab.</li>
              <li>Scroll down to the <strong>Deploy Webhook</strong> or Webhook notifications section.</li>
              <li>Paste your Watcher project webhook URL. Render will now send POST notifications containing build statuses.</li>
            </ol>
          </div>

          {/* Example 3: VPS / Custom Scripts */}
          <div className="text-left mt-2">
            <h4 className="font-sans text-sm font-bold text-ink-black mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span> VPS / Bash Crash Hook
            </h4>
            <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
              For applications running directly on a custom VPS, you can hook a script (such as inside Systemd or node process monitors like PM2) to curl a payload to the webhook whenever a process dies:
            </p>
            <div className="bg-paper-surface border border-warm-gray/10 rounded-lg p-4 font-mono text-[11px] text-on-surface-variant overflow-x-auto text-left max-w-full">
              <pre>{`curl -X POST ${getSampleWebhookUrl()} \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "alert",
    "service": "billing-service",
    "severity": "CRITICAL",
    "message": "uncaughtException: Connection timeout to payment gateway",
    "stack_trace": "Error: ETIMEDOUT\\n    at Socket.cb (connection.js:189:12)\\n    at processTicksAndRejections (task.js:95:5)"
  }'`}</pre>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
