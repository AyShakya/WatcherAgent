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
import './App.css';

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
      case 'P1': return 'badge-danger';
      case 'P2': return 'badge-warning';
      default: return 'badge-success';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'TRIGGERED': return 'status-triggered';
      case 'AWAITING_APPROVAL': return 'status-awaiting';
      case 'FIXING': return 'status-fixing';
      case 'CLOSED_AND_LEARNED': return 'status-success';
      case 'MUTED': return 'status-muted';
      default: return 'status-failed';
    }
  };

  return (
    <div className="app-container">
      
      {/* 1. LANDING PAGE VIEW */}
      {view === 'LANDING' && (
        <div className="landing-view">
          <div className="glow-bg" style={{ top: '5%', left: '5%' }}></div>
          <div className="glow-bg" style={{ bottom: '15%', right: '10%' }}></div>
          
          <header className="landing-header">
            <div className="logo-section">
              <Eye className="logo-icon" />
              <span className="logo-text">WatcherAgent</span>
            </div>
            <div className="nav-buttons">
              <button className="btn-secondary" onClick={() => setView('SIGN_IN')}>Sign In</button>
              <button className="btn-primary" onClick={() => setView('SIGN_UP')}>Get Started</button>
            </div>
          </header>

          <main className="landing-hero animate-fade">
            <div className="badge-platform">
              <span className="dot"></span>
              <span className="badge-title">AI Incident Response Platform</span>
            </div>
            <h1>
              Autonomously Triage, notify & <br />
              <span className="highlight-text">Resolve Production Incidents</span>
            </h1>
            <p className="hero-desc">
              Transform WatcherAgent from a single-project pipeline into a multi-repository management system. Connect alert systems, request on-call approvals via Discord, deploy automated fixes via GitHub PRs, and retain vector knowledge isolation.
            </p>
            <div className="hero-actions">
              <button className="btn-hero-primary" onClick={() => setView('SIGN_UP')}>
                Initialize Account <ArrowRight className="btn-arrow" />
              </button>
              <button className="btn-hero-secondary" onClick={() => window.open('https://github.com', '_blank')}>
                <GitBranch className="btn-icon" /> View Repository
              </button>
            </div>

            {/* Pipeline Step Visualizer */}
            <div className="pipeline-visualizer">
              <h3>The 5-Node Autonomous Remediation Pipeline</h3>
              <div className="pipeline-steps">
                <div className="step-card">
                  <div className="step-num">01</div>
                  <h4>Triage</h4>
                  <p>LLM categorizes severity, error footprint and determines root files.</p>
                </div>
                <div className="step-card">
                  <div className="step-num">02</div>
                  <h4>Runbook RAG</h4>
                  <p>Matches error signature against Pinecone namespace to reuse past solutions.</p>
                </div>
                <div className="step-card">
                  <div className="step-num">03</div>
                  <h4>HITL Approval</h4>
                  <p>Sends interactive cards with approval actions to on-call Discord.</p>
                </div>
                <div className="step-card">
                  <div className="step-num">04</div>
                  <h4>Fixer War-Room</h4>
                  <p>Audits code context, resolves imports, and opens a GitHub Pull Request.</p>
                </div>
                <div className="step-card">
                  <div className="step-num">05</div>
                  <h4>Narrator Loop</h4>
                  <p>Saves solution reasoning as vector metadata for instant memory recall.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* 2. SIGN IN VIEW */}
      {view === 'SIGN_IN' && (
        <div className="auth-view animate-fade">
          <div className="glow-bg"></div>
          <div className="auth-card">
            <div className="auth-header">
              <Eye className="auth-logo" />
              <h2>Welcome Back</h2>
              <p>Log in to access your WatcherAgent console.</p>
            </div>
            
            {authError && <div className="auth-alert">{authError}</div>}
            
            <form onSubmit={(e) => handleAuthSubmit(e, 'SIGN_IN')} className="auth-form">
              <div className="form-group">
                <label><Mail className="field-icon" /> Email Address</label>
                <input 
                  type="email" 
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)} 
                  placeholder="name@company.com" 
                  required 
                />
              </div>
              <div className="form-group">
                <label><Lock className="field-icon" /> Password</label>
                <input 
                  type="password" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              <button type="submit" className="btn-auth" disabled={authLoading}>
                {authLoading ? 'Signing In...' : 'Access Dashboard'}
              </button>
            </form>
            <div className="auth-footer">
              Don't have an account? <span onClick={() => { setView('SIGN_UP'); setAuthError(''); }}>Sign Up</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SIGN UP VIEW */}
      {view === 'SIGN_UP' && (
        <div className="auth-view animate-fade">
          <div className="glow-bg"></div>
          <div className="auth-card">
            <div className="auth-header">
              <Eye className="auth-logo" />
              <h2>Create Platform Account</h2>
              <p>No credentials required for initial onboarding.</p>
            </div>

            {authError && <div className="auth-alert">{authError}</div>}

            <form onSubmit={(e) => handleAuthSubmit(e, 'SIGN_UP')} className="auth-form">
              <div className="form-group">
                <label><User className="field-icon" /> Full Name</label>
                <input 
                  type="text" 
                  value={authName} 
                  onChange={(e) => setAuthName(e.target.value)} 
                  placeholder="Ayush Shakya" 
                  required 
                />
              </div>
              <div className="form-group">
                <label><Mail className="field-icon" /> Email Address</label>
                <input 
                  type="email" 
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)} 
                  placeholder="name@company.com" 
                  required 
                />
              </div>
              <div className="form-group">
                <label><Lock className="field-icon" /> Password</label>
                <input 
                  type="password" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                  placeholder="At least 6 characters" 
                  required 
                />
              </div>
              <button type="submit" className="btn-auth" disabled={authLoading}>
                {authLoading ? 'Creating Account...' : 'Initialize Onboarding'}
              </button>
            </form>
            <div className="auth-footer">
              Already have an account? <span onClick={() => { setView('SIGN_IN'); setAuthError(''); }}>Log In</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. DASHBOARD VIEW */}
      {view === 'DASHBOARD' && (
        <div className="dashboard-layout animate-fade">
          
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-brand">
              <Eye className="sidebar-brand-icon" />
              <div>
                <span className="brand-name">Watcher</span>
                <span className="brand-sub">Platform Core</span>
              </div>
            </div>
            
            <div className="user-profile">
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || 'User Profile'}</span>
                <span className="user-email">{user?.email}</span>
              </div>
            </div>

            <nav className="sidebar-nav">
              <div className="nav-heading">MANAGEMENT</div>
              <div className="nav-item active"><Activity className="nav-icon" /> Console Dashboard</div>
              <div className="nav-item" onClick={() => setShowProjectModal(true)}><Plus className="nav-icon" /> Create Project</div>
            </nav>

            <div className="sidebar-footer">
              <button className="btn-logout" onClick={handleLogout}>
                <LogOut className="btn-logout-icon" /> Log Out
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="main-content">
            <header className="main-header">
              <div className="header-title">
                <h1>Platform Console</h1>
                <p>Monitor multi-project alerts, manage BullMQ jobs, and watch active resolutions.</p>
              </div>
              <div className="header-actions">
                <button className="btn-refresh" onClick={fetchDashboardData}>
                  <RefreshCw className="btn-refresh-icon" /> Refresh Console
                </button>
                <button className="btn-new-project" onClick={() => setShowProjectModal(true)}>
                  <Plus className="btn-icon" /> Add Project
                </button>
              </div>
            </header>

            {/* Quick Metrics Grid */}
            <section className="metrics-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Active Projects</span>
                  <Cpu className="metric-icon" />
                </div>
                <div className="metric-val">{projects.length}</div>
                <div className="metric-sub">Configured environments</div>
              </div>
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Total Alert Volume</span>
                  <Activity className="metric-icon text-warning" />
                </div>
                <div className="metric-val">{incidents.length}</div>
                <div className="metric-sub">Remediated via pipeline</div>
              </div>
              <div className="metric-card">
                <div className="metric-header">
                  <span className="metric-label">Awaiting approval</span>
                  <AlertTriangle className="metric-icon text-danger" />
                </div>
                <div className="metric-val">
                  {incidents.filter(i => i.status === 'AWAITING_APPROVAL').length}
                </div>
                <div className="metric-sub">HITL Slack / Discord cards</div>
              </div>
            </section>

            {/* Content Layout Split */}
            <div className="dashboard-grid">
              
              {/* Left Column: Projects List */}
              <div className="dashboard-column projects-section">
                <div className="column-header">
                  <h2>Configured Webhooks & Repositories</h2>
                </div>
                
                {loadingProjects && projects.length === 0 ? (
                  <div className="loading-container">Loading configured projects...</div>
                ) : projects.length === 0 ? (
                  <div className="empty-state">
                    <h3>No configured projects</h3>
                    <p>Onboard your first project to generate a secure webhook integration endpoint.</p>
                    <button className="btn-primary" onClick={() => setShowProjectModal(true)}>Onboard Project</button>
                  </div>
                ) : (
                  <div className="project-list">
                    {projects.map(project => (
                      <div key={project.id} className="project-card">
                        <div className="project-card-header">
                          <div>
                            <h3>{project.name}</h3>
                            <div className="repo-slug">
                              <GitBranch className="repo-icon" />
                              <span>{project.github_owner}/{project.github_repo}</span>
                            </div>
                          </div>
                          <button 
                            className="btn-trash" 
                            title="Delete Project" 
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="trash-icon" />
                          </button>
                        </div>
                        
                        {/* Webhook Configuration panel */}
                        <div className="webhook-box">
                          <div className="webhook-header">
                            <span className="webhook-title">Secure Ingest Webhook</span>
                            <span className="webhook-badge">One per Project</span>
                          </div>
                          <div className="webhook-url-wrapper">
                            <code className="webhook-url-text">
                              {`${API_BASE}/webhook/${project.webhook_secret}`}
                            </code>
                            <button 
                              className="btn-copy" 
                              onClick={() => handleCopyWebhook(project.webhook_secret, project.id)}
                              title="Copy URL"
                            >
                              {copiedStates[project.id] ? <Check className="text-success w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="webhook-actions mt-3">
                            <button 
                              className="btn-trigger-test"
                              onClick={() => handleTriggerTestIncident(project.webhook_secret, project.name)}
                            >
                              <Play className="btn-play-icon" /> Fire Test Alert (Ingestion Queue)
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Live Incident Tracking */}
              <div className="dashboard-column incidents-section">
                <div className="column-header">
                  <h2>Active Incident Remediation logs</h2>
                </div>

                {loadingIncidents && incidents.length === 0 ? (
                  <div className="loading-container">Loading live logs...</div>
                ) : incidents.length === 0 ? (
                  <div className="empty-state">
                    <h3>No incidents logged yet</h3>
                    <p>Trigger a test alert on your configured project webhook to watch the AI worker run runs.</p>
                  </div>
                ) : (
                  <div className="incident-table-wrapper">
                    <table className="incident-table">
                      <thead>
                        <tr>
                          <th>Severity</th>
                          <th>Service</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Logged At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incidents.map(inc => (
                          <tr 
                            key={inc.id} 
                            onClick={() => setSelectedIncident(inc)}
                            className="incident-row cursor-pointer"
                          >
                            <td>
                              <span className={`badge ${getSeverityBadgeClass(inc.severity)}`}>
                                {inc.severity}
                              </span>
                            </td>
                            <td className="font-semibold text-primary truncate max-w-[120px]">{inc.raw_payload?.service || 'service'}</td>
                            <td><span className="category-text">{inc.category}</span></td>
                            <td>
                              <span className={`status-pill ${getStatusBadgeClass(inc.status)}`}>
                                {inc.status}
                              </span>
                            </td>
                            <td className="text-xs text-muted">
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
            <div className="modal-overlay">
              <div className="modal-content animate-fade">
                <div className="modal-header">
                  <h2>Onboard New Project</h2>
                  <button className="btn-close" onClick={() => { setShowProjectModal(false); setProjFormError(''); }}>&times;</button>
                </div>
                {projFormError && <div className="modal-alert">{projFormError}</div>}
                
                <form onSubmit={handleCreateProject} className="modal-form">
                  <div className="form-section-title">General Info</div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Project / Service Name</label>
                      <input 
                        type="text" 
                        value={projName} 
                        onChange={(e) => setProjName(e.target.value)} 
                        placeholder="e.g. Payment Gateway Service" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-section-title">Git & Repo Details</div>
                  <div className="form-row split">
                    <div className="form-group">
                      <label>GitHub Repository Owner</label>
                      <input 
                        type="text" 
                        value={projGithubOwner} 
                        onChange={(e) => setProjGithubOwner(e.target.value)} 
                        placeholder="e.g. ayush-shakya" 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>GitHub Repository Name</label>
                      <input 
                        type="text" 
                        value={projGithubRepo} 
                        onChange={(e) => setProjGithubRepo(e.target.value)} 
                        placeholder="e.g. core-payments-api" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>GitHub PAT Token (Contents + PR scopes)</label>
                      <input 
                        type="password" 
                        value={projGithubToken} 
                        onChange={(e) => setProjGithubToken(e.target.value)} 
                        placeholder="ghp_••••••••••••••••••••" 
                        required 
                      />
                    </div>
                  </div>

                  <div className="form-section-title">Integrations & Knowledge Base</div>
                  <div className="form-row split">
                    <div className="form-group">
                      <label>Discord Alert Channel ID</label>
                      <input 
                        type="text" 
                        value={projDiscordChannel} 
                        onChange={(e) => setProjDiscordChannel(e.target.value)} 
                        placeholder="e.g. 119827364501" 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Pinecone Namespace Segment</label>
                      <input 
                        type="text" 
                        value={projPineconeNamespace} 
                        onChange={(e) => setProjPineconeNamespace(e.target.value)} 
                        placeholder="e.g. payments-ns" 
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-row split">
                    <div className="form-group">
                      <label>OpenRouter LLM Key</label>
                      <input 
                        type="password" 
                        value={projOpenRouterKey} 
                        onChange={(e) => setProjOpenRouterKey(e.target.value)} 
                        placeholder="sk-or-v1-••••••••••••••••" 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Description / Custom Runbook Context (Optional)</label>
                      <input 
                        type="text" 
                        value={projDesc} 
                        onChange={(e) => setProjDesc(e.target.value)} 
                        placeholder="Remediation preferences..." 
                      />
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button 
                      type="button" 
                      className="btn-modal-cancel" 
                      onClick={() => { setShowProjectModal(false); setProjFormError(''); }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-modal-submit" disabled={projFormLoading}>
                      {projFormLoading ? 'Configuring Project...' : 'Activate Project Webhook'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* INCIDENT DETAILS DRAWER */}
          {selectedIncident && (
            <div className="modal-overlay" onClick={() => setSelectedIncident(null)}>
              <div 
                className="modal-content incident-drawer animate-fade" 
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <div className="flex items-center gap-3">
                    <span className={`badge ${getSeverityBadgeClass(selectedIncident.severity)}`}>
                      {selectedIncident.severity}
                    </span>
                    <h2>Incident: {selectedIncident.id.slice(0, 8)}...</h2>
                  </div>
                  <button className="btn-close" onClick={() => setSelectedIncident(null)}>&times;</button>
                </div>
                
                <div className="drawer-body">
                  <div className="drawer-section">
                    <span className="drawer-section-label">Normalized Error Signature</span>
                    <pre className="error-signature-block">
                      {selectedIncident.error_signature}
                    </pre>
                  </div>

                  <div className="drawer-section">
                    <span className="drawer-section-label">Incident Remediation Timeline</span>
                    <div className="timeline-trail">
                      <div className="timeline-item done">
                        <CheckCircle2 className="timeline-icon" />
                        <div>
                          <h5>Alert Ingested</h5>
                          <p>Received webhook trigger at {new Date(selectedIncident.created_at).toLocaleString()}</p>
                        </div>
                      </div>

                      {selectedIncident.triage && (
                        <div className="timeline-item done">
                          <CheckCircle2 className="timeline-icon" />
                          <div>
                            <h5>Triage Completed</h5>
                            <p>LLM classified alert. Error Category: <strong className="text-primary">{selectedIncident.category}</strong></p>
                          </div>
                        </div>
                      )}

                      <div className={`timeline-item ${selectedIncident.status !== 'TRIGGERED' ? 'done' : 'pending'}`}>
                        {selectedIncident.status !== 'TRIGGERED' ? <CheckCircle2 className="timeline-icon" /> : <Activity className="timeline-icon spinning" />}
                        <div>
                          <h5>Discord approval requested</h5>
                          <p>Bot card message ID: <span className="font-mono text-xs">{selectedIncident.discord_message_id || 'Awaiting message delivery...'}</span></p>
                        </div>
                      </div>

                      {selectedIncident.status === 'FIXING' && (
                        <div className="timeline-item pending">
                          <Activity className="timeline-icon spinning" />
                          <div>
                            <h5>Remediation War-Room Active</h5>
                            <p>Analyzing candidate repositories and writing pull request patch...</p>
                          </div>
                        </div>
                      )}

                      {selectedIncident.status === 'CLOSED_AND_LEARNED' && (
                        <div className="timeline-item done">
                          <CheckCircle2 className="timeline-icon" />
                          <div>
                            <h5>Remediation complete</h5>
                            <p>GitHub PR created. Stored details into Pinecone namespaces.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedIncident.root_cause && (
                    <div className="drawer-section">
                      <span className="drawer-section-label">Root Cause Analysis</span>
                      <p className="text-secondary text-sm leading-relaxed bg-[#0b0f19] p-4 rounded border border-border">
                        {selectedIncident.root_cause}
                      </p>
                    </div>
                  )}

                  {selectedIncident.postmortem && (
                    <div className="drawer-section">
                      <span className="drawer-section-label">Remediation Diffs & Postmortem</span>
                      <pre className="postmortem-diff-block">
                        {selectedIncident.postmortem}
                      </pre>
                    </div>
                  )}

                  {selectedIncident.pr_url && (
                    <div className="drawer-section">
                      <span className="drawer-section-label">Remediation PR Target</span>
                      <a 
                        href={selectedIncident.pr_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-pr-link"
                      >
                        <GitBranch className="btn-icon" /> View Opened Pull Request <ExternalLink className="w-3.5 h-3.5" />
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
