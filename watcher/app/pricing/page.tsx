import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Eye, Github } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for trying Watcher",
      price: "Free",
      period: "Forever",
      badge: "Popular",
      features: [
        "Up to 5 repositories",
        "Basic bug detection",
        "Weekly reports",
        "Community support",
        "Auto PR creation",
        "Public repositories only",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Professional",
      description: "For growing teams",
      price: "$29",
      period: "per month",
      badge: "Most Popular",
      features: [
        "Unlimited repositories",
        "Advanced bug detection",
        "Real-time notifications",
        "Priority email support",
        "Auto PR creation",
        "Private repositories",
        "Custom rules & filters",
        "Team collaboration",
        "Weekly analytics",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      price: "Custom",
      period: "per month",
      badge: null,
      features: [
        "Everything in Professional",
        "Unlimited everything",
        "24/7 phone & email support",
        "Custom integration",
        "SSO & advanced security",
        "Dedicated account manager",
        "SLA guarantee",
        "Custom bug detection models",
        "Audit logs & compliance",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes! You can change your plan at any time. Changes take effect at the start of your next billing cycle.",
    },
    {
      question: "Is there a free trial for paid plans?",
      answer: "Absolutely. Start a 14-day free trial of any paid plan with your full GitHub integration.",
    },
    {
      question: "What happens to my data if I cancel?",
      answer: "Your data is yours. You can export all your repositories, PRs, and analytics data at any time before canceling.",
    },
    {
      question: "Do you offer discounts for annual billing?",
      answer: "Yes! Pay annually and save 20% on Professional and Enterprise plans.",
    },
    {
      question: "Is there a limit to how many bugs I can detect?",
      answer: "No limits! Detect and fix as many bugs as you need. It's unlimited across all plans.",
    },
    {
      question: "Do you offer educational or open source discounts?",
      answer: "Yes, open source projects get Professional plan features for free. Email us for educational discounts.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition">Home</a>
            <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition">Features</a>
            <a href="/pricing" className="text-sm text-primary hover:text-accent transition font-semibold">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-sm">Sign In</Button>
            <Button className="bg-primary hover:bg-primary/90 text-white text-sm">Connect GitHub</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl opacity-40"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl opacity-40"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">Simple, Transparent Pricing</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            Start free. Scale as you grow. No hidden fees.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="text-sm text-muted-foreground">Monthly billing</span>
            <div className="relative inline-flex items-center bg-muted rounded-full p-1">
              <button className="px-4 py-2 rounded-full bg-primary text-white text-sm font-semibold">Monthly</button>
              <button className="px-4 py-2 text-sm text-muted-foreground">Annual</button>
            </div>
            <span className="text-sm text-accent font-semibold">Save 20%</span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border transition-all ${
                  plan.highlighted
                    ? "border-primary bg-gradient-to-b from-primary/10 to-accent/10 transform md:scale-105 shadow-2xl"
                    : "border-border bg-card/50 hover:border-primary/50"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-6 px-4 py-1 bg-primary text-white text-sm font-semibold rounded-full">
                    {plan.badge}
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

                  <div className="mb-8">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </div>

                  <Button
                    className={`w-full mb-8 py-6 text-base font-semibold ${
                      plan.highlighted
                        ? "bg-primary hover:bg-primary/90 text-white"
                        : "border border-border text-foreground hover:bg-muted"
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="space-y-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 font-semibold">Feature</th>
                  <th className="text-center py-4 px-6 font-semibold">Starter</th>
                  <th className="text-center py-4 px-6 font-semibold">Professional</th>
                  <th className="text-center py-4 px-6 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Repositories", starter: "5", pro: "Unlimited", enterprise: "Unlimited" },
                  { feature: "Bug Detection", starter: "Basic", pro: "Advanced", enterprise: "Advanced" },
                  { feature: "Auto PR Creation", starter: "Yes", pro: "Yes", enterprise: "Yes" },
                  { feature: "Real-time Alerts", starter: "No", pro: "Yes", enterprise: "Yes" },
                  { feature: "Private Repos", starter: "No", pro: "Yes", enterprise: "Yes" },
                  { feature: "Team Members", starter: "1", pro: "Unlimited", enterprise: "Unlimited" },
                  { feature: "Custom Rules", starter: "No", pro: "Yes", enterprise: "Yes" },
                  { feature: "API Access", starter: "No", pro: "Yes", enterprise: "Yes" },
                  { feature: "Support", starter: "Community", pro: "Email", enterprise: "24/7 Phone" },
                ].map((row) => (
                  <tr key={row.feature} className="border-b border-border hover:bg-muted/50">
                    <td className="py-4 px-6 font-semibold text-sm">{row.feature}</td>
                    <td className="py-4 px-6 text-center text-sm text-muted-foreground">{row.starter}</td>
                    <td className="py-4 px-6 text-center text-sm">{row.pro}</td>
                    <td className="py-4 px-6 text-center text-sm">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>

          <div className="space-y-8">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-border pb-8 last:border-b-0">
                <h3 className="text-xl font-semibold mb-3 text-foreground">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
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
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">Ready to Start?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Choose your plan and connect your GitHub repositories in minutes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg w-full sm:w-auto flex items-center justify-center gap-2">
                Get Started Free <Github className="w-5 h-5" />
              </Button>
              <Button variant="outline" className="border-border hover:bg-muted px-8 py-6 text-lg w-full sm:w-auto">
                Schedule Demo
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              No credit card required. Start with Starter plan free forever.
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
                <li><a href="/" className="hover:text-foreground transition">Features</a></li>
                <li><a href="/pricing" className="hover:text-foreground transition">Pricing</a></li>
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
