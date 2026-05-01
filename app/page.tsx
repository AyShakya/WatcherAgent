import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, AlertCircle, GitPullRequest, CheckCircle, Zap, Shield, Github } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Watcher</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition">How it Works</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-sm">Dashboard</Button>
            </Link>
            <Button variant="ghost" className="text-sm">Sign In</Button>
            <Button className="bg-primary hover:bg-primary/90 text-white text-sm">Connect GitHub</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Gradient blur backgrounds */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-40"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl opacity-40"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/30 rounded-full mb-8">
            <Eye className="w-4 h-4 text-accent" />
            <span className="text-sm text-secondary">AI-powered code quality automation</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
            Never Miss a Bug
            <br />
            in Your Repos
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Watcher continuously monitors your GitHub repositories, detects errors with AI precision, and automatically creates pull requests with fixes. Code quality on autopilot.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg flex items-center gap-2">
              Connect with GitHub <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="border-border hover:bg-muted px-8 py-6 text-lg flex items-center gap-2">
              <Github className="w-5 h-5" />
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto pt-8 border-t border-border">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Repos Watched</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">1M+</div>
              <div className="text-sm text-muted-foreground">Bugs Fixed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Continuous Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">How Watcher Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to automated bug detection and fixing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition">
              <div className="text-4xl font-bold text-primary/30 mb-4">01</div>
              <Eye className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Watch</h3>
              <p className="text-muted-foreground text-sm">
                Connect your GitHub repos with one click. Watcher starts monitoring immediately.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-accent/50 transition">
              <div className="text-4xl font-bold text-accent/30 mb-4">02</div>
              <AlertCircle className="w-8 h-8 text-accent mb-4" />
              <h3 className="text-xl font-bold mb-3">Detect</h3>
              <p className="text-muted-foreground text-sm">
                AI analyzes code for bugs, vulnerabilities, and quality issues in real-time.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-secondary/50 transition">
              <div className="text-4xl font-bold text-secondary/30 mb-4">03</div>
              <Zap className="w-8 h-8 text-secondary mb-4" />
              <h3 className="text-xl font-bold mb-3">Fix</h3>
              <p className="text-muted-foreground text-sm">
                Intelligent solutions are generated and applied to fix the detected issues.
              </p>
            </div>

            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition">
              <div className="text-4xl font-bold text-primary/30 mb-4">04</div>
              <GitPullRequest className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">Review</h3>
              <p className="text-muted-foreground text-sm">
                Pull requests are created automatically for your team to review and merge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for automated code quality and security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">24/7 Monitoring</h3>
              <p className="text-muted-foreground">
                Continuously watches your repositories for errors, bugs, and code quality issues around the clock.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-accent/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Detection</h3>
              <p className="text-muted-foreground">
                AI-powered analysis catches null references, type errors, logic bugs, and security vulnerabilities instantly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-secondary/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Automatic Fixes</h3>
              <p className="text-muted-foreground">
                Generates intelligent solutions and applies fixes automatically with detailed explanations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                <GitPullRequest className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Auto Pull Requests</h3>
              <p className="text-muted-foreground">
                Creates well-formed PRs with test results, diffs, and context. Your team reviews and merges.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-accent/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Security First</h3>
              <p className="text-muted-foreground">
                Detects security vulnerabilities and creates PRs to fix them before they become issues.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:border-secondary/50 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center mb-4">
                <Github className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">GitHub Native</h3>
              <p className="text-muted-foreground">
                Deep GitHub integration with no additional setup. Works with your existing workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Perfect For</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Teams that care about code quality and want to ship faster
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-3">Open Source Projects</h3>
              <p className="text-muted-foreground mb-4">
                Maintain code quality and security across your open source repositories. Keep contributors happy with automated quality checks.
              </p>
              <div className="flex items-center gap-2 text-primary hover:text-accent transition cursor-pointer">
                <span className="font-semibold">Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="p-8 rounded-xl border border-border bg-gradient-to-br from-accent/10 to-secondary/10 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-3">Enterprise Teams</h3>
              <p className="text-muted-foreground mb-4">
                Ensure code quality standards across your organization. Reduce security vulnerabilities and technical debt automatically.
              </p>
              <div className="flex items-center gap-2 text-accent hover:text-primary transition cursor-pointer">
                <span className="font-semibold">Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="p-8 rounded-xl border border-border bg-gradient-to-br from-secondary/10 to-primary/10 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-3">Startups & Growth Teams</h3>
              <p className="text-muted-foreground mb-4">
                Ship faster with confidence. Let Watcher catch bugs before they reach production while your team focuses on features.
              </p>
              <div className="flex items-center gap-2 text-secondary hover:text-accent transition cursor-pointer">
                <span className="font-semibold">Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <div className="p-8 rounded-xl border border-border bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-3">Security-First Organizations</h3>
              <p className="text-muted-foreground mb-4">
                Get continuous vulnerability scanning and automated fixes. Never let security issues slip through to production.
              </p>
              <div className="flex items-center gap-2 text-primary hover:text-secondary transition cursor-pointer">
                <span className="font-semibold">Learn more</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-12">Trusted by Developers</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {['React', 'Vue', 'Next.js', 'Svelte', 'TypeScript', 'Open Source'].map((name) => (
              <div key={name} className="flex items-center justify-center">
                <div className="w-24 h-12 bg-muted/30 rounded-lg flex items-center justify-center border border-border hover:border-primary/30 transition">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-muted-foreground">{name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-40"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl opacity-40"></div>
          </div>

          <div className="relative">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Fix Bugs Automatically?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start watching your repos today. No credit card required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg w-full sm:w-auto flex items-center justify-center gap-2">
                Connect GitHub Now <Github className="w-5 h-5" />
              </Button>
              <Button variant="outline" className="border-border hover:bg-muted px-8 py-6 text-lg w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              First 5 repos are free. Always. No payment required.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">Watcher</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Automated code quality and bug detection for GitHub.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition">Docs</a></li>
                <li><a href="#" className="hover:text-foreground transition">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">GitHub</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">© 2026 Watcher. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 sm:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground transition text-sm">Twitter</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition text-sm">GitHub</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition text-sm">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
