import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, Target } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Workspace</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent animate-fade-in">
              Your Intelligent Personal Workspace
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
              Meet NeuraDesk — where AI agents manage every domain of your life. 
              Career, Finance, Health, Nutrition, and Lifestyle — all in one unified workspace.
            </p>
            
            <div className="flex gap-4 justify-center animate-fade-in">
              <Button size="lg" onClick={() => navigate("/auth")} className="group">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all animate-fade-in"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: Brain,
    title: "AI-Driven Agents",
    description: "Specialized agents for Career, Finance, Health, Nutrition, and Lifestyle autonomously manage your plans and reports.",
  },
  {
    icon: Sparkles,
    title: "Context-Aware Intelligence",
    description: "Every agent remembers your preferences, goals, and habits to deliver hyper-personalized recommendations.",
  },
  {
    icon: Target,
    title: "Unified Workspace",
    description: "All domains in one place. Chat with agents, view generated plans, and track progress seamlessly.",
  },
];

export default Index;
