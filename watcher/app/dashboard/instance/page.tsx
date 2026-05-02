'use client';

import { Button } from "@/components/ui/button";
import { Eye, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { saveInstanceConfig } from "@/actions/envActions";
import { useRouter } from "next/navigation";

export default function AddInstancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    instanceName: '',
    port: '',
    openrouterApiKey: '',
    defaultLlmModel: 'google/gemini-flash-1.5',
    pineconeApiKey: '',
    pineconeIndexName: 'guardian-knowledge',
    discordBotToken: '',
    discordChannelId: '',
    githubToken: '',
    githubRepoOwner: '',
    githubRepoName: '',
    prompt: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.instanceName) {
      alert('Please enter an instance name');
      return;
    }

    if (!formData.openrouterApiKey || !formData.pineconeApiKey || 
        !formData.discordBotToken || !formData.githubToken) {
      alert('Please fill in all required API keys');
      return;
    }

    setLoading(true);
    
    try {
      const result = await saveInstanceConfig(formData);
      
      if (result.success) {
        alert('✅ Configuration saved successfully!');
        router.push('/dashboard');
      }
    } catch (error) {
      alert('❌ Error saving configuration: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

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
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* General Info */}
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">General</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Instance Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Production Watcher" 
                    value={formData.instanceName}
                    onChange={(e) => handleChange('instanceName', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Port (Optional)</label>
                  <input 
                    type="number" 
                    placeholder="3000" 
                    value={formData.port}
                    onChange={(e) => handleChange('port', e.target.value)}
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
                  <label className="block text-sm font-medium mb-2">
                    OpenRouter API Key <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="your_openrouter_api_key" 
                    value={formData.openrouterApiKey}
                    onChange={(e) => handleChange('openrouterApiKey', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    autoComplete="off"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get your key at <a href="https://openrouter.ai/" target="_blank" className="text-primary hover:underline">openrouter.ai</a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Default LLM Model</label>
                  <input 
                    type="text" 
                    placeholder="google/gemini-flash-1.5" 
                    value={formData.defaultLlmModel}
                    onChange={(e) => handleChange('defaultLlmModel', e.target.value)}
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
                  <label className="block text-sm font-medium mb-2">
                    Pinecone API Key <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="your_pinecone_api_key" 
                    value={formData.pineconeApiKey}
                    onChange={(e) => handleChange('pineconeApiKey', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    autoComplete="off"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get your key at <a href="https://www.pinecone.io/" target="_blank" className="text-primary hover:underline">pinecone.io</a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pinecone Index Name</label>
                  <input 
                    type="text" 
                    placeholder="guardian-knowledge" 
                    value={formData.pineconeIndexName}
                    onChange={(e) => handleChange('pineconeIndexName', e.target.value)}
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
                  <label className="block text-sm font-medium mb-2">
                    Discord Bot Token <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="your_discord_bot_token" 
                    value={formData.discordBotToken}
                    onChange={(e) => handleChange('discordBotToken', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    autoComplete="off"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Discord Incident Channel ID <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="your_channel_id" 
                    value={formData.discordChannelId}
                    onChange={(e) => handleChange('discordChannelId', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* GitHub Config */}
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">GitHub (Fix Deployment)</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    GitHub Personal Access Token <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="your_personal_access_token" 
                    value={formData.githubToken}
                    onChange={(e) => handleChange('githubToken', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    autoComplete="off"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Generate at <a href="https://github.com/settings/tokens" target="_blank" className="text-primary hover:underline">GitHub Settings → Tokens</a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    GitHub Repo Owner <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="your_github_username" 
                    value={formData.githubRepoOwner}
                    onChange={(e) => handleChange('githubRepoOwner', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    GitHub Repo Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="your_repo_name" 
                    value={formData.githubRepoName}
                    onChange={(e) => handleChange('githubRepoName', e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Custom Prompt Config */}
            <div>
              <h2 className="text-lg font-semibold mb-4 border-b border-border pb-2">Watcher Custom Instructions</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    System Prompt <span className="text-muted-foreground text-xs font-normal ml-2">(Optional)</span>
                  </label>
                  <textarea 
                    placeholder="Enter custom instructions for how the AI should behave..." 
                    value={formData.prompt}
                    onChange={(e) => handleChange('prompt', e.target.value)}
                    className="w-full h-32 bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-y"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Provide specific context, coding guidelines, or rules you want the Watcher agent to follow when fixing bugs for this instance.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-sm text-blue-400">
                🔒 All API keys are encrypted before storage and never exposed in logs or client code.
              </p>
            </div>

            <div className="pt-6 flex justify-end gap-4 border-t border-border">
              <Link href="/dashboard">
                <Button variant="ghost" type="button">Cancel</Button>
              </Link>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}