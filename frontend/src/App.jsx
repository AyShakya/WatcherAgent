/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, react-hooks/immutability */
import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ConsoleDashboard from './components/ConsoleDashboard';
import DiscordSetupGuide from './components/DiscordSetupGuide';
import ProjectModal from './components/ProjectModal';
import IncidentDetailsDrawer from './components/IncidentDetailsDrawer';

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
  
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projGithubOwner, setProjGithubOwner] = useState('');
  const [projGithubRepo, setProjGithubRepo] = useState('');
  const [projGithubToken, setProjGithubToken] = useState('');
  const [projDiscordChannel, setProjDiscordChannel] = useState('');
  const [projDiscordBotToken, setProjDiscordBotToken] = useState('');
  const [projOpenRouterKey, setProjOpenRouterKey] = useState('');
  const [projFormError, setProjFormError] = useState('');
  const [projFormLoading, setProjFormLoading] = useState(false);

  // Selected Incident Detail Modal
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [copiedStates, setCopiedStates] = useState({}); // project.id -> boolean (for webhook secret copy feedback)
  const [guideOpen, setGuideOpen] = useState(true);
  
  // Discord bot integration setup states
  const [globalBotInfo, setGlobalBotInfo] = useState(null);
  const [loadingBotInfo, setLoadingBotInfo] = useState(false);

  // Pagination States
  const [projectPage, setProjectPage] = useState(1);
  const [incidentPage, setIncidentPage] = useState(1);
  const PROJECTS_PER_PAGE = 3;
  const INCIDENTS_PER_PAGE = 10;

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
  useEffect(() => {
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
    } catch {
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
      openrouter_key: projOpenRouterKey
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
      } else {
        setProjFormError(data.error || `Failed to ${editingProject ? 'update' : 'create'} project.`);
      }
    } catch {
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
    } catch {
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
        <LandingPage setView={setView} />
      )}

      {/* 2. SIGN IN VIEW */}
      {view === 'SIGN_IN' && (
        <SignIn 
          setView={setView}
          authEmail={authEmail}
          setAuthEmail={setAuthEmail}
          authPassword={authPassword}
          setAuthPassword={setAuthPassword}
          authError={authError}
          setAuthError={setAuthError}
          authLoading={authLoading}
          handleAuthSubmit={handleAuthSubmit}
        />
      )}

      {/* 3. SIGN UP VIEW */}
      {view === 'SIGN_UP' && (
        <SignUp 
          setView={setView}
          authName={authName}
          setAuthName={setAuthName}
          authEmail={authEmail}
          setAuthEmail={setAuthEmail}
          authPassword={authPassword}
          setAuthPassword={setAuthPassword}
          authError={authError}
          setAuthError={setAuthError}
          authLoading={authLoading}
          handleAuthSubmit={handleAuthSubmit}
        />
      )}

      {/* 4. DASHBOARD VIEW */}
      {view === 'DASHBOARD' && (
        <div className="flex h-screen w-full overflow-hidden animate-fade relative z-10">
          
          <Sidebar 
            user={user}
            dashboardTab={dashboardTab}
            setDashboardTab={setDashboardTab}
            mobileSidebarOpen={mobileSidebarOpen}
            setMobileSidebarOpen={setMobileSidebarOpen}
            handleOpenCreateModal={handleOpenCreateModal}
            handleLogout={handleLogout}
          />

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col overflow-y-auto lg:overflow-hidden relative">
            <Header 
              dashboardTab={dashboardTab}
              setMobileSidebarOpen={setMobileSidebarOpen}
              fetchDashboardData={fetchDashboardData}
              handleOpenCreateModal={handleOpenCreateModal}
            />

            {dashboardTab === 'CONSOLE' ? (
              <ConsoleDashboard 
                guideOpen={guideOpen}
                setGuideOpen={setGuideOpen}
                projects={projects}
                loadingProjects={loadingProjects}
                incidents={incidents}
                loadingIncidents={loadingIncidents}
                handleOpenCreateModal={handleOpenCreateModal}
                handleOpenEditModal={handleOpenEditModal}
                handleDeleteProject={handleDeleteProject}
                handleCopyWebhook={handleCopyWebhook}
                copiedStates={copiedStates}
                handleTriggerTestIncident={handleTriggerTestIncident}
                API_BASE={API_BASE}
                projectPage={projectPage}
                setProjectPage={setProjectPage}
                PROJECTS_PER_PAGE={PROJECTS_PER_PAGE}
                incidentPage={incidentPage}
                setIncidentPage={setIncidentPage}
                INCIDENTS_PER_PAGE={INCIDENTS_PER_PAGE}
                setSelectedIncident={setSelectedIncident}
                getSeverityBadgeClass={getSeverityBadgeClass}
                getStatusBadgeClass={getStatusBadgeClass}
              />
            ) : (
              <DiscordSetupGuide 
                globalBot={globalBotInfo} 
                loading={loadingBotInfo} 
              />
            )}
          </main>

          {/* PROJECT CREATION MODAL */}
          <ProjectModal 
            showProjectModal={showProjectModal}
            setShowProjectModal={setShowProjectModal}
            editingProject={editingProject}
            projName={projName}
            setProjName={setProjName}
            projDesc={projDesc}
            setProjDesc={setProjDesc}
            projGithubOwner={projGithubOwner}
            setProjGithubOwner={setProjGithubOwner}
            projGithubRepo={projGithubRepo}
            setProjGithubRepo={setProjGithubRepo}
            projGithubToken={projGithubToken}
            setProjGithubToken={setProjGithubToken}
            projDiscordChannel={projDiscordChannel}
            setProjDiscordChannel={setProjDiscordChannel}
            projDiscordBotToken={projDiscordBotToken}
            setProjDiscordBotToken={setProjDiscordBotToken}
            projOpenRouterKey={projOpenRouterKey}
            setProjOpenRouterKey={setProjOpenRouterKey}
            projFormError={projFormError}
            setProjFormError={setProjFormError}
            projFormLoading={projFormLoading}
            handleCreateProject={handleCreateProject}
          />

          {/* INCIDENT DETAILS DRAWER */}
          <IncidentDetailsDrawer 
            selectedIncident={selectedIncident}
            setSelectedIncident={setSelectedIncident}
            getSeverityBadgeClass={getSeverityBadgeClass}
            getStatusBadgeClass={getStatusBadgeClass}
          />

        </div>
      )}

    </div>
  );
}

export default App;
