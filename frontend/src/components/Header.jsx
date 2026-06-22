import { Menu, RefreshCw, Plus } from 'lucide-react';

export default function Header({
  dashboardTab,
  setMobileSidebarOpen,
  fetchDashboardData,
  handleOpenCreateModal,
  isRefreshing
}) {
  return (
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
            {dashboardTab === 'CONSOLE' ? 'Platform Console' : 
             dashboardTab === 'SETUP' ? 'Discord Bot Setup' :
             dashboardTab === 'GITHUB_SETUP' ? 'GitHub Repository Setup' :
             'Webhook Alert Integration'}
          </h1>
          <p className="text-[11px] md:text-xs text-on-surface-variant m-0 truncate hidden md:block">
            {dashboardTab === 'CONSOLE' ? 'Monitor multi-project alerts, manage BullMQ queues, and oversee resolutions.' : 
             dashboardTab === 'SETUP' ? 'Step-by-step documentation on how to configure and invite your Discord bot.' :
             dashboardTab === 'GITHUB_SETUP' ? 'Learn how to generate personal access tokens and link your repository.' :
             'Configure alert triggers for PagerDuty, Render, and custom VPS servers.'}
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 shrink-0">
        {dashboardTab === 'CONSOLE' && (
          <>
            <button 
              className="bg-transparent border border-warm-gray/30 text-on-surface rounded-lg p-2.5 md:px-4 md:py-2.5 text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-all duration-150 hover:bg-paper-surface/50 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={fetchDashboardData}
              title="Refresh Console"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
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
  );
}
