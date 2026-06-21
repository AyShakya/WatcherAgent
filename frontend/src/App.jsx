import { useState, useEffect } from 'react';
import { 
  Eye, 
  ArrowRight, 
  Plus, 
  Copy, 
  Check, 
  Play, 
  Settings, 
  LogOut, 
  GitBranch, 
  ShieldAlert, 
  Cpu, 
  History, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Trash2,
  Lock,
  User,
  Mail,
  Activity,
  Edit,
  Menu,
  X
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

function App() {
    const [view, setView] = useState('LANDING'); // LANDING, SIGN_IN, SIGN_UP, DASHBOARD
  const [dashboardTab, setDashboardTab] = useState('CONSOLE'); // CONSOLE, SETUP
  const [token, setToken] = useState(localStorage.getItem('watcher_token') || '');
  const [user, setUser] = useState(null);
  
  // Projects & Incidents State
  const [projects, setProjects] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  
  // Forms State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  // Project Form & Observability State
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // Project currently being edited
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Mobile sidebar overlay drawer toggle
  const [landingMenuOpen, setLandingMenuOpen] = useState(false); // Mobile landing topbar toggle
  
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projGithubOwner, setProjGithubOwner] = useState('');
  const [projGithubRepo, setProjGithubRepo] = useState('');
  const [projGithubToken, setProjGithubToken] = useState('');
  const [projDiscordChannel, setProjDiscordChannel] = useState('');
  const [projDiscordBotToken, setProjDiscordBotToken] = useState('');
  const [projOpenRouterKey, setProjOpenRouterKey] = useState('');
  const [projPineconeNamespace, setProjPineconeNamespace] = useState('');
  const [projFormError, setProjFormError] = useState('');
  const [projFormLoading, setProjFormLoading] = useState(false);

  // Selected Incident Detail Modal
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [copiedStates, setCopiedStates] = useState({}); // project.id -> boolean (for webhook secret copy feedback)
  const [guideOpen, setGuideOpen] = useState(true);
  
  // Discord bot integration setup states
  const [globalBotInfo, setGlobalBotInfo] = useState(null);
  const [loadingBotInfo, setLoadingBotInfo] = useState(false);

  // Modal Open Handlers
  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setProjName('');
    setProjDesc('');
    setProjGithubOwner('');
    setProjGithubRepo('');
    setProjGithubToken('');
    setProjDiscordChannel('');
    setProjDiscordBotToken('');
    setProjOpenRouterKey('');
    setProjPineconeNamespace('');
    setProjFormError('');
    setShowProjectModal(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setProjName(project.name || '');
    setProjDesc(project.description || '');
    setProjGithubOwner(project.github_owner || '');
    setProjGithubRepo(project.github_repo || '');
    setProjGithubToken(project.github_token || '');
    setProjDiscordChannel(project.discord_channel_id || '');
    setProjDiscordBotToken(project.discord_bot_token || '');
    setProjOpenRouterKey(project.openrouter_key || '');
    setProjPineconeNamespace(project.pinecone_namespace || '');
    setProjFormError('');
    setShowProjectModal(true);
  };

  // Auth profile loading
  useEffect(() => {
    if (token) {
      localStorage.setItem('watcher_token', token);
      fetchProfile();
      fetchDashboardData();
    } else {
      localStorage.removeItem('watcher_token');
      setUser(null);
      setProjects([]);
      setIncidents([]);
    }
  }, [token]);

  // Poll for incidents updates smoothly when logged in
  useEffect(() => {
    let interval;
    if (token && view === 'DASHBOARD') {
      interval = setInterval(() => {
        fetchIncidents(true); // Pass isPoll=true to fetch silently in the background
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [token, view]);

  // Fetch global bot details on dashboard/setup navigation
  const fetchBotInfo = async () => {
    if (!token) return;
    setLoadingBotInfo(true);
    try {
      const res = await fetch(`${API_BASE}/discord/bot-info`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalBotInfo(data);
      }
    } catch (err) {
      console.error('Failed to fetch Discord bot details:', err);
    } finally {
      setLoadingBotInfo(false);
    }
  };

  useEffect(() => {
    if (view === 'DASHBOARD' && dashboardTab === 'SETUP') {
      fetchBotInfo();
    }
  }, [view, dashboardTab, token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setView('DASHBOARD');
      } else {
        setToken('');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchDashboardData = () => {
    fetchProjects();
    fetchIncidents(false);
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchIncidents = async (isPoll = false) => {
    if (!isPoll) setLoadingIncidents(true);
    try {
      const res = await fetch(`${API_BASE}/incidents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const newIncidents = data.incidents || [];
        
        // Deep-compare using stringified versions to check for actual differences
        setIncidents(prev => {
          if (JSON.stringify(prev) === JSON.stringify(newIncidents)) {
            return prev; // Prevents re-rendering table rows if data is identical
          }
          
          // Also update selected incident if it's currently open and has new logs/status
          if (selectedIncident) {
            const updatedSelected = newIncidents.find(i => i.id === selectedIncident.id);
            if (updatedSelected && JSON.stringify(updatedSelected) !== JSON.stringify(selectedIncident)) {
              setSelectedIncident(updatedSelected);
            }
          }
          
          return newIncidents;
        });
      }
    } catch (err) {
      console.error('Error loading incidents:', err);
    } finally {
      if (!isPoll) setLoadingIncidents(false);
    }
  };

  const handleAuthSubmit = async (e, type) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    const url = type === 'SIGN_UP' ? `${API_BASE}/auth/signup` : `${API_BASE}/auth/login`;
    const payload = type === 'SIGN_UP' 
      ? { email: authEmail, password: authPassword, name: authName }
      : { email: authEmail, password: authPassword };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
      } else {
        setAuthError(data.error || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      setAuthError('Unable to connect to the backend server.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setProjFormLoading(true);
    setProjFormError('');

    const payload = {
      name: projName,
      description: projDesc,
      github_owner: projGithubOwner,
      github_repo: projGithubRepo,
      github_token: projGithubToken,
      discord_channel_id: projDiscordChannel,
      discord_bot_token: projDiscordBotToken,
      openrouter_key: projOpenRouterKey,
      pinecone_namespace: projPineconeNamespace
    };

    try {
      const url = editingProject 
        ? `${API_BASE}/projects/${editingProject.id}` 
        : `${API_BASE}/projects`;
      const method = editingProject ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        if (editingProject) {
          // Update existing project in state
          setProjects(prev => prev.map(p => p.id === editingProject.id ? data.project : p));
        } else {
          // Add new project to state
          setProjects(prev => [data.project, ...prev]);
        }
        
        setShowProjectModal(false);
        setEditingProject(null);
        // Reset form fields
        setProjName('');
        setProjDesc('');
        setProjGithubOwner('');
        setProjGithubRepo('');
        setProjGithubToken('');
        setProjDiscordChannel('');
        setProjDiscordBotToken('');
        setProjOpenRouterKey('');
        setProjPineconeNamespace('');
      } else {
        setProjFormError(data.error || `Failed to ${editingProject ? 'update' : 'create'} project.`);
      }
    } catch (err) {
      setProjFormError('Failed to communicate with the backend.');
    } finally {
      setProjFormLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This will delete all its incidents as well.')) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        setIncidents(prev => prev.filter(i => i.project_id !== id));
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleCopyWebhook = (secret, projectId) => {
    const url = `${API_BASE}/webhook/${secret}`;
    navigator.clipboard.writeText(url);
    setCopiedStates(prev => ({ ...prev, [projectId]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [projectId]: false }));
    }, 2000);
  };

  const handleTriggerTestIncident = async (secret, serviceName) => {
    const url = `${API_BASE}/webhook/${secret}`;
    
    // Custom test payload that mirrors Sentry event payload
    const testPayload = {
      incident_id: `inc_${Math.floor(Math.random() * 900000) + 100000}`,
      service: serviceName || 'test-service',
      alert: {
        latencyMs: 342,
        errorRate: 0.08,
        durationMin: 5,
        transactionsAffected: 120,
        errorTypes: ['MongoNetworkError', 'MongooseError']
      },
      message: 'MongoNetworkError: connection timed out to replica set primary at primary.mongo.cluster:27017',
      severity: 'P1',
      category: 'DATABASE',
      error_signature: 'MongoNetworkError: connection timed out to replica set primary',
      runbook_hint: 'Verify Mongo container instance is running and check security groups.'
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      if (res.ok) {
        alert('🚀 Test Alert webhook fired successfully! Ingestion job queued on BullMQ.');
        fetchIncidents(false); // Force load
      } else {
        alert('❌ Failed to trigger test webhook. Ensure backend is running.');
      }
    } catch (err) {
      alert('❌ Fetch connection error to Express backend.');
    }
  };

  const handleLogout = () => {
    setToken('');
    setView('LANDING');
  };

  // Rendering Helper Methods
  const getSeverityBadgeClass = (sev) => {
    switch (sev) {
      case 'P1': return 'bg-danger/10 text-danger border border-danger/20 font-semibold';
      case 'P2': return 'bg-warning/10 text-warning border border-warning/20 font-semibold';
      default: return 'bg-success/10 text-success border border-success/20 font-semibold';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'TRIGGERED': return 'bg-primary/10 text-primary border border-primary/20 font-semibold';
      case 'AWAITING_APPROVAL': return 'bg-warning/10 text-warning border border-warning/20 font-semibold';
      case 'FIXING': return 'bg-secondary/10 text-secondary border border-secondary/20 font-semibold';
      case 'CLOSED_AND_LEARNED': return 'bg-success/10 text-success border border-success/20 font-semibold';
      case 'MUTED': return 'bg-warm-gray/10 text-warm-gray border border-warm-gray/20 font-semibold';
      default: return 'bg-danger/10 text-danger border border-danger/20 font-semibold';
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-on-surface font-sans selection:bg-primary/20 relative">
      <div className="fixed inset-0 paper-texture pointer-events-none z-50"></div>
      
      {/* 1. LANDING PAGE VIEW */}
      {view === 'LANDING' && (
        <div className="min-h-screen flex flex-col relative overflow-hidden animate-fade">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(100,83,119,0.04)_0%,transparent_70%)] pointer-events-none z-0"></div>
          
          <header className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 border-b border-warm-gray/20 sticky top-0 z-40 bg-background/85 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Eye className="w-6 h-6 text-primary" />
              <span className="font-display text-lg md:text-xl font-bold tracking-tight text-ink-black">Watcher Platform Core</span>
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
              Connect alert endpoints, request hitl approval via Discord/Slack channels, and deploy tested code changes with GitHub Actions. WatcherAgent acts as the autonomous brain for SRE.
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
      )}

      {/* 2. SIGN IN VIEW */}
      {view === 'SIGN_IN' && (
        <div className="min-h-screen flex items-center justify-center p-margin-mobile md:p-12 relative animate-fade">
          <div className="w-full max-w-[440px] bg-surface-container-lowest border border-warm-gray/20 rounded-xl p-8 md:p-10 z-10 shadow-[0_15px_30px_rgba(36,34,32,0.04)]">
            <div className="text-center mb-8">
              <Eye className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h2 className="font-display text-2xl md:text-3xl text-ink-black mb-2">Welcome Back</h2>
              <p className="text-sm text-on-surface-variant">Access your Watcher incident control tower.</p>
            </div>
            
            {authError && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-[13px] p-3 rounded-md mb-6 text-center font-medium">
                {authError}
              </div>
            )}
            
            <form onSubmit={(e) => handleAuthSubmit(e, 'SIGN_IN')} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-warm-gray" /> Email Address
                </label>
                <input 
                  type="email" 
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)} 
                  placeholder="name@company.com" 
                  required 
                  className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                />
              </div>
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-warm-gray" /> Password
                </label>
                <input 
                  type="password" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                />
              </div>
              <button 
                type="submit" 
                className="bg-primary text-on-primary border-none rounded-lg py-3.5 text-[14px] font-semibold cursor-pointer mt-2.5 transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed w-full" 
                disabled={authLoading}
              >
                {authLoading ? 'Signing In...' : 'Access Dashboard'}
              </button>
            </form>
            <div className="mt-6 text-center text-sm text-on-surface-variant">
              Don't have an account? <span className="text-primary font-semibold cursor-pointer hover:underline" onClick={() => { setView('SIGN_UP'); setAuthError(''); }}>Sign Up</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SIGN UP VIEW */}
      {view === 'SIGN_UP' && (
        <div className="min-h-screen flex items-center justify-center p-margin-mobile md:p-12 relative animate-fade">
          <div className="w-full max-w-[440px] bg-surface-container-lowest border border-warm-gray/20 rounded-xl p-8 md:p-10 z-10 shadow-[0_15px_30px_rgba(36,34,32,0.04)]">
            <div className="text-center mb-8">
              <Eye className="w-10 h-10 text-primary mb-4 mx-auto" />
              <h2 className="font-display text-2xl md:text-3xl text-ink-black mb-2">Create Account</h2>
              <p className="text-sm text-on-surface-variant">Configure details to initialize local observability.</p>
            </div>

            {authError && (
              <div className="bg-danger/10 border border-danger/20 text-danger text-[13px] p-3 rounded-md mb-6 text-center font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={(e) => handleAuthSubmit(e, 'SIGN_UP')} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-warm-gray" /> Full Name
                </label>
                <input 
                  type="text" 
                  value={authName} 
                  onChange={(e) => setAuthName(e.target.value)} 
                  placeholder="Ayush Shakya" 
                  required 
                  className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                />
              </div>
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-warm-gray" /> Email Address
                </label>
                <input 
                  type="email" 
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)} 
                  placeholder="name@company.com" 
                  required 
                  className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                />
              </div>
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-warm-gray" /> Password
                </label>
                <input 
                  type="password" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                  placeholder="At least 6 characters" 
                  required 
                  className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                />
              </div>
              <button 
                type="submit" 
                className="bg-primary text-on-primary border-none rounded-lg py-3.5 text-[14px] font-semibold cursor-pointer mt-2.5 transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed w-full" 
                disabled={authLoading}
              >
                {authLoading ? 'Creating Account...' : 'Initialize Onboarding'}
              </button>
            </form>
            <div className="mt-6 text-center text-sm text-on-surface-variant">
              Already have an account? <span className="text-primary font-semibold cursor-pointer hover:underline" onClick={() => { setView('SIGN_IN'); setAuthError(''); }}>Log In</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. DASHBOARD VIEW */}
      {view === 'DASHBOARD' && (
        <div className="flex h-screen w-full overflow-hidden animate-fade relative z-10">
          
          {/* Mobile Sidebar Overlay Drawer */}
          {mobileSidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex animate-fade">
              <div 
                className="fixed inset-0 bg-ink-black/40 backdrop-blur-xs transition-opacity duration-300"
                onClick={() => setMobileSidebarOpen(false)}
              ></div>
              <aside className="relative w-[280px] max-w-[80%] h-full bg-surface-container border-r border-warm-gray/20 flex flex-col justify-between p-6 animate-slide-in-left shadow-2xl">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Eye className="w-6 h-6 text-primary" />
                      <div>
                        <span className="font-display text-lg font-bold block text-ink-black leading-tight">Watcher Console</span>
                        <span className="text-[10px] text-warm-gray font-semibold tracking-wider uppercase block">Incident Management</span>
                      </div>
                    </div>
                    <button 
                      className="bg-transparent border-none text-warm-gray hover:text-ink-black p-1 rounded-lg transition-colors cursor-pointer"
                      onClick={() => setMobileSidebarOpen(false)}
                      title="Close Sidebar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-warm-gray/20 mb-6">
                    <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm select-none">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-[13px] font-semibold text-ink-black whitespace-nowrap overflow-hidden text-ellipsis">{user?.name || 'User Profile'}</span>
                      <span className="text-[11px] text-on-surface-variant whitespace-nowrap overflow-hidden text-ellipsis">{user?.email}</span>
                    </div>
                  </div>

                  <nav className="flex flex-col gap-1.5">
                    <div className="text-[10px] font-bold tracking-wider text-warm-gray mt-4 mb-2 ml-3 text-left">MANAGEMENT</div>
                    <div 
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold cursor-pointer active:scale-95 duration-150 transition-all text-left ${dashboardTab === 'CONSOLE' ? 'bg-paper-surface border border-warm-gray/20 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-paper-surface/50'}`}
                      onClick={() => { setDashboardTab('CONSOLE'); setMobileSidebarOpen(false); }}
                    >
                      <Activity className={`w-4 h-4 ${dashboardTab === 'CONSOLE' ? 'animate-pulse' : ''}`} /> Console Dashboard
                    </div>
                    <div 
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold cursor-pointer active:scale-95 duration-150 transition-all text-left ${dashboardTab === 'SETUP' ? 'bg-paper-surface border border-warm-gray/20 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-paper-surface/50'}`}
                      onClick={() => { setDashboardTab('SETUP'); setMobileSidebarOpen(false); }}
                    >
                      <Settings className="w-4 h-4" /> Discord Bot Setup
                    </div>
                    <div 
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold text-on-surface-variant hover:text-on-surface hover:bg-paper-surface/50 cursor-pointer active:scale-95 duration-150 transition-all text-left"
                      onClick={() => { setMobileSidebarOpen(false); handleOpenCreateModal(); }}
                    >
                      <Plus className="w-4 h-4" /> Create Project
                    </div>
                  </nav>
                </div>

                <div className="mt-auto">
                  <button 
                    className="w-full flex items-center justify-center gap-2 bg-transparent text-on-surface-variant border border-warm-gray/30 rounded-lg py-3 text-[13px] font-semibold cursor-pointer transition-all duration-150 hover:bg-danger/10 hover:text-danger hover:border-danger/30"
                    onClick={() => { setMobileSidebarOpen(false); handleLogout(); }}
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </button>
                </div>
              </aside>
            </div>
          )}

          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex w-[260px] shrink-0 bg-surface-container border-r border-warm-gray/20 flex-col justify-between p-6">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Eye className="w-6 h-6 text-primary" />
                <div>
                  <span className="font-display text-lg font-bold block text-ink-black leading-tight">Watcher Console</span>
                  <span className="text-[10px] text-warm-gray font-semibold tracking-wider uppercase block">Incident Management</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-warm-gray/20 mb-6">
                <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm select-none">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[13px] font-semibold text-ink-black whitespace-nowrap overflow-hidden text-ellipsis">{user?.name || 'User Profile'}</span>
                  <span className="text-[11px] text-on-surface-variant whitespace-nowrap overflow-hidden text-ellipsis">{user?.email}</span>
                </div>
              </div>

              <nav className="flex flex-col gap-1.5 flex-1">
                <div className="text-[10px] font-bold tracking-wider text-warm-gray mt-4 mb-2 ml-3 text-left">MANAGEMENT</div>
                <div 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold cursor-pointer active:scale-95 duration-150 transition-all text-left ${dashboardTab === 'CONSOLE' ? 'bg-paper-surface border border-warm-gray/20 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-paper-surface/50'}`}
                  onClick={() => setDashboardTab('CONSOLE')}
                >
                  <Activity className={`w-4 h-4 ${dashboardTab === 'CONSOLE' ? 'animate-pulse' : ''}`} /> Console Dashboard
                </div>
                <div 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold cursor-pointer active:scale-95 duration-150 transition-all text-left ${dashboardTab === 'SETUP' ? 'bg-paper-surface border border-warm-gray/20 text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-paper-surface/50'}`}
                  onClick={() => setDashboardTab('SETUP')}
                >
                  <Settings className="w-4 h-4" /> Discord Bot Setup
                </div>
                <div 
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold text-on-surface-variant hover:text-on-surface hover:bg-paper-surface/50 cursor-pointer active:scale-95 duration-150 transition-all text-left"
                  onClick={handleOpenCreateModal}
                >
                  <Plus className="w-4 h-4" /> Create Project
                </div>
              </nav>
            </div>

            <div className="mt-auto">
              <button 
                className="w-full flex items-center justify-center gap-2 bg-transparent text-on-surface-variant border border-warm-gray/30 rounded-lg py-3 text-[13px] font-semibold cursor-pointer transition-all duration-150 hover:bg-danger/10 hover:text-danger hover:border-danger/30"
                onClick={handleLogout}
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col overflow-y-auto lg:overflow-hidden relative">
            <header className="h-20 shrink-0 border-b border-warm-gray/20 bg-background/80 backdrop-blur-md flex justify-between items-center px-4 md:px-8 sticky top-0 z-30">
              <div className="flex items-center min-w-0">
                <button 
                  className="lg:hidden p-2 text-ink-black bg-transparent border-none cursor-pointer mr-2 rounded-lg hover:bg-paper-surface transition-colors"
                  onClick={() => setMobileSidebarOpen(true)}
                  title="Open Sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="text-left min-w-0">
                  <h1 className="font-display text-lg md:text-2xl font-bold m-0 mb-1 tracking-tight text-ink-black truncate">
                    {dashboardTab === 'CONSOLE' ? 'Platform Console' : 'Discord Bot Setup'}
                  </h1>
                  <p className="text-[11px] md:text-xs text-on-surface-variant m-0 truncate hidden md:block">
                    {dashboardTab === 'CONSOLE' 
                      ? 'Monitor multi-project alerts, manage BullMQ queues, and oversee resolutions.' 
                      : 'Step-by-step documentation on how to configure and invite your Discord bot.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {dashboardTab === 'CONSOLE' && (
                  <>
                    <button 
                      className="bg-transparent border border-warm-gray/30 text-on-surface rounded-lg p-2.5 md:px-4 md:py-2.5 text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-all duration-150 hover:bg-paper-surface/50"
                      onClick={fetchDashboardData}
                      title="Refresh Console"
                    >
                      <RefreshCw className="w-4 h-4 text-primary" />
                      <span className="hidden sm:inline">Refresh Console</span>
                    </button>
                    <button 
                      className="bg-primary text-on-primary border-none rounded-lg p-2.5 md:px-4 md:py-2.5 text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
                      onClick={handleOpenCreateModal}
                      title="Add Project"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Project</span>
                    </button>
                  </>
                )}
              </div>
            </header>

            {dashboardTab === 'CONSOLE' ? (
              <>
                {/* Developer Guidance Banner */}
                <div className="mx-4 md:mx-8 mt-6 bg-primary-container border border-primary/20 rounded-xl p-8 text-left text-on-primary-container relative overflow-hidden shadow-sm">
              <div className="flex justify-between items-center select-none">
                <div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-ink-black mb-1">Watcher Platform Core</h3>
                  <p className="text-xs text-on-primary-fixed-variant opacity-85 font-semibold">Interactive Quick Start & Pipeline Architecture Guide</p>
                </div>
                <button 
                  onClick={() => setGuideOpen(!guideOpen)}
                  className="px-4 py-1.5 border border-primary/30 text-ink-black font-semibold text-xs rounded-full hover:bg-white/10 transition-colors"
                >
                  {guideOpen ? 'Collapse' : 'Expand'}
                </button>
              </div>
              
              {guideOpen && (
                <div className="mt-6 text-sm leading-relaxed border-t border-dashed border-primary/20 pt-6 animate-fade">
                  <p className="mb-4 text-on-primary-fixed-variant leading-relaxed">
                    WatcherAgent monitors a multi-project, Human-in-the-Loop AI Incident Remediation Pipeline backed by BullMQ. Follow this workflow to test the active agent pipeline:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { title: '1. Copy Webhook URL', desc: 'Onboard a project and copy the unique webhook URL. Alerts are routed here.' },
                      { title: '2. Click "Fire Test Alert"', desc: 'Simulates a database crash alert, queueing an ingestion task on BullMQ.' },
                      { title: '3. Approve on Discord', desc: 'The worker logs the incident and pings Discord. Click "Accept & Fix" on Discord.' },
                      { title: '4. Automated Fix', desc: 'The agent sandbox writes code, opens a GitHub PR, and updates Pinecone vectors.' }
                    ].map(step => (
                      <div key={step.title} className="bg-white/60 backdrop-blur-sm border border-primary/10 rounded-lg p-4 shadow-sm">
                        <h4 className="m-0 mb-1 text-[13px] font-bold text-ink-black">{step.title}</h4>
                        <p className="m-0 text-xs text-on-surface-variant leading-relaxed">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-8 mt-6 shrink-0 bg-transparent">
              <div className="bg-surface-container-low border border-warm-gray/20 rounded-xl p-6 text-left hover:border-primary/30 transition-all duration-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Active Projects</span>
                  <span className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Cpu className="w-4 h-4" />
                  </span>
                </div>
                <div className="font-display text-4xl font-semibold text-ink-black mb-1">{projects.length}</div>
                <div className="text-xs text-warm-gray">Configured environments</div>
              </div>
              
              <div className="bg-surface-container-low border border-warm-gray/20 rounded-xl p-6 text-left hover:border-primary/30 transition-all duration-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Total Alert Volume</span>
                  <span className="p-2 bg-secondary/10 rounded-lg text-secondary">
                    <Activity className="w-4 h-4" />
                  </span>
                </div>
                <div className="font-display text-4xl font-semibold text-ink-black mb-1">{incidents.length}</div>
                <div className="text-xs text-warm-gray">Remediated via pipeline</div>
              </div>

              <div className="bg-surface-container-low border border-warm-gray/20 rounded-xl p-6 text-left hover:border-primary/30 transition-all duration-200">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Awaiting Approval</span>
                  <span className="p-2 bg-tertiary/10 rounded-lg text-tertiary">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                </div>
                <div className="font-display text-4xl font-semibold text-ink-black mb-1">
                  {incidents.filter(i => i.status === 'AWAITING_APPROVAL').length}
                </div>
                <div className="text-xs text-warm-gray">HITL Slack / Discord cards</div>
              </div>
            </section>

            {/* Content Layout Split */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 md:px-8 pb-8 mt-6 min-h-0 lg:h-full lg:overflow-hidden">
              
              {/* Left Column: Projects List */}
              <div className="lg:col-span-7 bg-surface-container-low border border-warm-gray/20 rounded-xl flex flex-col overflow-hidden lg:h-full">
                <div className="px-6 py-[18px] border-b border-warm-gray/10 text-left bg-surface-container-low flex justify-between items-center">
                  <h2 className="font-display text-base font-semibold m-0 text-ink-black">Configured Webhooks & Repositories</h2>
                </div>
                
                {loadingProjects && projects.length === 0 ? (
                  <div className="p-6 flex flex-col gap-4">
                    <div className="h-[140px] animate-skeleton rounded-lg" />
                    <div className="h-[140px] animate-skeleton rounded-lg" style={{ animationDelay: '0.2s' }} />
                  </div>
                ) : projects.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <div className="w-20 h-20 mb-6 rounded-full bg-paper-surface flex items-center justify-center text-warm-gray border border-warm-gray/10">
                      <Cpu className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-lg text-ink-black mb-2">No configured projects</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed max-w-sm mb-6">Connect your GitHub, GitLab, or custom webhook endpoints to start monitoring infrastructure events.</p>
                    <button 
                      className="px-6 py-2.5 bg-primary text-on-primary font-semibold text-xs rounded-lg shadow-sm hover:opacity-90 transition-all duration-150 active:scale-95"
                      onClick={handleOpenCreateModal}
                    >
                      Onboard Project
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 p-6 overflow-y-auto max-h-[50vh] lg:max-h-[calc(100vh-380px)]">
                    {projects.map(project => (
                      <div key={project.id} className="bg-surface-container border border-warm-gray/20 rounded-lg p-5 text-left transition-all duration-200">
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
                              className="bg-transparent border-none text-warm-gray cursor-pointer p-1 rounded-lg transition-all duration-150 hover:bg-primary/10 hover:text-primary" 
                              title="Edit Credentials" 
                              onClick={() => handleOpenEditModal(project)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
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
                          <div className="flex items-center bg-paper-surface border border-warm-gray/20 rounded-lg px-3 py-2 justify-between gap-3">
                            <code className="font-mono text-xs text-primary whitespace-nowrap overflow-x-auto text-left scrollbar-none">
                              {`${API_BASE}/webhook/${project.webhook_secret}`}
                            </code>
                            <button 
                              className="bg-transparent border-none text-on-surface-variant cursor-pointer p-1.5 rounded-lg flex items-center justify-center transition-all duration-150 hover:text-ink-black hover:bg-surface-container" 
                              onClick={() => handleCopyWebhook(project.webhook_secret, project.id)}
                              title="Copy URL"
                            >
                              {copiedStates[project.id] ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="mt-3">
                            <button 
                              className="w-full flex items-center justify-center gap-1.5 bg-success/10 border border-success/20 hover:bg-success/20 text-success rounded-lg py-2.5 text-xs font-semibold cursor-pointer transition-all duration-150 active:scale-[0.98]"
                              onClick={() => handleTriggerTestIncident(project.webhook_secret, project.name)}
                            >
                              <Play className="w-3.5 h-3.5" /> Fire Test Alert (Ingestion Queue)
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Live Incident Tracking */}
              <div className="lg:col-span-5 bg-surface-container-low border border-warm-gray/20 rounded-xl flex flex-col overflow-hidden lg:h-full">
                <div className="px-6 py-[18px] border-b border-warm-gray/10 text-left bg-surface-container-low">
                  <h2 className="font-display text-base font-semibold m-0 text-ink-black">Active Incident Remediation logs</h2>
                </div>

                {loadingIncidents && incidents.length === 0 ? (
                  <div className="p-5 flex flex-col gap-2">
                    <div className="h-12 animate-skeleton rounded-lg" />
                    <div className="h-12 animate-skeleton rounded-lg" style={{ animationDelay: '0.15s' }} />
                    <div className="h-12 animate-skeleton rounded-lg" style={{ animationDelay: '0.3s' }} />
                    <div className="h-12 animate-skeleton rounded-lg" style={{ animationDelay: '0.45s' }} />
                  </div>
                ) : incidents.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                    <div className="w-16 h-16 mb-4 rounded-full bg-paper-surface flex items-center justify-center text-warm-gray border border-warm-gray/10">
                      <History className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium text-on-surface-variant italic">No incidents logged yet</p>
                    <div className="mt-6 w-full max-w-[160px] h-1 bg-warm-gray/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/20 w-1/3"></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto rounded-b-xl max-h-[50vh] lg:max-h-[calc(100vh-280px)]">
                    <table className="w-full border-collapse text-xs text-left table-fixed">
                      <thead>
                        <tr>
                          <th className="bg-surface-container px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant border-b border-warm-gray/20 sticky top-0 z-[2] w-[18%] text-center">Severity</th>
                          <th className="bg-surface-container px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant border-b border-warm-gray/20 sticky top-0 z-[2] w-[27%]">Service</th>
                          <th className="bg-surface-container px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant border-b border-warm-gray/20 sticky top-0 z-[2] w-[20%] hidden md:table-cell">Category</th>
                          <th className="bg-surface-container px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant border-b border-warm-gray/20 sticky top-0 z-[2] w-[20%] text-center">Status</th>
                          <th className="bg-surface-container px-4 py-3 text-[10px] font-bold uppercase text-on-surface-variant border-b border-warm-gray/20 sticky top-0 z-[2] w-[15%] text-right">Logged At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incidents.map(inc => (
                          <tr 
                            key={inc.id} 
                            onClick={() => setSelectedIncident(inc)}
                            className="cursor-pointer transition-colors duration-150 hover:bg-surface-container border-b border-warm-gray/10"
                          >
                            <td className="px-4 py-3 text-center">
                              <span className={`text-[9px] rounded px-1.5 py-0.5 tracking-wide ${getSeverityBadgeClass(inc.severity)}`}>
                                {inc.severity}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-ink-black truncate">{inc.raw_payload?.service || 'service'}</td>
                            <td className="px-4 py-3 hidden md:table-cell text-on-surface-variant font-medium">{inc.category}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-[9px] rounded-full px-2 py-0.5 inline-flex items-center ${getStatusBadgeClass(inc.status)}`}>
                                {inc.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-[11px] text-on-surface-variant font-mono">
                              {new Date(inc.created_at).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
            </>
            ) : (
              <DiscordSetupGuide globalBot={globalBotInfo} loading={loadingBotInfo} />
            )}
          </main>

          {/* PROJECT CREATION MODAL */}
          {showProjectModal && (
            <div className="fixed inset-0 bg-ink-black/20 backdrop-blur-[2px] flex items-center justify-center p-4 z-50 animate-fade">
              <div className="bg-surface-container-lowest border border-warm-gray/20 rounded-xl w-full max-w-[600px] shadow-[0_20px_40px_rgba(36,34,32,0.08)] overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-8 py-6 border-b border-warm-gray/10 flex justify-between items-center bg-surface-container-lowest">
                  <div>
                    <h2 className="font-display text-xl font-bold m-0 text-ink-black">{editingProject ? 'Edit Project Credentials' : 'Onboard New Project'}</h2>
                    <p className="text-xs text-on-surface-variant mt-1">{editingProject ? 'Modify your repository and alert integration parameters.' : 'Configure your repository and alert endpoints to start monitoring.'}</p>
                  </div>
                  <button className="bg-transparent border-none text-warm-gray hover:text-ink-black text-2xl cursor-pointer p-1 leading-none transition-colors" onClick={() => { setShowProjectModal(false); setProjFormError(''); }}>&times;</button>
                </div>
                {projFormError && (
                  <div className="bg-danger/10 border-l-[3px] border-l-danger text-danger text-xs px-8 py-3 font-semibold text-left">
                    {projFormError}
                  </div>
                )}
                
                <form onSubmit={handleCreateProject} className="px-8 py-6 overflow-y-auto text-left max-h-[70vh]">
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
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex flex-col gap-2 text-left flex-1">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Pinecone Namespace</label>
                      <input 
                        type="text" 
                        value={projPineconeNamespace} 
                        onChange={(e) => setProjPineconeNamespace(e.target.value)} 
                        placeholder="e.g. prod-cluster-v1" 
                        required 
                        className="bg-paper-surface border border-warm-gray/20 rounded-lg px-4 py-3 text-sm text-on-surface outline-none font-sans transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-2 text-left flex-1">
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

                  <div className="flex justify-end gap-3 mt-8">
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
                      {projFormLoading ? (editingProject ? 'Saving Changes...' : 'Configuring Project...') : (editingProject ? 'Save Changes' : 'Activate Project Webhook')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* INCIDENT DETAILS DRAWER */}
          {selectedIncident && (
            <div className="fixed inset-0 bg-ink-black/20 backdrop-blur-[2px] flex items-center justify-center z-50" onClick={() => setSelectedIncident(null)}>
              <div 
                className="absolute right-0 top-0 bottom-0 h-full max-w-[520px] w-full bg-surface-container-lowest border-l border-warm-gray/20 shadow-[-10px_0_30px_rgba(36,34,32,0.06)] flex flex-col overflow-hidden animate-slide-in" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-8 py-6 border-b border-warm-gray/10 flex justify-between items-center bg-surface-container-lowest">
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-extrabold rounded px-1.5 py-0.5 tracking-wide ${getSeverityBadgeClass(selectedIncident.severity)}`}>
                      {selectedIncident.severity}
                    </span>
                    <h2 className="font-display text-lg font-bold m-0 text-ink-black">Incident: {selectedIncident.id.slice(0, 8)}...</h2>
                  </div>
                  <button className="bg-transparent border-none text-warm-gray hover:text-ink-black text-2xl cursor-pointer p-1 leading-none transition-colors" onClick={() => setSelectedIncident(null)}>&times;</button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-6 text-left">
                  {/* Pipeline Visual Progress */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Pipeline Visual Progress</span>
                    <div className="flex items-center justify-between mt-2.5 mb-5 bg-surface-container-low border border-warm-gray/20 px-3 py-4 rounded-lg relative overflow-x-auto">
                      {/* Connector line */}
                      <div className="absolute top-[26px] left-[10%] right-[10%] h-0.5 bg-warm-gray/20 z-[1]"></div>
                      
                      {[
                        { num: 1, label: 'Triage', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : (selectedIncident.status === 'TRIGGERED' || selectedIncident.status === 'QUEUED') ? 'active' : 'completed' },
                        { num: 2, label: 'Approval', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : (selectedIncident.status === 'TRIGGERED' || selectedIncident.status === 'QUEUED') ? 'inactive' : selectedIncident.status === 'AWAITING_APPROVAL' ? 'active' : 'completed' },
                        { num: 3, label: 'Fixer', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : (selectedIncident.status === 'TRIGGERED' || selectedIncident.status === 'QUEUED' || selectedIncident.status === 'AWAITING_APPROVAL') ? 'inactive' : selectedIncident.status === 'FIXING' ? 'active' : 'completed' },
                        { num: 4, label: 'Memory', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : 'inactive' }
                      ].map(step => {
                        const state = step.getState();
                        const dotClass = state === 'completed' 
                          ? 'bg-success/10 border-success text-success' 
                          : state === 'active' 
                          ? 'bg-primary/10 border-primary text-primary animate-pulse' 
                          : 'bg-surface-container border-warm-gray/20 text-warm-gray';
                        const labelClass = state === 'completed' ? 'text-ink-black font-semibold' : state === 'active' ? 'text-primary font-semibold' : 'text-warm-gray';
                        return (
                          <div key={step.num} className="flex flex-col items-center flex-1 relative z-10 min-w-[70px]">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${dotClass}`}>
                              {step.num}
                            </div>
                            <div className={`text-[10px] mt-1.5 uppercase tracking-wider text-center ${labelClass}`}>{step.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Incident Metadata Details */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Incident Execution Metadata</span>
                    <div className="bg-surface-container-low border border-warm-gray/20 px-4 py-3 rounded-lg grid grid-cols-2 gap-3 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase text-warm-gray">Remediation Status</span>
                        <span className="text-ink-black font-semibold">{selectedIncident.status}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase text-warm-gray">LLM Model Target</span>
                        <span className="text-ink-black font-semibold">Gemini 2.5 Flash</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase text-warm-gray">Error Category</span>
                        <span className="text-ink-black font-semibold">{selectedIncident.category || 'PENDING'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase text-warm-gray">Ingested At</span>
                        <span className="text-ink-black font-semibold">{new Date(selectedIncident.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Normalized Error Signature</span>
                    <pre className="bg-surface-container border border-warm-gray/20 rounded-lg p-4 font-mono text-xs text-danger m-0 whitespace-pre-wrap break-all">
                      {selectedIncident.error_signature}
                    </pre>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Incident Remediation Timeline</span>
                    <div className="flex flex-col gap-5 relative pl-5">
                      {/* Timeline line */}
                      <div className="absolute left-[5px] top-1.5 bottom-1.5 w-0.5 bg-warm-gray/20"></div>
                      
                      <div className="flex gap-4 text-left relative">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success bg-surface-container-lowest rounded-full absolute -left-[21px] top-1 z-5" />
                        <div>
                          <h5 className="text-xs font-semibold m-0 mb-0.5 text-ink-black">Alert Ingested</h5>
                          <p className="text-[11px] text-on-surface-variant m-0">Received webhook trigger at {new Date(selectedIncident.created_at).toLocaleString()}</p>
                        </div>
                      </div>

                      {selectedIncident.triage && (
                        <div className="flex gap-4 text-left relative">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success bg-surface-container-lowest rounded-full absolute -left-[21px] top-1 z-5" />
                          <div>
                            <h5 className="text-xs font-semibold m-0 mb-0.5 text-ink-black">Triage Completed</h5>
                            <p className="text-[11px] text-on-surface-variant m-0">LLM classified alert. Error Category: <strong className="text-ink-black">{selectedIncident.category}</strong></p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 text-left relative">
                        {selectedIncident.status !== 'TRIGGERED' 
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-success bg-surface-container-lowest rounded-full absolute -left-[21px] top-1 z-5" />
                          : <Activity className="w-3.5 h-3.5 text-primary bg-surface-container-lowest rounded-full absolute -left-[21px] top-1 z-5 animate-spin-slow" />
                        }
                        <div>
                          <h5 className="text-xs font-semibold m-0 mb-0.5 text-ink-black">Discord approval requested</h5>
                          <p className="text-[11px] text-on-surface-variant m-0">Bot card message ID: <span className="font-mono text-[10px] bg-paper-surface px-1.5 py-0.5 border border-warm-gray/10 rounded">{selectedIncident.discord_message_id || 'Awaiting message delivery...'}</span></p>
                        </div>
                      </div>

                      {selectedIncident.status === 'FIXING' && (
                        <div className="flex gap-4 text-left relative">
                          <Activity className="w-3.5 h-3.5 text-primary bg-surface-container-lowest rounded-full absolute -left-[21px] top-1 z-5 animate-spin-slow" />
                          <div>
                            <h5 className="text-xs font-semibold m-0 mb-0.5 text-ink-black">Remediation War-Room Active</h5>
                            <p className="text-[11px] text-on-surface-variant m-0">Analyzing candidate repositories and writing pull request patch...</p>
                          </div>
                        </div>
                      )}

                      {selectedIncident.status === 'CLOSED_AND_LEARNED' && (
                        <div className="flex gap-4 text-left relative">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success bg-surface-container-lowest rounded-full absolute -left-[21px] top-1 z-5" />
                          <div>
                            <h5 className="text-xs font-semibold m-0 mb-0.5 text-ink-black">Remediation complete</h5>
                            <p className="text-[11px] text-on-surface-variant m-0">GitHub PR created. Stored details into Pinecone namespaces.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedIncident.root_cause && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Root Cause Analysis</span>
                      <p className="text-on-surface-variant text-xs leading-relaxed bg-surface-container p-4 rounded-lg border border-warm-gray/20">
                        {selectedIncident.root_cause}
                      </p>
                    </div>
                  )}

                  {selectedIncident.postmortem && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Remediation Diffs & Postmortem</span>
                      <pre className="bg-surface-container border border-warm-gray/20 rounded-lg p-4 font-mono text-[11px] text-[#2e7d32] m-0 whitespace-pre-wrap break-all overflow-x-auto max-h-[200px]">
                        {selectedIncident.postmortem}
                      </pre>
                    </div>
                  )}

                  {selectedIncident.pr_url && (
                    <div className="flex flex-col gap-2 mt-2">
                      <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Remediation PR Target</span>
                      <a 
                        href={selectedIncident.pr_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary border-none rounded-lg p-3 text-xs font-semibold no-underline transition-opacity duration-150 hover:opacity-90 active:scale-[0.98]"
                      >
                        <GitBranch className="w-4 h-4" /> View Opened Pull Request <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}

function DiscordSetupGuide({ globalBot, loading }) {
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
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 text-left animate-fade">
      <div className="max-w-[900px] mx-auto bg-surface-container-low border border-warm-gray/20 rounded-2xl p-6 md:p-8 shadow-sm">
        
        {/* Banner header */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10">
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
          <div className="bg-gradient-to-r from-[#5865F2]/10 to-[#5865F2]/5 border border-[#5865F2]/20 rounded-xl p-5 md:p-6 mb-8 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-full bg-[#5865F2] flex items-center justify-center text-white shrink-0 relative shadow-sm">
                {globalBot.avatar ? (
                  <img src={globalBot.avatar} alt="Bot Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Cpu className="w-6 h-6" />
                )}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-success border-2 border-surface-container-low rounded-full"></span>
              </div>
              <div className="min-w-0">
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
          <div className="flex gap-4 md:gap-6 border-b border-warm-gray/10 pb-6">
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
          <div className="flex gap-4 md:gap-6 border-b border-warm-gray/10 pb-6">
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
          <div className="flex gap-4 md:gap-6 border-b border-warm-gray/10 pb-6">
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
                <div className="min-w-0 flex-1">
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
          <div className="flex gap-4 md:gap-6 border-b border-warm-gray/10 pb-6">
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
          <div className="flex gap-4 md:gap-6">
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
          <div className="p-2 bg-primary/10 rounded-lg text-primary h-fit">
            <Eye className="w-5 h-5 animate-pulse" />
          </div>
          <div>
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

export default App;
