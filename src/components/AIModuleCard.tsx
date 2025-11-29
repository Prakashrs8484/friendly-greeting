import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";

interface AIModuleCardProps {
  title: string;
  description?: string;
  status: "active" | "generating" | "completed";
  children: ReactNode;
  icon?: React.ElementType;
  actions?: ReactNode;
}

const AIModuleCard = ({ 
  title, 
  description, 
  status, 
  children, 
  icon: Icon,
  actions 
}: AIModuleCardProps) => {
  const statusConfig = {
    active: { 
      label: "AI Active", 
      icon: Sparkles, 
      className: "bg-primary/20 text-primary border-primary/30" 
    },
    generating: { 
      label: "Generating", 
      icon: TrendingUp, 
      className: "bg-accent/20 text-accent border-accent/30 animate-pulse" 
    },
    completed: { 
      label: "Ready", 
      icon: CheckCircle2, 
      className: "bg-success/20 text-success border-success/30" 
    },
  };

  const StatusIcon = statusConfig[status].icon;

  return (
    <Card className="p-6 bg-card border-border hover:border-primary/30 transition-all duration-300 animate-fade-in group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={`flex items-center gap-1.5 ${statusConfig[status].className}`}
        >
          <StatusIcon className="w-3.5 h-3.5" />
          {statusConfig[status].label}
        </Badge>
      </div>

      <div className="mt-4">
        {children}
      </div>

      {actions && (
        <div className="mt-4 pt-4 border-t border-border">
          {actions}
        </div>
      )}
    </Card>
  );
};

export default AIModuleCard;
