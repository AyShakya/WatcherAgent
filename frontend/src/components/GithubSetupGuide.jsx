import { useState } from 'react';
import { Settings, Eye, GitBranch, ExternalLink, Check, Copy, CheckCircle2 } from 'lucide-react';

export default function GithubSetupGuide() {
  const [copiedLink, setCopiedLink] = useState(false);
  const patGuideUrl = "https://github.com/settings/tokens";

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 text-left animate-fade min-h-0">
      <div className="max-w-[900px] mx-auto bg-surface-container-low border border-warm-gray/20 rounded-2xl p-6 md:p-8 shadow-sm">
        
        {/* Banner header */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10 text-left">
            <h2 className="font-display text-2xl font-bold text-ink-black mb-2 flex items-center gap-2">
              <span className="p-1.5 bg-primary/20 rounded-lg text-primary">
                <GitBranch className="w-5 h-5" />
              </span>
              GitHub Repository Integration Setup
            </h2>
            <p className="text-sm text-on-surface-variant max-w-[650px] leading-relaxed">
              To allow the Watcher Agent to locate files, inspect stack traces, compile code fixes, and submit auto-healing Pull Requests, you must link your GitHub repository. Follow this guide to configure access.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 pointer-events-none flex items-center justify-center">
            <GitBranch className="w-48 h-48" />
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-6">
          
          {/* Step 1 */}
          <div className="flex gap-4 md:gap-6 border-b border-warm-gray/10 pb-6 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-bold text-ink-black mb-2">Create a GitHub Personal Access Token (PAT)</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                Go to the <a href={patGuideUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold inline-flex items-center gap-1">GitHub Developer Token Settings <ExternalLink className="w-3.5 h-3.5" /></a> and log in with your GitHub account.
              </p>
              <ul className="list-disc pl-5 text-sm text-on-surface-variant space-y-1.5 leading-relaxed">
                <li>Click on the <strong>Generate new token</strong> dropdown and select <strong>Generate new token (classic)</strong>.</li>
                <li>Give your token a descriptive note (e.g. <code>Watcher Agent Auto-Healer</code>).</li>
                <li>Set an expiration date (we recommend 90 days or custom as per your security policy).</li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 md:gap-6 border-b border-warm-gray/10 pb-6 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-bold text-ink-black mb-2">Configure Scopes & Permissions</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                Select the scopes required to grant the agent correct read and write access to your code:
              </p>
              <ul className="list-disc pl-5 text-sm text-on-surface-variant space-y-2 leading-relaxed">
                <li>
                  Check the <strong>repo</strong> checkbox. This provides complete access to private and public repositories, which is required to check out branches, read code, commit bug fixes, and submit PRs.
                  <div className="flex flex-col gap-1.5 mt-2 bg-paper-surface border border-warm-gray/10 rounded-lg p-3 max-w-[400px]">
                    <span className="text-xs font-semibold text-ink-black flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" /> repo (all scopes)
                    </span>
                  </div>
                </li>
                <li>(Optional) Check the <strong>workflow</strong> scope if you want the agent to trigger, run, or cancel GitHub Action workflows on bugfix branches.</li>
                <li>Scroll to the bottom and click <strong>Generate token</strong>.</li>
                <li><strong>Copy the token immediately</strong> and save it securely. You will not be able to see it again on GitHub.</li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 md:gap-6 border-b border-warm-gray/10 pb-6 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-bold text-ink-black mb-2">Identify Repository Details</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                Determine your repository Owner and Repo Name from your repository's URL:
              </p>
              <div className="bg-paper-surface border border-warm-gray/20 rounded-xl p-4 text-xs font-mono max-w-[600px] text-left">
                <span className="text-warm-gray block mb-1">Example Repository URL:</span>
                <span className="text-ink-black font-semibold text-sm">https://github.com/<span className="text-primary font-bold">organization-name</span>/<span className="text-secondary font-bold">service-repository</span></span>
                <div className="grid grid-cols-2 gap-4 mt-3 pt-2 border-t border-warm-gray/15">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-warm-gray block">GitHub Owner</span>
                    <span className="text-primary font-bold text-sm">organization-name</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-warm-gray block">GitHub Repo Name</span>
                    <span className="text-secondary font-bold text-sm">service-repository</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4 md:gap-6 text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-bold text-ink-black mb-2">Save Settings in Console</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Go back to the <strong>Console Dashboard</strong> tab on the left sidebar:
              </p>
              <ul className="list-disc pl-5 text-sm text-on-surface-variant space-y-1.5 leading-relaxed mt-2">
                <li>Create a new project or edit your existing project.</li>
                <li>Input your <strong>GitHub Owner</strong>, <strong>GitHub Repo Name</strong>, and paste your copied <strong>GitHub PAT Token</strong> in the respective fields.</li>
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
            <h4 className="m-0 mb-1 text-sm font-bold text-ink-black">Secure Encryption Standards</h4>
            <p className="m-0 text-xs text-on-surface-variant leading-relaxed">
              All repository tokens and access details are fully encrypted on the server before being saved to the database using authenticated symmetric encryption (AES-256-GCM). They are decrypted on-the-fly only when worker nodes process incoming alert incidents.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
