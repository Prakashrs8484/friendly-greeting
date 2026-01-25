import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type InsightType = "tip" | "warning" | "achievement" | "suggestion";

interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

interface CoachInsightsProps {
  proteinIntake: number;
  proteinTarget: number;
  caloriesIn: number;
  caloriesTarget: number;
  workoutMinutes: number;
  streak: number;
  recoveryScore: number;
  waterIntake: number;
  waterTarget: number;
}

const typeConfig: Record<InsightType, { icon: React.ElementType; color: string; bgColor: string }> = {
  tip: {
    icon: Lightbulb,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10 border-orange-500/20",
  },
  achievement: {
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10 border-success/20",
  },
  suggestion: {
    icon: Sparkles,
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
  },
};

function generateInsights(props: CoachInsightsProps): Insight[] {
  const insights: Insight[] = [];
  const {
    proteinIntake,
    proteinTarget,
    caloriesIn,
    caloriesTarget,
    workoutMinutes,
    streak,
    recoveryScore,
    waterIntake,
    waterTarget,
  } = props;

  const proteinPercentage = (proteinIntake / proteinTarget) * 100;
  const caloriesPercentage = (caloriesIn / caloriesTarget) * 100;
  const waterPercentage = (waterIntake / waterTarget) * 100;

  // Protein insights
  if (proteinPercentage < 50) {
    insights.push({
      id: "protein-low",
      type: "warning",
      title: "Protein intake is low today",
      description: `You're at ${proteinIntake}g of ${proteinTarget}g. Add curd, eggs, paneer, or dal at your next meal to catch up.`,
      priority: "high",
    });
  } else if (proteinPercentage >= 100) {
    insights.push({
      id: "protein-goal",
      type: "achievement",
      title: "Protein goal achieved! 💪",
      description: "Great job hitting your protein target. Your muscles will thank you.",
      priority: "low",
    });
  }

  // Recovery insights
  if (recoveryScore < 60 && workoutMinutes > 30) {
    insights.push({
      id: "recovery-low",
      type: "warning",
      title: "High workout intensity with low recovery",
      description: "Your recovery score is low. Prioritize sleep tonight and consider a lighter workout tomorrow.",
      priority: "high",
    });
  } else if (recoveryScore >= 80) {
    insights.push({
      id: "recovery-good",
      type: "tip",
      title: "Great recovery — push hard today!",
      description: "Your body is well-rested. This is a good day for an intense workout session.",
      priority: "medium",
    });
  }

  // Streak insights
  if (streak >= 7) {
    insights.push({
      id: "streak",
      type: "achievement",
      title: `${streak}-day streak! 🔥`,
      description: "You've been consistent this week — great momentum! Keep it going.",
      priority: "low",
    });
  }

  // Hydration insights
  if (waterPercentage < 50) {
    insights.push({
      id: "water-low",
      type: "tip",
      title: "Stay hydrated",
      description: `You've had ${waterIntake} of ${waterTarget} glasses. Drink water now to stay on track.`,
      priority: "medium",
    });
  }

  // Calorie insights
  if (caloriesPercentage > 110) {
    insights.push({
      id: "calories-over",
      type: "suggestion",
      title: "Slightly over calorie target",
      description: "Consider a 15-20 min walk after dinner to balance out the extra calories.",
      priority: "medium",
    });
  }

  // Default insight if none generated
  if (insights.length === 0) {
    insights.push({
      id: "default",
      type: "suggestion",
      title: "Keep tracking!",
      description: "Log your meals and activities to get personalized insights from your AI coach.",
      priority: "low",
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]).slice(0, 4);
}

export function CoachInsights(props: CoachInsightsProps) {
  const insights = generateInsights(props);

  return (
    <Card className="card-glass">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="w-5 h-5 text-primary" />
          Coach Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const config = typeConfig[insight.type];
          const Icon = config.icon;

          return (
            <div
              key={insight.id}
              className={cn(
                "p-3 rounded-xl border transition-all duration-200 hover:shadow-sm",
                config.bgColor
              )}
            >
              <div className="flex gap-3">
                <div className={cn("flex-shrink-0 mt-0.5", config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-foreground">{insight.title}</h4>
                    {insight.priority === "high" && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-destructive/10 text-destructive border-destructive/20 flex-shrink-0">
                        Important
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default CoachInsights;
