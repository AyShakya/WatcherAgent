import { useState } from 'react';
import { Eye, ArrowRight, GitBranch, Menu, X } from 'lucide-react';

export default function LandingPage({ setView }) {
  const [landingMenuOpen, setLandingMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden animate-fade">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(100,83,119,0.04)_0%,transparent_70%)] pointer-events-none z-0"></div>
      
      <header className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 border-b border-warm-gray/20 sticky top-0 z-40 bg-background/85 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-primary" />
          <span className="font-display text-lg md:text-xl font-bold tracking-tight text-ink-black animate-pulse">Watcher Platform Core</span>
        </div>
        
        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#pipeline" className="text-on-surface-variant font-semibold text-xs uppercase tracking-wider hover:text-primary transition-colors">Pipeline</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant font-semibold text-xs uppercase tracking-wider hover:text-primary transition-colors">GitHub</a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button 
            className="text-on-surface-variant font-medium text-sm px-4 py-2 hover:text-primary transition-colors duration-200"
            onClick={() => setView('SIGN_IN')}
          >
            Sign In
          </button>
          <button 
            className="bg-primary text-on-primary font-medium text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity active:scale-[0.98] duration-150"
            onClick={() => setView('SIGN_UP')}
          >
            Get Started
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="md:hidden bg-transparent border-none text-ink-black cursor-pointer p-2 rounded-lg hover:bg-paper-surface transition-colors"
          onClick={() => setLandingMenuOpen(!landingMenuOpen)}
          title="Toggle Menu"
        >
          {landingMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Overlay Menu */}
      {landingMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[65px] bg-background/95 backdrop-blur-md border-b border-warm-gray/20 shadow-lg p-6 z-30 flex flex-col gap-4 animate-fade">
          <a 
            href="#pipeline" 
            className="text-on-surface-variant font-semibold text-sm py-2 hover:text-primary transition-colors border-b border-warm-gray/10 text-left"
            onClick={() => setLandingMenuOpen(false)}
          >
            Pipeline
          </a>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-on-surface-variant font-semibold text-sm py-2 hover:text-primary transition-colors border-b border-warm-gray/10 text-left"
            onClick={() => setLandingMenuOpen(false)}
          >
            GitHub
          </a>
          <div className="flex flex-col gap-3 mt-2">
            <button 
              className="w-full text-center text-on-surface-variant font-medium text-sm py-3 border border-warm-gray/30 rounded-lg hover:bg-paper-surface transition-colors"
              onClick={() => { setLandingMenuOpen(false); setView('SIGN_IN'); }}
            >
              Sign In
            </button>
            <button 
              className="w-full text-center bg-primary text-on-primary font-medium text-sm py-3 rounded-lg hover:opacity-90 transition-opacity"
              onClick={() => { setLandingMenuOpen(false); setView('SIGN_UP'); }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center text-center px-margin-mobile md:px-margin-desktop py-20 pb-28 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-low border border-warm-gray/20 rounded-full mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">v2.4 Production-Ready</span>
        </div>
        
        <h1 className="font-display text-4xl md:text-6xl text-ink-black max-w-4xl mx-auto leading-[1.12] mb-6">
          Autonomously Triage, Notify & <br />
          <span className="text-primary italic">Resolve Production Incidents</span>
        </h1>
        
        <p className="text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed">
          Connect alert endpoints, request hitl approval via Discord channels, and deploy tested code changes with GitHub Actions. WatcherAgent acts as the autonomous brain for SRE.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 w-full max-w-md mx-auto">
          <button 
            className="w-full sm:w-auto bg-primary text-on-primary px-8 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all duration-150"
            onClick={() => setView('SIGN_UP')}
          >
            Initialize Account <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            className="w-full sm:w-auto border border-warm-gray/30 text-on-surface px-8 py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-paper-surface/50 active:scale-[0.98] transition-all duration-150"
            onClick={() => window.open('https://github.com', '_blank')}
          >
            <GitBranch className="w-4 h-4" /> View Repository
          </button>
        </div>

        {/* Bento-style 5-Node Autonomous Remediation Pipeline */}
        <div id="pipeline" className="w-full max-w-[1120px] mt-10 border-t border-warm-gray/20 pt-16">
          <h3 className="font-display text-2xl md:text-3xl text-ink-black mb-12">The 5-Node Autonomous Remediation Pipeline</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
            {/* Node 1 */}
            <div className="md:col-span-4 bg-surface-container-low border border-warm-gray/20 rounded-xl p-8 hover:border-primary/40 transition-colors duration-300 group">
              <span className="font-mono text-xs text-secondary font-bold uppercase mb-3 block">Node 01</span>
              <h4 className="font-display text-lg text-ink-black mb-2">Intelligent Triage</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                LLM categorizes alerts from Sentry, Datadog or Prometheus. Filters noise and structures raw exception logs.
              </p>
            </div>
            
            {/* Node 2 */}
            <div className="md:col-span-8 bg-paper-surface border border-warm-gray/20 rounded-xl p-8 hover:border-primary/40 transition-colors duration-300 group flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-secondary font-bold uppercase mb-3 block">Node 02</span>
                <h4 className="font-display text-lg text-ink-black mb-2">Runbook RAG Recall</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-xl">
                  Retrieves historical resolution context using Pinecone database vector indexes, matching past solutions to new crash signatures.
                </p>
              </div>
              <div className="h-1 bg-warm-gray/10 w-full mt-6 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3"></div>
              </div>
            </div>
            
            {/* Node 3 */}
            <div className="md:col-span-6 lg:col-span-5 bg-surface-container-low border border-warm-gray/20 rounded-xl p-8 hover:border-primary/40 transition-colors duration-300 group text-left">
              <span className="font-mono text-xs text-secondary font-bold uppercase mb-3 block">Node 03</span>
              <h4 className="font-display text-lg text-ink-black mb-2">HITL Discord Cards</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                Safety-first Human-in-the-Loop checkpoints. Pings Discord with one-click quick actions to authorize or audit code fix drafts.
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 rounded text-xs bg-secondary text-on-secondary font-medium">Approve Fix</span>
                <span className="px-3 py-1 rounded text-xs border border-warm-gray/30 text-on-surface-variant font-medium">Edit Context</span>
              </div>
            </div>
            
            {/* Node 4 */}
            <div className="md:col-span-6 lg:col-span-4 bg-surface-container-high border border-warm-gray/20 rounded-xl p-8 hover:border-primary/40 transition-colors duration-300 group">
              <span className="font-mono text-xs text-secondary font-bold uppercase mb-3 block">Node 04</span>
              <h4 className="font-display text-lg text-ink-black mb-2">Fixer Sandbox</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Spawns isolated workspace checkouts, refactors imports, applies patches, validates test suites, and drafts a GitHub Pull Request.
              </p>
            </div>
            
            {/* Node 5 */}
            <div className="md:col-span-12 lg:col-span-3 bg-surface-container-highest border border-warm-gray/20 rounded-xl p-8 hover:border-primary/40 transition-colors duration-300 group">
              <span className="font-mono text-xs text-secondary font-bold uppercase mb-3 block">Node 05</span>
              <h4 className="font-display text-lg text-ink-black mb-2">Memory Loop</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Generates markdown postmortems and writes back solutions into Pinecone vectors, training the agent core.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
