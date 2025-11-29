import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Brain, Sparkles, LayoutDashboard, Target, TrendingUp, Calendar } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b border-border z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              NeuraDesk
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-primary to-accent">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)' }} />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm text-foreground">AI-Powered Personal Workspace</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Your Intelligent
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Productivity Hub
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              NeuraDesk brings together AI agents, personalized insights, and seamless task management 
              across all aspects of your life—career, health, finance, and more.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-lg px-8 shadow-lg hover:shadow-xl transition-all">
                  Start Your Journey
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4">Intelligent Modules for Every Domain</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              AI-powered agents that understand your goals and help you achieve them
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)' }} />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Productivity?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of users who are already using AI to work smarter
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent text-lg px-8 shadow-lg hover:shadow-xl transition-all">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">NeuraDesk</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2025 NeuraDesk. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: Target,
    title: "Career Growth",
    description: "AI-powered skill tracking, learning plans, and job recommendations tailored to your goals",
  },
  {
    icon: TrendingUp,
    title: "Financial Planning",
    description: "Smart budgeting, investment insights, and automated expense tracking",
  },
  {
    icon: Calendar,
    title: "Health & Wellness",
    description: "Personalized workout routines, meal plans, and progress monitoring",
  },
  {
    icon: LayoutDashboard,
    title: "Unified Dashboard",
    description: "All your productivity tools in one beautiful, customizable workspace",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    description: "Context-aware suggestions that learn from your habits and preferences",
  },
  {
    icon: Brain,
    title: "Smart Automation",
    description: "Automated reports, planners, and reminders that keep you on track",
  },
];

export default Landing;
