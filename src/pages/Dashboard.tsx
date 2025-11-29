import { Target, TrendingUp, Heart, Apple, Zap, MessageSquare, BarChart3, Activity } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Welcome back, Alex!</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Your AI agents are actively managing your workspace
              </p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/30 px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap">
              6 Active AI Agents
            </Badge>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-4 sm:p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
              </div>
              <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* AI Agents Overview */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Your AI Agents</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {agents.map((agent, index) => (
              <div
                key={index}
                className="p-4 sm:p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-all animate-fade-in group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 sm:p-3 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      <agent.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold truncate">{agent.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{agent.description}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-primary/20 text-primary border-primary/30 text-xs whitespace-nowrap flex-shrink-0"
                  >
                    Active
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  {agent.recentActivity.map((activity, idx) => (
                    <div
                      key={idx}
                      className="p-2 sm:p-3 rounded-lg bg-secondary/50 border border-border text-xs sm:text-sm"
                    >
                      {activity}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs sm:text-sm"
                    onClick={() => navigate(agent.route)}
                  >
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Chat with Agent</span>
                    <span className="xs:hidden">Chat</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(agent.route)}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

const stats = [
  { label: "Tasks Completed", value: "24", change: "+12% this week", icon: Target },
  { label: "Active Goals", value: "8", change: "2 near completion", icon: TrendingUp },
  { label: "Wellness Score", value: "85%", change: "+5% this month", icon: Heart },
  { label: "Productivity", value: "92%", change: "Above average", icon: Activity },
];

const agents = [
  {
    name: "Career Agent",
    description: "Manages skill development and career goals",
    icon: Target,
    route: "/career",
    recentActivity: [
      "Generated learning path for Advanced TypeScript",
      "Updated resume with recent certifications",
      "Analyzed LinkedIn profile performance",
    ],
  },
  {
    name: "Finance Agent",
    description: "Tracks spending and financial goals",
    icon: TrendingUp,
    route: "/finance",
    recentActivity: [
      "Created monthly budget for December",
      "Detected $45 in unused subscriptions",
      "Updated emergency fund progress to 75%",
    ],
  },
  {
    name: "Health Agent",
    description: "Optimizes fitness and wellness routines",
    icon: Heart,
    route: "/health",
    recentActivity: [
      "Generated HIIT workout plan for this week",
      "Tracked 12-day workout streak",
      "Sleep quality improved by 18%",
    ],
  },
  {
    name: "Nutrition Agent",
    description: "Creates meal plans and tracks nutrition",
    icon: Apple,
    route: "/nutrition",
    recentActivity: [
      "Generated weekly meal plan",
      "Added 3 high-protein recipes",
      "Macro tracking: 92% on target",
    ],
  },
  {
    name: "Lifestyle Agent",
    description: "Optimizes daily routines and habits",
    icon: Zap,
    route: "/lifestyle",
    recentActivity: [
      "Morning routine completed 14 days straight",
      "Evening wind-down suggestion ready",
      "Energy levels 23% higher this week",
    ],
  },
];

export default Dashboard;
