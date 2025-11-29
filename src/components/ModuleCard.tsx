import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LucideIcon, Sparkles, ArrowRight } from "lucide-react";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  status: "active" | "analyzing" | "idle";
  gradient: string;
  aiInsight: string;
  index: number;
}

const ModuleCard = ({ title, description, icon: Icon, status, gradient, aiInsight, index }: ModuleCardProps) => {
  const statusConfig = {
    active: { label: "Active", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    analyzing: { label: "Analyzing", className: "bg-accent/10 text-accent border-accent/20 animate-pulse-glow" },
    idle: { label: "Idle", className: "bg-muted text-muted-foreground" },
  };

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 border-border hover:border-primary/50 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <Badge variant="outline" className={statusConfig[status].className}>
            {statusConfig[status].label}
          </Badge>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{aiInsight}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full group/btn">
          Open Module
          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default ModuleCard;
