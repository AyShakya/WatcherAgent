import { Cpu } from 'lucide-react';
import ProjectCard from './ProjectCard';

export default function ProjectsList({
  projects,
  loadingProjects,
  handleOpenCreateModal,
  handleOpenEditModal,
  handleDeleteProject,
  handleCopyWebhook,
  copiedStates,
  handleTriggerTestIncident,
  API_BASE,
  projectPage,
  setProjectPage,
  PROJECTS_PER_PAGE
}) {
  // Paginated Projects
  const totalProjectPages = Math.ceil(projects.length / PROJECTS_PER_PAGE) || 1;
  const clampedProjectPage = Math.min(projectPage, totalProjectPages);
  const currentProjects = projects.slice((clampedProjectPage - 1) * PROJECTS_PER_PAGE, clampedProjectPage * PROJECTS_PER_PAGE);

  return (
    <div className="col-span-1 lg:col-span-7 bg-surface-container-low border border-warm-gray/20 rounded-xl flex flex-col overflow-hidden h-[520px] lg:h-[680px] shadow-xs">
      <div className="px-6 py-[18px] border-b border-warm-gray/10 text-left bg-surface-container-low flex justify-between items-center shrink-0">
        <h2 className="font-display text-base font-semibold m-0 text-ink-black">Configured Webhooks & Repositories</h2>
      </div>
      
      {/* Background reloading indicator bar */}
      {loadingProjects && projects.length > 0 ? (
        <div className="h-[2px] w-full bg-primary/10 overflow-hidden relative shrink-0">
          <div className="h-full bg-primary absolute rounded-full animate-loading-slide"></div>
        </div>
      ) : (
        <div className="h-[2px] w-full bg-transparent shrink-0"></div>
      )}
      
      {loadingProjects && projects.length === 0 ? (
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 min-h-0">
          <div className="h-[140px] animate-skeleton rounded-lg shrink-0" />
          <div className="h-[140px] animate-skeleton rounded-lg shrink-0" style={{ animationDelay: '0.2s' }} />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-0">
          <div className="w-20 h-20 mb-6 rounded-full bg-paper-surface flex items-center justify-center text-warm-gray border border-warm-gray/10 shrink-0">
            <Cpu className="w-8 h-8" />
          </div>
          <h3 className="font-display text-lg text-ink-black mb-2">No configured projects</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed max-w-sm mb-6">Connect your GitHub, GitLab, or custom webhook endpoints to start monitoring infrastructure events.</p>
          <button 
            type="button"
            className="px-6 py-2.5 bg-primary text-on-primary font-semibold text-xs rounded-lg shadow-sm hover:opacity-90 transition-all duration-150 active:scale-95 shrink-0"
            onClick={handleOpenCreateModal}
          >
            Onboard Project
          </button>
        </div>
      ) : (
        <>
          <div className={`flex-1 overflow-y-auto p-6 flex flex-col gap-4 min-h-0 transition-opacity duration-200 ${loadingProjects ? 'opacity-60 pointer-events-none' : ''}`}>
            {currentProjects.map(project => (
              <ProjectCard 
                key={project.id}
                project={project}
                handleOpenEditModal={handleOpenEditModal}
                handleDeleteProject={handleDeleteProject}
                handleCopyWebhook={handleCopyWebhook}
                copiedStates={copiedStates}
                handleTriggerTestIncident={handleTriggerTestIncident}
                API_BASE={API_BASE}
              />
            ))}
          </div>
          {totalProjectPages > 1 && (
            <div className="px-6 py-4 border-t border-warm-gray/10 flex justify-between items-center bg-surface-container-low shrink-0 select-none rounded-b-xl">
              <span className="text-xs text-on-surface-variant">
                Showing <strong className="text-ink-black">{(clampedProjectPage - 1) * PROJECTS_PER_PAGE + 1}-{Math.min(clampedProjectPage * PROJECTS_PER_PAGE, projects.length)}</strong> of <strong className="text-ink-black">{projects.length}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProjectPage(p => Math.max(1, p - 1))}
                  disabled={clampedProjectPage === 1}
                  className="px-3 py-1.5 border border-warm-gray/30 rounded-lg text-xs font-semibold bg-transparent text-on-surface hover:bg-paper-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setProjectPage(p => Math.min(totalProjectPages, p + 1))}
                  disabled={clampedProjectPage === totalProjectPages}
                  className="px-3 py-1.5 border border-warm-gray/30 rounded-lg text-xs font-semibold bg-transparent text-on-surface hover:bg-paper-surface disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
