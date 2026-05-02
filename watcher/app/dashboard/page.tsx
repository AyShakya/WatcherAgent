'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "@/lib/auth-client";
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold group-hover:text-primary transition-colors">Watcher</span>
            </Link>
            <span className="ml-8 text-sm text-muted-foreground">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" className="text-sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here&apos;s what Watcher found.</p>
          </div>
          <Link href="/dashboard/instance">
            <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Instance
            </Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-medium">Instances Watched</span>
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">{userInstances.length}</div>
            <p className="text-xs text-muted-foreground mt-2">All synced</p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-medium">Bugs Found</span>
              <AlertCircle className="w-4 h-4 text-accent" />
            </div>
            <div className="text-3xl font-bold">{stats.totalBugs}</div>
            <p className="text-xs text-muted-foreground mt-2">From all instances</p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-medium">PRs Created</span>
              <GitPullRequest className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-3xl font-bold">{stats.totalPRs}</div>
            <p className="text-xs text-muted-foreground mt-2">To fix bugs</p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-medium">Bugs Fixed</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold">{stats.fixedBugs}</div>
            <p className="text-xs text-muted-foreground mt-2">Automatically resolved</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Line Chart - Bugs Over Time */}
          <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <h2 className="text-lg font-bold mb-4">Bugs Detected & Fixed</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bugsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d44" />
                <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid #2d2d44",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#ffffff" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bugs"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: "#6366f1", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="fixed"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ fill: "#0ea5e9", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Bug Types */}
          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <h2 className="text-lg font-bold mb-4">Bug Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bugTypesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {bugTypesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid #2d2d44",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#ffffff" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {bugTypesData.map((type) => (
                <div key={type.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: type.color }}
                    ></div>
                    <span>{type.name}</span>
                  </div>
                  <span className="text-muted-foreground">{type.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Repositories Section */}
        <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm mb-8">
          <h2 className="text-lg font-bold mb-4">Watched Instances ({userInstances.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Instance Name</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Bugs</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">PRs</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Fixed</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Created</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {loadingInstances ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-muted-foreground">Loading instances...</td>
                  </tr>
                ) : userInstances.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-muted-foreground">No instances found. Add one to get started.</td>
                  </tr>
                ) : (
                  userInstances.map((instance) => (
                    <tr key={instance.id} className="border-b border-border/50 hover:bg-muted/30 transition">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{instance.name}</div>
                          <div className="text-xs text-muted-foreground">{instance.id}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-accent" />
                          0
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <GitPullRequest className="w-4 h-4 text-secondary" />
                          0
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          0
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{new Date(instance.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-muted-foreground hover:text-foreground transition">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent PRs Section */}
        <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
          <h2 className="text-lg font-bold mb-4">Recent Pull Requests</h2>
          <div className="space-y-3">
            {recentPRs.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-primary/30 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <GitPullRequest className="w-4 h-4 text-secondary" />
                    <div>
                      <p className="font-medium">{pr.title}</p>
                      <p className="text-xs text-muted-foreground">{pr.repo}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{pr.created}</span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      pr.status === "merged"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {pr.status === "merged" ? "Merged" : "Pending"}
                  </span>
                  <button className="text-muted-foreground hover:text-foreground transition">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
