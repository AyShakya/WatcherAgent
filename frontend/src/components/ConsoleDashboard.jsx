import QuickMetrics from './QuickMetrics';
import ProjectsList from './ProjectsList';
import IncidentsTable from './IncidentsTable';

export default function ConsoleDashboard({
  guideOpen,
  setGuideOpen,
  projects,
  loadingProjects,
  incidents,
  loadingIncidents,
  handleOpenCreateModal,
  handleOpenEditModal,
  handleDeleteProject,
  handleCopyWebhook,
  copiedStates,
  handleTriggerTestIncident,
  API_BASE,
  projectPage,
  setProjectPage,
  PROJECTS_PER_PAGE,
  incidentPage,
  setIncidentPage,
  INCIDENTS_PER_PAGE,
  setSelectedIncident,
  getSeverityBadgeClass,
  getStatusBadgeClass
}) {
  return (
    <>
      {/* Developer Guidance Banner */}
      <div className="mx-4 md:mx-8 mt-6 bg-primary-container border border-primary/20 rounded-xl p-8 text-left text-on-primary-container relative overflow-hidden shadow-sm shrink-0">
        <div className="flex justify-between items-center select-none">
          <div>
            <h3 className="font-display text-xl md:text-2xl font-bold text-ink-black mb-1">Watcher Platform Core</h3>
            <p className="text-xs text-on-primary-fixed-variant opacity-85 font-semibold">Interactive Quick Start & Pipeline Architecture Guide</p>
          </div>
          <button 
            type="button"
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
                <div key={step.title} className="bg-white/60 backdrop-blur-sm border border-primary/10 rounded-lg p-4 shadow-sm text-left">
                  <h4 className="m-0 mb-1 text-[13px] font-bold text-ink-black">{step.title}</h4>
                  <p className="m-0 text-xs text-on-surface-variant leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Metrics Grid */}
      <QuickMetrics 
        projectsCount={projects.length}
        incidentsCount={incidents.length}
        awaitingApprovalCount={incidents.filter(i => i.status === 'AWAITING_APPROVAL').length}
      />

      {/* Content Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 md:px-8 pb-8 mt-6 bg-transparent">
        
        {/* Left Column: Projects List */}
        <ProjectsList 
          projects={projects}
          loadingProjects={loadingProjects}
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
        />

        {/* Right Column: Live Incident Tracking */}
        <IncidentsTable 
          incidents={incidents}
          loadingIncidents={loadingIncidents}
          setSelectedIncident={setSelectedIncident}
          getSeverityBadgeClass={getSeverityBadgeClass}
          getStatusBadgeClass={getStatusBadgeClass}
          incidentPage={incidentPage}
          setIncidentPage={setIncidentPage}
          INCIDENTS_PER_PAGE={INCIDENTS_PER_PAGE}
        />

      </div>
    </>
  );
}
