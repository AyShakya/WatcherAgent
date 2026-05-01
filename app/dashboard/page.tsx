'use client';

import { Button } from "@/components/ui/button";
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

// Mock data for bugs detected over time
const bugsData = [
  { week: "Week 1", bugs: 12, fixed: 8 },
  { week: "Week 2", bugs: 19, fixed: 12 },
  { week: "Week 3", bugs: 15, fixed: 14 },
  { week: "Week 4", bugs: 25, fixed: 18 },
  { week: "Week 5", bugs: 22, fixed: 20 },
  { week: "Week 6", bugs: 28, fixed: 24 },
  { week: "Week 7", bugs: 20, fixed: 19 },
];

// Mock data for bug types
const bugTypesData = [
  { name: "Logic Errors", value: 35, color: "#6366f1" },
  { name: "Type Issues", value: 25, color: "#7c3aed" },
  { name: "Security", value: 20, color: "#0ea5e9" },
  { name: "Performance", value: 15, color: "#06b6d4" },
  { name: "Other", value: 5, color: "#0d9488" },
];

// Mock data for repositories
const repositories = [
  {
    id: 1,
    name: "nextjs-saas-starter",
    owner: "acme",
    bugs: 8,
    prs: 3,
    fixed: 5,
    status: "Active",
    lastScan: "2 hours ago",
  },
  {
    id: 2,
    name: "react-components",
    owner: "acme",
    bugs: 12,
    prs: 5,
    fixed: 8,
    status: "Active",
    lastScan: "30 minutes ago",
  },
  {
    id: 3,
    name: "typescript-utils",
    owner: "acme",
    bugs: 3,
    prs: 1,
    fixed: 3,
    status: "Active",
    lastScan: "1 hour ago",
  },
  {
    id: 4,
    name: "api-gateway",
    owner: "acme",
    bugs: 15,
    prs: 6,
    fixed: 10,
    status: "Active",
    lastScan: "45 minutes ago",
  },
];

// Mock data for recent PRs
const recentPRs = [
  {
    id: 1,
    title: "Fix: Handle null reference in user service",
    repo: "nextjs-saas-starter",
    status: "merged",
    created: "2 hours ago",
  },
  {
    id: 2,
    title: "Security: Update dependencies with vulnerabilities",
    repo: "react-components",
    status: "pending",
    created: "1 hour ago",
  },
  {
    id: 3,
    title: "Performance: Optimize database queries",
    repo: "api-gateway",
    status: "pending",
    created: "30 minutes ago",
  },
  {
    id: 4,
    title: "Fix: Resolve type error in authentication module",
    repo: "typescript-utils",
    status: "merged",
    created: "1 day ago",
  },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Watcher</span>
            <span className="ml-8 text-sm text-muted-foreground">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" className="text-sm">
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
          <Button className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Repository
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-medium">Repos Watched</span>
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-bold">4</div>
            <p className="text-xs text-muted-foreground mt-2">All synced</p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-medium">Bugs Found</span>
              <AlertCircle className="w-4 h-4 text-accent" />
            </div>
            <div className="text-3xl font-bold">53</div>
            <p className="text-xs text-muted-foreground mt-2">+12 this week</p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-medium">PRs Created</span>
              <GitPullRequest className="w-4 h-4 text-secondary" />
            </div>
            <div className="text-3xl font-bold">15</div>
            <p className="text-xs text-muted-foreground mt-2">11 merged</p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground font-medium">Bugs Fixed</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold">41</div>
            <p className="text-xs text-muted-foreground mt-2">77% of total</p>
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
          <h2 className="text-lg font-bold mb-4">Watched Repositories</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Repository</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Bugs</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">PRs</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Fixed</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Last Scan</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {repositories.map((repo) => (
                  <tr key={repo.id} className="border-b border-border/50 hover:bg-muted/30 transition">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium">{repo.name}</div>
                        <div className="text-xs text-muted-foreground">{repo.owner}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-accent" />
                        {repo.bugs}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <GitPullRequest className="w-4 h-4 text-secondary" />
                        {repo.prs}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {repo.fixed}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{repo.lastScan}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        {repo.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-muted-foreground hover:text-foreground transition">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
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
