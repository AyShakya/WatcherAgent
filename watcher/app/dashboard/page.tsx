'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "@/lib/auth-client";
import { getInstances, getBugsData, getBugTypesData, getRecentPRs, getDashboardStats } from "@/actions/dashboard";
import {
  Eye,
  AlertCircle,
  GitPullRequest,
  CheckCircle,
  TrendingUp,
  Settings,
  LogOut,
  Github,
  Plus,
  MoreVertical,
  ExternalLink,
  Search,
  Bell,
  HelpCircle,
  LayoutDashboard,
  FolderOpen,
  Workflow,
  ScrollText,
  Bot
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const router = useRouter();
  const [userInstances, setUserInstances] = useState<any[]>([]);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const [bugsData, setBugsData] = useState<any[]>([]);
  const [bugTypesData, setBugTypesData] = useState<any[]>([]);
  const [recentPRs, setRecentPRs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalBugs: 0, totalPRs: 0, fixedBugs: 0 });
  const { data: session } = useSession();
  const userInitial = session?.user?.email ? session.user.email.charAt(0).toUpperCase() : "?";

  useEffect(() => {
    Promise.all([
      getInstances(),
      getBugsData(),
      getBugTypesData(),
      getRecentPRs(),
      getDashboardStats()
    ]).then(([instances, bugs, bugTypes, prs, dashboardStats]) => {
      setUserInstances(instances);
      setBugsData(bugs);
      setBugTypesData(bugTypes);
      setRecentPRs(prs);
      setStats(dashboardStats);
    }).catch(console.error).finally(() => setLoadingInstances(false));
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <div className="flex h-screen bg-[#f8f9ff] text-[#0b1c30] font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-[240px] bg-white border-r border-[#e5eeff] flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="p-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#131b2e] rounded-md flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-[16px] leading-tight text-[#0b1c30]">Watcher</div>
                <div className="text-[10px] text-[#76777d] font-bold tracking-wider mt-0.5 uppercase">AI Agent Active</div>
              </div>
            </Link>
          </div>
          
          <nav className="px-4 py-2 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-[#f8f9ff] text-[#0b1c30] font-medium text-sm border-l-2 border-[#0b1c30]">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#45464d] hover:bg-[#f8f9ff] hover:text-[#0b1c30] font-medium text-sm transition-colors border-l-2 border-transparent">
              <FolderOpen className="w-4 h-4" />
              Projects
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#45464d] hover:bg-[#f8f9ff] hover:text-[#0b1c30] font-medium text-sm transition-colors border-l-2 border-transparent">
              <Workflow className="w-4 h-4" />
              Pipelines
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#45464d] hover:bg-[#f8f9ff] hover:text-[#0b1c30] font-medium text-sm transition-colors border-l-2 border-transparent">
              <ScrollText className="w-4 h-4" />
              Logs
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#45464d] hover:bg-[#f8f9ff] hover:text-[#0b1c30] font-medium text-sm transition-colors border-l-2 border-transparent">
              <Bot className="w-4 h-4" />
              Agents
            </Link>
          </nav>
        </div>

        <div className="p-4 mb-4">
          <Link href="/dashboard/instance">
            <button className="w-full py-2.5 bg-[#131b2e] hover:bg-[#0b1c30] text-white text-xs font-bold tracking-widest uppercase rounded-md transition-colors flex items-center justify-center cursor-pointer">
              New Pipeline
            </button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="w-full mt-4 py-2.5 bg-[#131b2e] hover:bg-[#0b1c30] text-white text-xs font-bold tracking-widest uppercase rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-[#e5eeff] rounded-lg shadow-[0px_4px_20px_rgba(11,28,48,0.08)] max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-[#0b1c30] text-lg font-bold">Are you sure you want to log out?</DialogTitle>
                <DialogDescription className="text-[#45464d] text-sm mt-1">
                  You will be redirected to the sign-in page and will need to authenticate again to access your dashboard.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 mt-6">
                <DialogTrigger asChild>
                  <button className="px-4 py-2 rounded-md border border-[#c6c6cd] text-[#45464d] text-sm font-medium hover:bg-[#f8f9ff] transition-colors cursor-pointer">
                    Cancel
                  </button>
                </DialogTrigger>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-md bg-[#131b2e] hover:bg-[#0b1c30] text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-[72px] bg-white border-b border-[#e5eeff] flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-3 font-bold text-lg md:hidden">
              <div className="w-8 h-8 bg-[#131b2e] rounded-md flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              Watcher
            </div>
            
            <div className="hidden md:flex relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]" />
              <input 
                type="text" 
                placeholder="Search systems..." 
                className="w-full bg-[#f8f9ff] border-none rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#c6c6cd] text-[#0b1c30] placeholder-[#76777d]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-5 text-[#45464d]">
            <button className="hover:text-[#0b1c30] transition-colors"><Bell className="w-5 h-5" /></button>
            <button className="hover:text-[#0b1c30] transition-colors"><HelpCircle className="w-5 h-5" /></button>
            <button className="hover:text-[#0b1c30] transition-colors"><Settings className="w-5 h-5" /></button>
            <div className="w-8 h-8 rounded-full bg-[#131b2e] flex items-center justify-center ml-2 border-2 border-white shadow-sm">
              <span className="text-white text-xs font-bold">{userInitial}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1200px] mx-auto">
            
            {/* Page Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-[30px] font-semibold tracking-tight text-[#0b1c30] mb-1">System Overview</h1>
                <p className="text-[#45464d] text-[16px]">Real-time intelligence and autonomous agent monitoring.</p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#eff4ff] text-[#0b1c30] rounded-full border border-[#dce9ff]">
                <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                <span className="text-[10px] font-bold tracking-widest uppercase">AI Agent: Optimized</span>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              
              {/* Card 1 */}
              <div className="bg-white border border-[#e5eeff] rounded-md p-6 shadow-[0px_4px_20px_rgba(11,28,48,0.02)]">
                <div className="text-[10px] font-bold tracking-widest uppercase text-[#76777d] mb-4">Total Bugs Detected</div>
                <div className="flex items-end gap-3 mb-6">
                  <div className="text-5xl font-bold tracking-tight text-[#0b1c30]">{stats.totalBugs || "1,284"}</div>
                  <div className="text-[#10b981] font-semibold text-sm mb-1.5 flex items-center">↑ 12%</div>
                </div>
                <div className="h-[120px] bg-[#f8f9ff] rounded border border-[#e5eeff] overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bugsData.length ? bugsData : [{week:'1',bugs:10},{week:'2',bugs:15}]}>
                      <Line type="monotone" dataKey="bugs" stroke="#4b41e1" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-[#e5eeff] rounded-md p-6 shadow-[0px_4px_20px_rgba(11,28,48,0.02)]">
                <div className="text-[10px] font-bold tracking-widest uppercase text-[#76777d] mb-4">Autonomous PRs</div>
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5eeff" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4b41e1" strokeWidth="3" strokeDasharray="84, 100" />
                    </svg>
                    <div className="absolute text-sm font-bold text-[#0b1c30]">84%</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-[#0b1c30]">{stats.totalPRs || "432"}</div>
                    <div className="text-sm text-[#76777d]">Merged this month</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#45464d]">Security Fixes</span>
                      <span className="font-semibold text-[#0b1c30]">128</span>
                    </div>
                    <div className="w-full bg-[#e5eeff] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#4b41e1] h-full rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#45464d]">Refactoring</span>
                      <span className="font-semibold text-[#0b1c30]">304</span>
                    </div>
                    <div className="w-full bg-[#e5eeff] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#0b1c30] h-full rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 (Dark Navy) */}
              <div className="bg-[#131b2e] rounded-md p-6 text-white shadow-[0px_4px_20px_rgba(11,28,48,0.08)] flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-[#7c839b] mb-4">System Uptime</div>
                  <div className="text-5xl font-bold tracking-tight mb-2">99.98%</div>
                  <div className="text-sm text-[#7c839b]">Active across {userInstances.length || 14} nodes</div>
                </div>
                
                <div>
                  <div className="flex items-end gap-1.5 h-16 mb-3">
                    {[80, 100, 90, 100, 100, 70, 95, 30, 85, 100, 90].map((h, i) => (
                      <div key={i} className={`flex-1 rounded-sm ${h < 50 ? 'bg-[#ef4444]' : 'bg-[#10b981]'}`} style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                  <div className="text-[10px] text-[#7c839b] uppercase tracking-wider font-semibold">
                    Last incident: 42 minutes ago (Network Latency)
                  </div>
                </div>
              </div>

            </div>

            {/* Repositories Section */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-[24px] font-semibold tracking-tight text-[#0b1c30]">Connected Repositories</h2>
              <div className="flex gap-3">
                <Button variant="outline" className="border-[#c6c6cd] text-[#0b1c30] hover:bg-[#f8f9ff] h-9">
                  Export Report
                </Button>
                <Link href="/dashboard/instance">
                  <Button className="bg-[#131b2e] hover:bg-[#0b1c30] text-white h-9">
                    Add Repository
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white border border-[#e5eeff] rounded-md shadow-[0px_4px_20px_rgba(11,28,48,0.02)] mb-10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-[#e5eeff] bg-white">
                      <th className="py-4 px-6 text-[10px] font-bold tracking-widest uppercase text-[#76777d]">Repository Name</th>
                      <th className="py-4 px-6 text-[10px] font-bold tracking-widest uppercase text-[#76777d]">Health Status</th>
                      <th className="py-4 px-6 text-[10px] font-bold tracking-widest uppercase text-[#76777d]">AI Coverage</th>
                      <th className="py-4 px-6 text-[10px] font-bold tracking-widest uppercase text-[#76777d]">Last Sync</th>
                      <th className="py-4 px-6 text-[10px] font-bold tracking-widest uppercase text-[#76777d] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingInstances ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#76777d]">Loading repositories...</td>
                      </tr>
                    ) : userInstances.length === 0 ? (
                      <tr className="border-b border-[#e5eeff] hover:bg-[#f8f9ff] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-[#f8f9ff] flex items-center justify-center border border-[#e5eeff]">
                              <Github className="w-4 h-4 text-[#76777d]" />
                            </div>
                            <div>
                              <div className="font-semibold text-[#0b1c30]">watcher-core-engine</div>
                              <div className="text-xs text-[#76777d]">main branch · microservices</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#d1fae5] text-[#065f46]">Stable</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-[#e5eeff] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#4b41e1] h-full rounded-full" style={{ width: '92%' }}></div>
                            </div>
                            <span className="text-xs font-bold text-[#0b1c30]">92%</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[#45464d] text-xs">2 mins ago</td>
                        <td className="py-4 px-6 text-right">
                          <button className="text-[#76777d] hover:text-[#0b1c30]"><MoreVertical className="w-4 h-4 inline" /></button>
                        </td>
                      </tr>
                    ) : (
                      userInstances.map((instance, idx) => (
                        <tr key={instance.id} className="border-b border-[#e5eeff] last:border-0 hover:bg-[#f8f9ff] transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-[#f8f9ff] flex items-center justify-center border border-[#e5eeff]">
                                <FolderOpen className="w-4 h-4 text-[#76777d]" />
                              </div>
                              <div>
                                <div className="font-semibold text-[#0b1c30]">{instance.name}</div>
                                <div className="text-xs text-[#76777d]">ID: {instance.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#d1fae5] text-[#065f46]">Stable</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-[#e5eeff] h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#4b41e1] h-full rounded-full" style={{ width: `${80 - (idx * 10)}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-[#0b1c30]">{80 - (idx * 10)}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-[#45464d] text-xs">{new Date(instance.createdAt).toLocaleDateString()}</td>
                          <td className="py-4 px-6 text-right">
                            <button className="text-[#76777d] hover:text-[#0b1c30]"><MoreVertical className="w-4 h-4 inline" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Watcher Insights */}
              <div className="lg:col-span-2 bg-white border border-[#e5eeff] rounded-md shadow-[0px_4px_20px_rgba(11,28,48,0.02)] flex flex-col">
                <div className="p-6 border-b border-[#e5eeff] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 text-[#4b41e1]"><Eye /></div>
                    <h3 className="font-bold text-lg text-[#0b1c30]">Watcher Insights</h3>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#76777d]">Refreshed 10s ago</span>
                </div>
                
                <div className="p-6 space-y-4 flex-1">
                  <div className="flex gap-4">
                    <div className="w-1 bg-[#4b41e1] rounded-full shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-[#0b1c30] mb-1">Potential Memory Leak Detected</h4>
                      <p className="text-sm text-[#45464d] mb-3">
                        Watcher has identified an anomalous memory pattern in <code className="bg-[#f8f9ff] text-[#0b1c30] px-1.5 py-0.5 rounded border border-[#e5eeff] text-xs font-mono">watcher-core-engine/auth-service</code>. A fix has been drafted and is ready for review.
                      </p>
                      <a href="#" className="text-sm font-semibold text-[#4b41e1] hover:underline flex items-center gap-1">
                        View Drafted PR <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="h-px bg-[#e5eeff] w-full"></div>
                  
                  <div className="flex gap-4">
                    <div className="w-1 bg-[#e5eeff] rounded-full shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-[#0b1c30] mb-1">Unused Dependencies Cleanup</h4>
                      <p className="text-sm text-[#45464d]">
                        Agent 'Zephyr' found 14 redundant npm packages in the UI Kit. Removing these will reduce bundle size by 12%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agent Live Streams */}
              <div className="bg-[#0b1c30] rounded-md shadow-[0px_4px_20px_rgba(11,28,48,0.08)] flex flex-col overflow-hidden text-[#bec6e0] font-mono text-xs">
                <div className="p-4 border-b border-[#213145] flex items-center gap-2 text-white">
                  <Bot className="w-4 h-4" />
                  <h3 className="font-bold font-sans text-sm tracking-wide">Agent Live Streams</h3>
                </div>
                
                <div className="p-4 space-y-3 overflow-y-auto flex-1">
                  {recentPRs.slice(0, 5).map((pr, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-[#45464d] shrink-0">[{new Date().toISOString().substring(11, 19)}]</span>
                      <span className="text-[#10b981] font-bold shrink-0">AGENT/TITAN</span>
                      <span className="text-[#bec6e0]">Creating PR: {pr.title} in {pr.repo}...</span>
                    </div>
                  ))}
                  {recentPRs.length === 0 && (
                    <>
                      <div className="flex items-start gap-3">
                        <span className="text-[#45464d] shrink-0">[14:02:11]</span>
                        <span className="text-[#10b981] font-bold shrink-0">AGENT/ZEPHYR</span>
                        <span className="text-[#bec6e0]">Scanning watcher-ui-kit...</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-[#45464d] shrink-0">[14:02:15]</span>
                        <span className="text-[#10b981] font-bold shrink-0">AGENT/TITAN</span>
                        <span className="text-[#bec6e0]">Resolving vulnerability CVE-2024-33...</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-[#45464d] shrink-0">[14:02:18]</span>
                        <span className="text-[#4b41e1] font-bold shrink-0">CORE/ENGINE</span>
                        <span className="text-[#bec6e0]">Triggering autonomous CI pipeline #829</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-[#45464d] shrink-0">[14:02:22]</span>
                        <span className="text-[#10b981] font-bold shrink-0">AGENT/ZEPHYR</span>
                        <span className="text-[#bec6e0]">Analysis complete. 0 critical errors found.</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-[#45464d] shrink-0">[14:02:25]</span>
                        <span className="text-[#10b981] font-bold shrink-0">AGENT/TITAN</span>
                        <span className="text-[#bec6e0]">Pushing branch 'fix/security-patch-v4'...</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="p-3 border-t border-[#213145] bg-[#131b2e] flex items-center justify-between text-[10px] font-sans font-bold tracking-widest uppercase">
                  <span className="text-[#7c839b]">Agents Active: 4</span>
                  <span className="text-[#10b981]">All Systems Nominal</span>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}