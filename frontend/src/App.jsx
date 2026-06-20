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
  Activity
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

function App() {
  const [view, setView] = useState('LANDING'); // LANDING, SIGN_IN, SIGN_UP, DASHBOARD
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
  
  // Project Form
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projGithubOwner, setProjGithubOwner] = useState('');
  const [projGithubRepo, setProjGithubRepo] = useState('');
  const [projGithubToken, setProjGithubToken] = useState('');
  const [projDiscordChannel, setProjDiscordChannel] = useState('');
  const [projOpenRouterKey, setProjOpenRouterKey] = useState('');
  const [projPineconeNamespace, setProjPineconeNamespace] = useState('');
  const [projFormError, setProjFormError] = useState('');
  const [projFormLoading, setProjFormLoading] = useState(false);

  // Selected Incident Detail Modal
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [copiedStates, setCopiedStates] = useState({}); // project.id -> boolean (for webhook secret copy feedback)
  const [guideOpen, setGuideOpen] = useState(true);

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

  // Poll for incidents updates when logged in
  useEffect(() => {
    let interval;
    if (token && view === 'DASHBOARD') {
      interval = setInterval(() => {
        fetchIncidents();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [token, view]);

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
    fetchIncidents();
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

  const fetchIncidents = async () => {
    setLoadingIncidents(true);
    try {
      const res = await fetch(`${API_BASE}/incidents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error('Error loading incidents:', err);
    } finally {
      setLoadingIncidents(false);
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
      openrouter_key: projOpenRouterKey,
      pinecone_namespace: projPineconeNamespace
    };

    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setProjects(prev => [data.project, ...prev]);
        setShowProjectModal(false);
        // Reset form fields
        setProjName('');
        setProjDesc('');
        setProjGithubOwner('');
        setProjGithubRepo('');
        setProjGithubToken('');
        setProjDiscordChannel('');
        setProjOpenRouterKey('');
        setProjPineconeNamespace('');
      } else {
        setProjFormError(data.error || 'Failed to create project.');
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
        fetchIncidents();
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
      case 'P1': return 'bg-danger-glow text-[#f87171]';
      case 'P2': return 'bg-warning-glow text-[#fbbf24]';
      default: return 'bg-success-glow text-[#34d399]';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'TRIGGERED': return 'bg-accent/15 text-[#a7a3ff]';
      case 'AWAITING_APPROVAL': return 'bg-warning-glow text-[#fbbf24]';
      case 'FIXING': return 'bg-[rgba(167,139,250,0.15)] text-[#c084fc]';
      case 'CLOSED_AND_LEARNED': return 'bg-success-glow text-[#34d399]';
      case 'MUTED': return 'bg-[rgba(156,163,175,0.15)] text-text-muted';
      default: return 'bg-danger-glow text-[#f87171]';
    }
  };

  const getPipelineStepClass = (status, stepStatuses) => {
    if (stepStatuses === 'completed') return 'completed';
    if (stepStatuses === 'active') return 'active';
    return 'inactive';
  };

  return (
    <div className="flex flex-col min-h-screen w-screen bg-bg-primary text-text-primary">
      
      {/* 1. LANDING PAGE VIEW */}
      {view === 'LANDING' && (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
          {/* Glow backgrounds */}
          <div className="absolute w-[40%] h-[40%] rounded-full pointer-events-none z-0" style={{ top: '5%', left: '5%', background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)', filter: 'blur(80px)' }}></div>
          <div className="absolute w-[40%] h-[40%] rounded-full pointer-events-none z-0" style={{ bottom: '15%', right: '10%', background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)', filter: 'blur(80px)' }}></div>
          
          <header className="flex justify-between items-center px-[8%] py-6 border-b border-border z-10 backdrop-blur-[10px] bg-bg-primary/70">
            <div className="flex items-center gap-2.5">
              <Eye className="w-7 h-7 text-accent" />
              <span className="text-[22px] font-bold tracking-tight">WatcherAgent</span>
            </div>
            <div className="flex gap-4">
              <button 
                className="bg-transparent text-text-primary border border-border rounded-md px-[18px] py-2 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-bg-tertiary hover:border-text-muted"
                onClick={() => setView('SIGN_IN')}
              >
                Sign In
              </button>
              <button 
                className="bg-accent text-white border-none rounded-md px-[18px] py-2 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_0_15px_var(--color-accent-glow)]"
                onClick={() => setView('SIGN_UP')}
              >
                Get Started
              </button>
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center text-center px-[8%] py-[60px] pb-[100px] z-5 animate-fade">
            <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-3.5 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
              <span className="text-xs font-bold tracking-wider uppercase text-[#a7a3ff]">AI Incident Response Platform</span>
            </div>
            <h1 className="text-[54px] font-extrabold leading-[1.15] tracking-[-1.5px] m-0 mb-5">
              Autonomously Triage, notify & <br />
              <span className="bg-gradient-to-br from-[#c084fc] to-[#6366f1] bg-clip-text text-transparent">Resolve Production Incidents</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-[750px] leading-relaxed mb-10">
              Transform WatcherAgent from a single-project pipeline into a multi-repository management system. Connect alert systems, request on-call approvals via Discord, deploy automated fixes via GitHub PRs, and retain vector knowledge isolation.
            </p>
            <div className="flex gap-4 mb-20">
              <button 
                className="bg-accent text-white border-none rounded-lg px-7 py-3 text-base font-semibold cursor-pointer flex items-center gap-2.5 transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_0_20px_var(--color-accent-glow)]"
                onClick={() => setView('SIGN_UP')}
              >
                Initialize Account <ArrowRight className="w-[18px] h-[18px]" />
              </button>
              <button 
                className="bg-bg-tertiary text-text-primary border border-border rounded-lg px-7 py-3 text-base font-semibold cursor-pointer flex items-center gap-2.5 transition-all duration-200 hover:bg-bg-primary hover:border-text-muted"
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <GitBranch className="w-[18px] h-[18px]" /> View Repository
              </button>
            </div>

            {/* Pipeline Step Visualizer */}
            <div className="w-full max-w-[1100px] mt-5 border-t border-border pt-[50px]">
              <h3 className="text-xl font-semibold mb-[30px] text-text-secondary">The 5-Node Autonomous Remediation Pipeline</h3>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-5">
                {[
                  { num: '01', title: 'Triage', desc: 'LLM categorizes severity, error footprint and determines root files.' },
                  { num: '02', title: 'Runbook RAG', desc: 'Matches error signature against Pinecone namespace to reuse past solutions.' },
                  { num: '03', title: 'HITL Approval', desc: 'Sends interactive cards with approval actions to on-call Discord.' },
                  { num: '04', title: 'Fixer War-Room', desc: 'Audits code context, resolves imports, and opens a GitHub Pull Request.' },
                  { num: '05', title: 'Narrator Loop', desc: 'Saves solution reasoning as vector metadata for instant memory recall.' }
                ].map(step => (
                  <div key={step.num} className="bg-bg-secondary border border-border rounded-lg px-5 py-6 text-left transition-all duration-300 hover:border-accent/40 hover:-translate-y-1">
                    <div className="text-sm font-extrabold text-accent mb-3">{step.num}</div>
                    <h4 className="text-base font-semibold m-0 mb-2.5">{step.title}</h4>
                    <p className="text-[13px] text-text-secondary leading-normal m-0">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* 2. SIGN IN VIEW */}
      {view === 'SIGN_IN' && (
        <div className="min-h-screen flex items-center justify-center relative p-10 animate-fade">
          <div className="absolute w-[40%] h-[40%] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)', filter: 'blur(80px)' }}></div>
          <div className="w-full max-w-[440px] bg-bg-secondary border border-border rounded-xl p-10 z-5 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="text-center mb-8">
              <Eye className="w-10 h-10 text-accent mb-4" />
              <h2 className="text-2xl font-bold m-0 mb-2">Welcome Back</h2>
              <p className="text-sm text-text-secondary m-0">Log in to access your WatcherAgent console.</p>
            </div>
            
            {authError && (
              <div className="bg-danger-glow border border-[rgba(239,68,68,0.3)] text-[#f87171] text-[13px] p-3 rounded-md mb-6 text-center font-medium">
                {authError}
              </div>
            )}
            
            <form onSubmit={(e) => handleAuthSubmit(e, 'SIGN_IN')} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[13px] font-semibold text-text-secondary flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <input 
                  type="email" 
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)} 
                  placeholder="name@company.com" 
                  required 
                  className="bg-bg-primary border border-border rounded-md px-3.5 py-3 text-sm text-text-primary outline-none font-sans transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_rgba(75,65,225,0.15)]"
                />
              </div>
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[13px] font-semibold text-text-secondary flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Password
                </label>
                <input 
                  type="password" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  className="bg-bg-primary border border-border rounded-md px-3.5 py-3 text-sm text-text-primary outline-none font-sans transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_rgba(75,65,225,0.15)]"
                />
              </div>
              <button type="submit" className="bg-accent text-white border-none rounded-md py-3 text-[15px] font-semibold cursor-pointer mt-2.5 transition-all duration-200 hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed" disabled={authLoading}>
                {authLoading ? 'Signing In...' : 'Access Dashboard'}
              </button>
            </form>
            <div className="mt-6 text-center text-[13px] text-text-secondary">
              Don't have an account? <span className="text-accent font-semibold cursor-pointer hover:underline" onClick={() => { setView('SIGN_UP'); setAuthError(''); }}>Sign Up</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SIGN UP VIEW */}
      {view === 'SIGN_UP' && (
        <div className="min-h-screen flex items-center justify-center relative p-10 animate-fade">
          <div className="absolute w-[40%] h-[40%] rounded-full pointer-events-none z-0" style={{ background: 'radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%)', filter: 'blur(80px)' }}></div>
          <div className="w-full max-w-[440px] bg-bg-secondary border border-border rounded-xl p-10 z-5 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="text-center mb-8">
              <Eye className="w-10 h-10 text-accent mb-4" />
              <h2 className="text-2xl font-bold m-0 mb-2">Create Platform Account</h2>
              <p className="text-sm text-text-secondary m-0">No credentials required for initial onboarding.</p>
            </div>

            {authError && (
              <div className="bg-danger-glow border border-[rgba(239,68,68,0.3)] text-[#f87171] text-[13px] p-3 rounded-md mb-6 text-center font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={(e) => handleAuthSubmit(e, 'SIGN_UP')} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[13px] font-semibold text-text-secondary flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Full Name
                </label>
                <input 
                  type="text" 
                  value={authName} 
                  onChange={(e) => setAuthName(e.target.value)} 
                  placeholder="Ayush Shakya" 
                  required 
                  className="bg-bg-primary border border-border rounded-md px-3.5 py-3 text-sm text-text-primary outline-none font-sans transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_rgba(75,65,225,0.15)]"
                />
              </div>
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[13px] font-semibold text-text-secondary flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <input 
                  type="email" 
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)} 
                  placeholder="name@company.com" 
                  required 
                  className="bg-bg-primary border border-border rounded-md px-3.5 py-3 text-sm text-text-primary outline-none font-sans transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_rgba(75,65,225,0.15)]"
                />
              </div>
              <div className="flex flex-col gap-2 text-left">
                <label className="text-[13px] font-semibold text-text-secondary flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Password
                </label>
                <input 
                  type="password" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                  placeholder="At least 6 characters" 
                  required 
                  className="bg-bg-primary border border-border rounded-md px-3.5 py-3 text-sm text-text-primary outline-none font-sans transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_rgba(75,65,225,0.15)]"
                />
              </div>
              <button type="submit" className="bg-accent text-white border-none rounded-md py-3 text-[15px] font-semibold cursor-pointer mt-2.5 transition-all duration-200 hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed" disabled={authLoading}>
                {authLoading ? 'Creating Account...' : 'Initialize Onboarding'}
              </button>
            </form>
            <div className="mt-6 text-center text-[13px] text-text-secondary">
              Already have an account? <span className="text-accent font-semibold cursor-pointer hover:underline" onClick={() => { setView('SIGN_IN'); setAuthError(''); }}>Log In</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. DASHBOARD VIEW */}
      {view === 'DASHBOARD' && (
        <div className="flex h-screen w-screen overflow-hidden animate-fade">
          
          {/* Sidebar */}
          <aside className="w-[250px] shrink-0 bg-bg-secondary border-r border-border flex flex-col justify-between p-6">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Eye className="w-6 h-6 text-accent" />
                <div>
                  <span className="text-lg font-bold block">Watcher</span>
                  <span className="text-[10px] text-accent font-bold tracking-wider uppercase block">Platform Core</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary border border-border-light mb-6">
                <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-[13px] font-semibold text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">{user?.name || 'User Profile'}</span>
                  <span className="text-[11px] text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">{user?.email}</span>
                </div>
              </div>

              <nav className="flex flex-col gap-1 flex-1">
                <div className="text-[10px] font-bold tracking-wider text-text-muted mt-4 mb-2 ml-3 text-left">MANAGEMENT</div>
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] font-semibold bg-accent/10 text-[#a7a3ff] border-l-2 border-accent cursor-pointer">
                  <Activity className="w-4 h-4" /> Console Dashboard
                </div>
                <div 
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-[13px] font-semibold text-text-secondary cursor-pointer transition-all duration-200 hover:bg-bg-tertiary hover:text-text-primary"
                  onClick={() => setShowProjectModal(true)}
                >
                  <Plus className="w-4 h-4" /> Create Project
                </div>
              </nav>
            </div>

            <div className="mt-auto">
              <button 
                className="w-full flex items-center justify-center gap-2 bg-transparent text-text-secondary border border-border rounded-md py-2.5 text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:bg-danger-glow hover:text-[#f87171] hover:border-[rgba(239,68,68,0.3)]"
                onClick={handleLogout}
              >
                <LogOut className="w-3.5 h-3.5" /> Log Out
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="h-20 shrink-0 border-b border-border bg-bg-secondary flex justify-between items-center px-8">
              <div className="text-left">
                <h1 className="text-xl font-bold m-0 mb-1 tracking-tight">Platform Console</h1>
                <p className="text-xs text-text-secondary m-0">Monitor multi-project alerts, manage BullMQ jobs, and watch active resolutions.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  className="bg-bg-tertiary border border-border text-text-primary rounded-md px-4 py-2.5 text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:border-text-muted"
                  onClick={fetchDashboardData}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Console
                </button>
                <button 
                  className="bg-accent text-white border-none rounded-md px-4 py-2.5 text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:bg-accent-hover"
                  onClick={() => setShowProjectModal(true)}
                >
                  <Plus className="w-[18px] h-[18px]" /> Add Project
                </button>
              </div>
            </header>

            {/* Developer Guidance Banner */}
            <div className="mx-8 mt-3 mb-6 bg-gradient-to-br from-accent/[0.08] to-[rgba(192,132,252,0.05)] border border-accent/20 rounded-lg px-6 py-4 relative overflow-hidden text-left">
              <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setGuideOpen(!guideOpen)}>
                <h3 className="text-[15px] font-bold m-0 flex items-center gap-2 text-[#a7a3ff]">
                  <Activity className="w-5 h-5 text-accent animate-pulse" />
                  <span>Interactive Quick Start & Pipeline Architecture Guide</span>
                </h3>
                <span className="text-xs text-text-secondary font-semibold">
                  {guideOpen ? 'Collapse [-]' : 'Expand [+]'}
                </span>
              </div>
              
              {guideOpen && (
                <div className="mt-3.5 text-[13px] leading-relaxed text-text-secondary border-t border-dashed border-white/[0.08] pt-3.5 animate-fade">
                  <p>
                    Welcome to the <strong>WatcherAgent Console</strong>! This dashboard monitors a multi-project, human-in-the-loop AI Incident Remediation Pipeline backed by BullMQ. Follow this workflow to trigger and test the active agent pipeline:
                  </p>
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 mt-3">
                    {[
                      { title: '1. Copy Webhook URL', desc: 'Onboard a project (or use the pre-configured database records) and copy the unique webhook URL. Alerts are routed here.' },
                      { title: '2. Click "Fire Test Alert"', desc: 'Triggers a simulated database replica crash webhook alert, queueing an ingestion task on BullMQ.' },
                      { title: '3. Approve in Discord', desc: 'The worker logs the incident, runs triage, and posts an interactive approval card to Discord. Click Accept & Fix on Discord.' },
                      { title: '4. Automatic Git Auto-Fix', desc: 'Once approved, the AI fixer automatically writes code, opens a GitHub PR, indexes learnings into Pinecone, and resolves the issue.' }
                    ].map(step => (
                      <div key={step.title} className="bg-bg-primary/40 border border-border rounded-md px-4 py-3">
                        <h4 className="m-0 mb-1 text-[13px] font-bold text-text-primary">{step.title}</h4>
                        <p className="m-0 text-[11px] text-text-secondary">{step.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <section className="grid grid-cols-3 gap-4 px-8 shrink-0 bg-bg-primary">
              <div className="bg-bg-secondary border border-border rounded-lg p-5 text-left border-l-[3px] border-l-accent">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold uppercase text-text-secondary tracking-wide">Active Projects</span>
                  <Cpu className="w-4 h-4 text-accent" />
                </div>
                <div className="text-[28px] font-extrabold leading-none mb-1">{projects.length}</div>
                <div className="text-[11px] text-text-muted">Configured environments</div>
              </div>
              <div className="bg-bg-secondary border border-border rounded-lg p-5 text-left border-l-[3px] border-l-accent">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold uppercase text-text-secondary tracking-wide">Total Alert Volume</span>
                  <Activity className="w-4 h-4 text-warning" />
                </div>
                <div className="text-[28px] font-extrabold leading-none mb-1">{incidents.length}</div>
                <div className="text-[11px] text-text-muted">Remediated via pipeline</div>
              </div>
              <div className="bg-bg-secondary border border-border rounded-lg p-5 text-left border-l-[3px] border-l-accent">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-bold uppercase text-text-secondary tracking-wide">Awaiting approval</span>
                  <AlertTriangle className="w-4 h-4 text-danger" />
                </div>
                <div className="text-[28px] font-extrabold leading-none mb-1">
                  {incidents.filter(i => i.status === 'AWAITING_APPROVAL').length}
                </div>
                <div className="text-[11px] text-text-muted">HITL Slack / Discord cards</div>
              </div>
            </section>

            {/* Content Layout Split */}
            <div className="flex-1 grid grid-cols-[1.1fr_0.9fr] gap-5 px-8 pb-8 overflow-hidden h-full mt-6">
              
              {/* Left Column: Projects List */}
              <div className="bg-bg-secondary border border-border rounded-lg flex flex-col overflow-hidden">
                <div className="px-6 py-[18px] border-b border-border text-left">
                  <h2 className="text-[15px] font-bold m-0 uppercase tracking-wide text-text-secondary">Configured Webhooks & Repositories</h2>
                </div>
                
                {loadingProjects && projects.length === 0 ? (
                  <div className="p-5 flex flex-col gap-3">
                    <div className="h-[140px] animate-skeleton rounded-md" />
                    <div className="h-[140px] animate-skeleton rounded-md" style={{ animationDelay: '0.2s' }} />
                  </div>
                ) : projects.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 text-text-secondary">
                    <h3 className="text-base font-semibold m-0 mb-2 text-text-primary">No configured projects</h3>
                    <p className="text-[13px] max-w-[320px] leading-normal text-center mb-5">Onboard your first project to generate a secure webhook integration endpoint.</p>
                    <button 
                      className="bg-accent text-white border-none rounded-md px-[18px] py-2 text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-accent-hover hover:shadow-[0_0_15px_var(--color-accent-glow)]"
                      onClick={() => setShowProjectModal(true)}
                    >
                      Onboard Project
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 p-5 overflow-y-auto">
                    {projects.map(project => (
                      <div key={project.id} className="bg-bg-tertiary border border-border rounded-md p-5 text-left">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-base font-bold m-0 mb-1.5">{project.name}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                              <GitBranch className="w-3.5 h-3.5" />
                              <span>{project.github_owner}/{project.github_repo}</span>
                            </div>
                          </div>
                          <button 
                            className="bg-transparent border-none text-text-muted cursor-pointer p-1 rounded transition-all duration-200 hover:bg-danger-glow hover:text-[#f87171]" 
                            title="Delete Project" 
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* Webhook Configuration panel */}
                        <div className="bg-bg-primary border border-border rounded-md px-4 py-3.5">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-bold text-text-secondary">Secure Ingest Webhook</span>
                            <span className="text-[9px] font-extrabold bg-accent/15 text-[#a7a3ff] rounded px-1.5 py-0.5">One per Project</span>
                          </div>
                          <div className="flex items-center bg-bg-secondary border border-border rounded px-2.5 py-1.5 justify-between gap-2">
                            <code className="font-mono text-[11px] text-[#a7a3ff] whitespace-nowrap overflow-x-auto text-left">
                              {`${API_BASE}/webhook/${project.webhook_secret}`}
                            </code>
                            <button 
                              className="bg-transparent border-none text-text-secondary cursor-pointer p-1 rounded flex items-center justify-center transition-all duration-200 hover:text-text-primary hover:bg-bg-tertiary" 
                              onClick={() => handleCopyWebhook(project.webhook_secret, project.id)}
                              title="Copy URL"
                            >
                              {copiedStates[project.id] ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="mt-3">
                            <button 
                              className="w-full flex items-center justify-center gap-1.5 bg-success/[0.08] border border-dashed border-success/30 text-[#34d399] rounded px-2 py-2 text-[11px] font-bold cursor-pointer transition-all duration-200 uppercase tracking-wide hover:bg-success-glow hover:border-success"
                              onClick={() => handleTriggerTestIncident(project.webhook_secret, project.name)}
                            >
                              <Play className="w-3 h-3" /> Fire Test Alert (Ingestion Queue)
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Live Incident Tracking */}
              <div className="bg-bg-secondary border border-border rounded-lg flex flex-col overflow-hidden">
                <div className="px-6 py-[18px] border-b border-border text-left">
                  <h2 className="text-[15px] font-bold m-0 uppercase tracking-wide text-text-secondary">Active Incident Remediation logs</h2>
                </div>

                {loadingIncidents && incidents.length === 0 ? (
                  <div className="p-5 flex flex-col gap-2">
                    <div className="h-12 animate-skeleton rounded" />
                    <div className="h-12 animate-skeleton rounded" style={{ animationDelay: '0.15s' }} />
                    <div className="h-12 animate-skeleton rounded" style={{ animationDelay: '0.3s' }} />
                    <div className="h-12 animate-skeleton rounded" style={{ animationDelay: '0.45s' }} />
                  </div>
                ) : incidents.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 text-text-secondary">
                    <h3 className="text-base font-semibold m-0 mb-2 text-text-primary">No incidents logged yet</h3>
                    <p className="text-[13px] max-w-[320px] leading-normal text-center mb-5">Trigger a test alert on your configured project webhook to watch the AI worker run runs.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto rounded-b-lg">
                    <table className="w-full border-collapse text-[13px] text-left table-fixed">
                      <thead>
                        <tr>
                          <th className="bg-bg-secondary px-5 py-3.5 text-[10px] font-bold uppercase text-text-muted border-b border-border sticky top-0 z-[2] w-[15%] text-center">Severity</th>
                          <th className="bg-bg-secondary px-5 py-3.5 text-[10px] font-bold uppercase text-text-muted border-b border-border sticky top-0 z-[2] w-[25%]">Service</th>
                          <th className="bg-bg-secondary px-5 py-3.5 text-[10px] font-bold uppercase text-text-muted border-b border-border sticky top-0 z-[2] w-[20%]">Category</th>
                          <th className="bg-bg-secondary px-5 py-3.5 text-[10px] font-bold uppercase text-text-muted border-b border-border sticky top-0 z-[2] w-[22%]">Status</th>
                          <th className="bg-bg-secondary px-5 py-3.5 text-[10px] font-bold uppercase text-text-muted border-b border-border sticky top-0 z-[2] w-[18%]">Logged At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incidents.map(inc => (
                          <tr 
                            key={inc.id} 
                            onClick={() => setSelectedIncident(inc)}
                            className="cursor-pointer transition-colors duration-200 hover:bg-bg-tertiary"
                          >
                            <td className="px-5 py-3.5 border-b border-border text-text-secondary text-center">
                              <span className={`text-[9px] font-extrabold rounded px-1.5 py-0.5 tracking-wide ${getSeverityBadgeClass(inc.severity)}`}>
                                {inc.severity}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 border-b border-border font-semibold text-text-primary truncate max-w-[120px]">{inc.raw_payload?.service || 'service'}</td>
                            <td className="px-5 py-3.5 border-b border-border text-text-secondary">
                              <span className="font-medium text-text-primary">{inc.category}</span>
                            </td>
                            <td className="px-5 py-3.5 border-b border-border text-text-secondary">
                              <span className={`text-[10px] font-bold rounded-full px-2.5 py-1 inline-flex items-center ${getStatusBadgeClass(inc.status)}`}>
                                {inc.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 border-b border-border text-xs text-text-muted">
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
          </main>

          {/* PROJECT CREATION MODAL */}
          {showProjectModal && (
            <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-lg flex items-center justify-center z-50">
              <div className="bg-bg-secondary border border-border rounded-xl w-full max-w-[600px] shadow-[0_25px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-fade">
                <div className="px-7 py-5 border-b border-border flex justify-between items-center">
                  <h2 className="text-lg font-bold m-0">Onboard New Project</h2>
                  <button className="bg-transparent border-none text-text-muted text-2xl cursor-pointer p-1 leading-none hover:text-text-primary" onClick={() => { setShowProjectModal(false); setProjFormError(''); }}>&times;</button>
                </div>
                {projFormError && (
                  <div className="bg-danger-glow border-l-[3px] border-l-danger text-[#f87171] text-[13px] px-5 py-3 font-medium text-left">
                    {projFormError}
                  </div>
                )}
                
                <form onSubmit={handleCreateProject} className="px-7 py-6 max-h-[80vh] overflow-y-auto text-left">
                  <div className="text-[11px] font-extrabold tracking-wider text-accent uppercase mb-3 pb-1.5 border-b border-dashed border-border">General Info</div>
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex flex-col gap-2 text-left">
                      <label className="text-[13px] font-semibold text-text-secondary">Project / Service Name</label>
                      <input 
                        type="text" 
                        value={projName} 
                        onChange={(e) => setProjName(e.target.value)} 
                        placeholder="e.g. Payment Gateway Service" 
                        required 
                        className="bg-bg-primary border border-border rounded-md px-3 py-2.5 text-[13px] text-text-primary outline-none font-sans transition-all duration-200 w-full focus:border-accent focus:shadow-[0_0_0_3px_rgba(75,65,225,0.15)]"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] font-extrabold tracking-wider text-accent uppercase mt-5 mb-3 pb-1.5 border-b border-dashed border-border">Git & Repo Details</div>
                  <div className="flex flex-row gap-4 mb-4">
                    <div className="flex flex-col gap-2 text-left flex-1">
                      <label className="text-[13px] font-semibold text-text-secondary">GitHub Repository Owner</label>
                      <input 
                        type="text" 
                        value={projGithubOwner} 
                        onChange={(e) => setProjGithubOwner(e.target.value)} 
                        placeholder="e.g. ayush-shakya" 
                        required 
                        className="bg-bg-primary border border-border rounded-md px-3 py-2.5 text-[13px] text-text-primary outline-none font-sans transition-all duration-200 w-full focus:border-accent focus:shadow-[0_0_0_3px_rgba(75,65,225,0.15)]"
                      />
                    </div>
                    <div className="flex flex-col gap-2 text-left flex-1">
                      <label className="text-[13px] font-semibold text-text-secondary">GitHub Repository Name</label>
                      <input 
                        type="text" 
                        value={projGithubRepo} 
                        onChange={(e) => setProjGithubRepo(e.target.value)} 
                        placeholder="e.g. core-payments-api" 
                        required 
                        className="bg-bg-primary border border-border rounded-md px-3 py-2.5 text-[13px] text-text-primary outline-none font-sans transition-all duration-200 w-full focus:border-accent focus:shadow-[0_0_0_3px_rgba(75,65,225,0.15)]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 mb-4">
                    <div className="flex flex-col gap-2 text-left">
                      <label className="text-[13px] font-semibold text-text-secondary">GitHub PAT Token (Contents + PR scopes)</label>
                      <input 
                        type="password" 
                        value={projGithubToken} 
                        onChange={(e) => setProjGithubToken(e.target.value)} 
                        placeholder="ghp_••••••••••••••••••••" 
                        required 
                        className="bg-bg-primary border border-border rounded-md px-3 py-2.5 text-[13px] text-text-primary outline-none font-sans transition-all duration-200 w-full focus:border-accent focus:shadow-[0_0_0_3px_rgba(75,65,225,0.15)]"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] font-extrabold tracking-wider text-accent uppercase mt-5 mb-3 pb-1.5 border-b border-dashed border-border">Integrations & Knowledge Base</div>
                  <div className="flex flex-row gap-4 mb-4">
                    <div className="flex flex-col gap-2 text-left flex-1">
                      <label className="text-[13px] font-semibold text-text-secondary">Discord Alert Channel ID</label>
                      <input 
                        type="text" 
                        value={projDiscordChannel} 
                        onChange={(e) => setProjDiscordChannel(e.target.value)} 
                        placeholder="e.g. 119827364501" 
                        required 
                        className="bg-bg-primary border border-border rounded-md px-3 py-2.5 text-[13px] text-text-primary outline-none font-sans transition-all duration-200 w-full focus:border-accent focus:shadow-[0_0_0_3px_rgba(75,65,225,0.15)]"
                      />
                    </div>
                    <div className="flex flex-col gap-2 text-left flex-1">
                      <label className="text-[13px] font-semibold text-text-secondary">Pinecone Namespace Segment</label>
                      <input 
                        type="text" 
                        value={projPineconeNamespace} 
                        onChange={(e) => setProjPineconeNamespace(e.target.value)} 
                        placeholder="e.g. payments-ns" 
                        required 
                        className="bg-bg-primary border border-border rounded-md px-3 py-2.5 text-[13px] text-text-primary outline-none font-sans transition-all duration-200 w-full focus:border-accent focus:shadow-[0_0_0_3px_rgba(75,65,225,0.15)]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-row gap-4 mb-4">
                    <div className="flex flex-col gap-2 text-left flex-1">
                      <label className="text-[13px] font-semibold text-text-secondary">OpenRouter LLM Key</label>
                      <input 
                        type="password" 
                        value={projOpenRouterKey} 
                        onChange={(e) => setProjOpenRouterKey(e.target.value)} 
                        placeholder="sk-or-v1-••••••••••••••••" 
                        required 
                        className="bg-bg-primary border border-border rounded-md px-3 py-2.5 text-[13px] text-text-primary outline-none font-sans transition-all duration-200 w-full focus:border-accent focus:shadow-[0_0_0_3px_rgba(75,65,225,0.15)]"
                      />
                    </div>
                    <div className="flex flex-col gap-2 text-left flex-1">
                      <label className="text-[13px] font-semibold text-text-secondary">Description / Custom Runbook Context (Optional)</label>
                      <input 
                        type="text" 
                        value={projDesc} 
                        onChange={(e) => setProjDesc(e.target.value)} 
                        placeholder="Remediation preferences..." 
                        className="bg-bg-primary border border-border rounded-md px-3 py-2.5 text-[13px] text-text-primary outline-none font-sans transition-all duration-200 w-full focus:border-accent focus:shadow-[0_0_0_3px_rgba(75,65,225,0.15)]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-8">
                    <button 
                      type="button" 
                      className="bg-transparent text-text-secondary border border-border rounded-md px-5 py-2.5 text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:bg-bg-tertiary" 
                      onClick={() => { setShowProjectModal(false); setProjFormError(''); }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="bg-accent text-white border-none rounded-md px-5 py-2.5 text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed" disabled={projFormLoading}>
                      {projFormLoading ? 'Configuring Project...' : 'Activate Project Webhook'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* INCIDENT DETAILS DRAWER */}
          {selectedIncident && (
            <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-lg flex items-center justify-center z-50" onClick={() => setSelectedIncident(null)}>
              <div 
                className="absolute right-0 top-0 bottom-0 h-full max-w-[520px] w-full bg-bg-secondary border-l border-border shadow-[-10px_0_30px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-slide-in" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-7 py-5 border-b border-border flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-extrabold rounded px-1.5 py-0.5 tracking-wide ${getSeverityBadgeClass(selectedIncident.severity)}`}>
                      {selectedIncident.severity}
                    </span>
                    <h2 className="text-lg font-bold m-0">Incident: {selectedIncident.id.slice(0, 8)}...</h2>
                  </div>
                  <button className="bg-transparent border-none text-text-muted text-2xl cursor-pointer p-1 leading-none hover:text-text-primary" onClick={() => setSelectedIncident(null)}>&times;</button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-6 text-left">
                  {/* Pipeline Visual Progress */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase text-text-muted tracking-wide">Pipeline Visual Progress</span>
                    <div className="flex items-center justify-between mt-2.5 mb-5 bg-bg-primary border border-border px-3 py-4 rounded-lg relative overflow-x-auto">
                      {/* Connector line */}
                      <div className="absolute top-[26px] left-[10%] right-[10%] h-0.5 bg-border z-[1]"></div>
                      
                      {[
                        { num: 1, label: 'Triage', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : (selectedIncident.status === 'TRIGGERED' || selectedIncident.status === 'QUEUED') ? 'active' : 'completed' },
                        { num: 2, label: 'Approval', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : (selectedIncident.status === 'TRIGGERED' || selectedIncident.status === 'QUEUED') ? 'inactive' : selectedIncident.status === 'AWAITING_APPROVAL' ? 'active' : 'completed' },
                        { num: 3, label: 'Fixer', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : (selectedIncident.status === 'TRIGGERED' || selectedIncident.status === 'QUEUED' || selectedIncident.status === 'AWAITING_APPROVAL') ? 'inactive' : selectedIncident.status === 'FIXING' ? 'active' : 'completed' },
                        { num: 4, label: 'Memory', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : 'inactive' }
                      ].map(step => {
                        const state = step.getState();
                        const dotClass = state === 'completed' 
                          ? 'bg-success-glow border-success text-success shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                          : state === 'active' 
                          ? 'bg-[rgba(192,132,252,0.15)] border-[#c084fc] text-[#c084fc] shadow-[0_0_10px_rgba(192,132,252,0.3)] animate-pulse-glow' 
                          : 'bg-bg-tertiary border-border text-text-muted';
                        const labelClass = state === 'completed' ? 'text-text-primary' : state === 'active' ? 'text-[#c084fc]' : 'text-text-muted';
                        return (
                          <div key={step.num} className="flex flex-col items-center flex-1 relative z-10 min-w-[70px]">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold transition-all duration-300 ${dotClass}`}>
                              {step.num}
                            </div>
                            <div className={`text-[10px] font-bold mt-1.5 uppercase tracking-wide text-center ${labelClass}`}>{step.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Incident Metadata Details */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase text-text-muted tracking-wide">Incident Execution Metadata</span>
                    <div className="bg-bg-primary border border-border px-4 py-3 rounded-md grid grid-cols-2 gap-3 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase text-text-muted">Remediation Status</span>
                        <span className="text-text-primary font-semibold">{selectedIncident.status}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase text-text-muted">LLM Model Target</span>
                        <span className="text-text-primary font-semibold">Gemini 2.5 Flash</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase text-text-muted">Error Category</span>
                        <span className="text-text-primary font-semibold">{selectedIncident.category || 'PENDING'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold uppercase text-text-muted">Ingested At</span>
                        <span className="text-text-primary font-semibold">{new Date(selectedIncident.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase text-text-muted tracking-wide">Normalized Error Signature</span>
                    <pre className="bg-bg-tertiary border border-border rounded-md p-3 font-mono text-xs text-danger m-0 whitespace-pre-wrap break-all">
                      {selectedIncident.error_signature}
                    </pre>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold uppercase text-text-muted tracking-wide">Incident Remediation Timeline</span>
                    <div className="flex flex-col gap-5 relative pl-5">
                      {/* Timeline line */}
                      <div className="absolute left-[5px] top-1.5 bottom-1.5 w-0.5 bg-border"></div>
                      
                      <div className="flex gap-4 text-left relative">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success bg-bg-secondary rounded-full absolute -left-[21px] top-1 z-5" />
                        <div>
                          <h5 className="text-[13px] font-semibold m-0 mb-0.5">Alert Ingested</h5>
                          <p className="text-[11px] text-text-secondary m-0">Received webhook trigger at {new Date(selectedIncident.created_at).toLocaleString()}</p>
                        </div>
                      </div>

                      {selectedIncident.triage && (
                        <div className="flex gap-4 text-left relative">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success bg-bg-secondary rounded-full absolute -left-[21px] top-1 z-5" />
                          <div>
                            <h5 className="text-[13px] font-semibold m-0 mb-0.5">Triage Completed</h5>
                            <p className="text-[11px] text-text-secondary m-0">LLM classified alert. Error Category: <strong className="text-text-primary">{selectedIncident.category}</strong></p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 text-left relative">
                        {selectedIncident.status !== 'TRIGGERED' 
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-success bg-bg-secondary rounded-full absolute -left-[21px] top-1 z-5" />
                          : <Activity className="w-3.5 h-3.5 text-accent bg-bg-secondary rounded-full absolute -left-[21px] top-1 z-5 animate-spin-slow" />
                        }
                        <div>
                          <h5 className="text-[13px] font-semibold m-0 mb-0.5">Discord approval requested</h5>
                          <p className="text-[11px] text-text-secondary m-0">Bot card message ID: <span className="font-mono text-xs">{selectedIncident.discord_message_id || 'Awaiting message delivery...'}</span></p>
                        </div>
                      </div>

                      {selectedIncident.status === 'FIXING' && (
                        <div className="flex gap-4 text-left relative">
                          <Activity className="w-3.5 h-3.5 text-accent bg-bg-secondary rounded-full absolute -left-[21px] top-1 z-5 animate-spin-slow" />
                          <div>
                            <h5 className="text-[13px] font-semibold m-0 mb-0.5">Remediation War-Room Active</h5>
                            <p className="text-[11px] text-text-secondary m-0">Analyzing candidate repositories and writing pull request patch...</p>
                          </div>
                        </div>
                      )}

                      {selectedIncident.status === 'CLOSED_AND_LEARNED' && (
                        <div className="flex gap-4 text-left relative">
                          <CheckCircle2 className="w-3.5 h-3.5 text-success bg-bg-secondary rounded-full absolute -left-[21px] top-1 z-5" />
                          <div>
                            <h5 className="text-[13px] font-semibold m-0 mb-0.5">Remediation complete</h5>
                            <p className="text-[11px] text-text-secondary m-0">GitHub PR created. Stored details into Pinecone namespaces.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedIncident.root_cause && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase text-text-muted tracking-wide">Root Cause Analysis</span>
                      <p className="text-text-secondary text-sm leading-relaxed bg-bg-secondary p-4 rounded-md border border-border">
                        {selectedIncident.root_cause}
                      </p>
                    </div>
                  )}

                  {selectedIncident.postmortem && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase text-text-muted tracking-wide">Remediation Diffs & Postmortem</span>
                      <pre className="bg-bg-tertiary border border-border rounded-md p-3.5 font-mono text-[11px] text-[#34d399] m-0 whitespace-pre-wrap break-all overflow-x-auto max-h-[200px]">
                        {selectedIncident.postmortem}
                      </pre>
                    </div>
                  )}

                  {selectedIncident.pr_url && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase text-text-muted tracking-wide">Remediation PR Target</span>
                      <a 
                        href={selectedIncident.pr_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-[#24292f] text-white border-none rounded-md p-3 text-[13px] font-semibold no-underline transition-colors duration-200 hover:bg-[#1b1f23]"
                      >
                        <GitBranch className="w-[18px] h-[18px]" /> View Opened Pull Request <ExternalLink className="w-3.5 h-3.5" />
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

export default App;
