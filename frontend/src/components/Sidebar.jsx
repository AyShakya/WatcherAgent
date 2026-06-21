import { Eye, Settings, Plus, LogOut, Activity, X } from 'lucide-react';

export default function Sidebar({
  user,
  dashboardTab,
  setDashboardTab,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  handleOpenCreateModal,
  handleLogout
}) {
  const sidebarNavItems = (
    <nav className="flex flex-col gap-1.5 flex-1">
      <div className="text-[10px] font-bold tracking-wider text-warm-gray mt-4 mb-2 ml-3 text-left">MANAGEMENT</div>
      <button 
        type="button"
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold cursor-pointer active:scale-95 duration-150 transition-all text-left w-full border-none bg-transparent ${
          dashboardTab === 'CONSOLE' 
            ? 'bg-paper-surface border border-warm-gray/20 text-primary' 
            : 'text-on-surface-variant hover:text-on-surface hover:bg-paper-surface/50'
        }`}
        onClick={() => {
          setDashboardTab('CONSOLE');
          setMobileSidebarOpen(false);
        }}
      >
        <Activity className={`w-4 h-4 ${dashboardTab === 'CONSOLE' ? 'animate-pulse' : ''}`} /> Console Dashboard
      </button>
      <button 
        type="button"
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold cursor-pointer active:scale-95 duration-150 transition-all text-left w-full border-none bg-transparent ${
          dashboardTab === 'SETUP' 
            ? 'bg-paper-surface border border-warm-gray/20 text-primary' 
            : 'text-on-surface-variant hover:text-on-surface hover:bg-paper-surface/50'
        }`}
        onClick={() => {
          setDashboardTab('SETUP');
          setMobileSidebarOpen(false);
        }}
      >
        <Settings className="w-4 h-4" /> Discord Bot Setup
      </button>
      <button 
        type="button"
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-semibold text-on-surface-variant hover:text-on-surface hover:bg-paper-surface/50 cursor-pointer active:scale-95 duration-150 transition-all text-left w-full border-none bg-transparent"
        onClick={() => {
          setMobileSidebarOpen(false);
          handleOpenCreateModal();
        }}
      >
        <Plus className="w-4 h-4" /> Create Project
      </button>
    </nav>
  );

  const profileCard = (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-warm-gray/20 mb-6">
      <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm select-none">
        {user?.name?.charAt(0).toUpperCase() || 'U'}
      </div>
      <div className="flex flex-col text-left min-w-0">
        <span className="text-[13px] font-semibold text-ink-black whitespace-nowrap overflow-hidden text-ellipsis">
          {user?.name || 'User Profile'}
        </span>
        <span className="text-[11px] text-on-surface-variant whitespace-nowrap overflow-hidden text-ellipsis">
          {user?.email}
        </span>
      </div>
    </div>
  );

  return (
    <>
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
                  <div className="text-left">
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
              
              {profileCard}
              {sidebarNavItems}
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
            <div className="text-left">
              <span className="font-display text-lg font-bold block text-ink-black leading-tight">Watcher Console</span>
              <span className="text-[10px] text-warm-gray font-semibold tracking-wider uppercase block">Incident Management</span>
            </div>
          </div>
          
          {profileCard}
          {sidebarNavItems}
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
    </>
  );
}
