import { Button } from "@/components/ui/button";
import { Eye, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddInstancePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold group-hover:text-primary transition-colors">Watcher</span>
            </Link>
            <span className="ml-8 text-sm text-muted-foreground">Add Instance</span>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">Configure Instance</h1>
          <p className="text-muted-foreground">Set up the environment configuration for your new Watcher instance.</p>
        </div>

        <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm mb-12">
          <form className="space-y-8">
            {/* General Info */}
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">General</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Instance Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Production Watcher" 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Port (Optional)</label>
                  <input 
                    type="number" 
                    placeholder="3000" 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* OpenRouter Config */}
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">OpenRouter (LLM Orchestration)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">OpenRouter API Key</label>
                  <input 
                    type="password" 
                    placeholder="your_openrouter_api_key" 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Default LLM Model</label>
                  <input 
                    type="text" 
                    placeholder="google/gemini-flash-1.5" 
                    defaultValue="google/gemini-flash-1.5"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Recommended: 'google/gemini-flash-1.5' or 'meta-llama/llama-3-8b'</p>
                </div>
              </div>
            </div>

            {/* Pinecone Config */}
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Pinecone (Vector RAG)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Pinecone API Key</label>
                  <input 
                    type="password" 
                    placeholder="your_pinecone_api_key" 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pinecone Index Name</label>
                  <input 
                    type="text" 
                    placeholder="guardian-knowledge" 
                    defaultValue="guardian-knowledge"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Discord Config */}
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Discord (HITL Interface)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Discord Bot Token</label>
                  <input 
                    type="password" 
                    placeholder="your_discord_bot_token" 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Discord Incident Channel ID</label>
                  <input 
                    type="text" 
                    placeholder="your_channel_id" 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* GitHub Config */}
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">GitHub (Fix Deployment)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">GitHub Personal Access Token</label>
                  <input 
                    type="password" 
                    placeholder="your_personal_access_token" 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">GitHub Repo Owner</label>
                  <input 
                    type="text" 
                    placeholder="your_github_username" 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">GitHub Repo Name</label>
                  <input 
                    type="text" 
                    placeholder="your_repo_name" 
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-border">
              <Link href="/dashboard">
                <Button variant="ghost" type="button">Cancel</Button>
              </Link>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Save Configuration
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
