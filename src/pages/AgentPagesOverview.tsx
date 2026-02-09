import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Bot, ChevronRight, Sparkles, Layers } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAgentPages, type AgentPage } from "@/lib/agentPageApi";
import { toast } from "@/hooks/use-toast";

const ICON_MAP: Record<string, string> = {
  "✍️": "✍️", "🔬": "🔬", "💼": "💼", "🏋️": "🏋️", "🎨": "🎨",
  "📊": "📊", "🧠": "🧠", "📚": "📚", "🎯": "🎯", "⚡": "⚡",
};

const AgentPagesOverview = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState<AgentPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAgentPages();
        setPages(data);
      } catch {
        toast({ title: "Failed to load agent pages", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              Agent Pages
            </h1>
            <p className="page-subtitle">
              Build your own AI workspaces with custom agents tailored to your needs
            </p>
          </div>
          <Button
            onClick={() => navigate("/agent-pages/create")}
            className="gap-2 rounded-xl shadow-md"
          >
            <Plus className="w-4 h-4" />
            Create Agent Page
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 rounded-2xl bg-primary/5 mb-6">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Agent Pages yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first workspace and start building custom AI agents
              that work exactly the way you need them to.
            </p>
            <Button
              onClick={() => navigate("/agent-pages/create")}
              className="gap-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              Create Your First Page
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((page, i) => (
              <button
                key={page._id}
                onClick={() => navigate(`/agent-pages/${page._id}`)}
                className="group text-left p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">
                    {ICON_MAP[page.icon] || page.icon || "🧠"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                  {page.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {page.description || "No description"}
                </p>
                <Badge variant="outline" className="text-xs gap-1">
                  <Bot className="w-3 h-3" />
                  {page.agents?.length || 0} agent{(page.agents?.length || 0) !== 1 ? "s" : ""}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AgentPagesOverview;
