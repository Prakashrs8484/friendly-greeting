import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Dumbbell, Target, TrendingUp, Zap, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type FitnessGoal = "fat_loss" | "muscle_gain" | "maintenance";

interface FitnessSnapshotProps {
  goal: FitnessGoal;
  caloriesIn: number;
  caloriesOut: number;
  proteinIntake: number;
  proteinTarget: number;
  carbsIntake: number;
  carbsTarget: number;
  fatsIntake: number;
  fatsTarget: number;
  workoutMinutes: number;
  workoutTarget: number;
  streak: number;
  fitnessScore: number;
}

const goalColors: Record<FitnessGoal, { primary: string; gradient: string; badge: string }> = {
  fat_loss: {
    primary: "text-orange-500",
    gradient: "from-orange-500 to-red-500",
    badge: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
  muscle_gain: {
    primary: "text-primary",
    gradient: "from-primary to-emerald-500",
    badge: "bg-primary/10 text-primary border-primary/20",
  },
  maintenance: {
    primary: "text-blue-500",
    gradient: "from-blue-500 to-cyan-500",
    badge: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
};

const goalLabels: Record<FitnessGoal, string> = {
  fat_loss: "Fat Loss Mode",
  muscle_gain: "Muscle Gain Mode",
  maintenance: "Maintenance Mode",
};

export function FitnessSnapshot({
  goal,
  caloriesIn,
  caloriesOut,
  proteinIntake,
  proteinTarget,
  carbsIntake,
  carbsTarget,
  fatsIntake,
  fatsTarget,
  workoutMinutes,
  workoutTarget,
  streak,
  fitnessScore,
}: FitnessSnapshotProps) {
  const colors = goalColors[goal];
  const calorieBalance = caloriesIn - caloriesOut;
  const isDeficit = calorieBalance < 0;
  const proteinProgress = Math.min((proteinIntake / proteinTarget) * 100, 100);
  const workoutProgress = Math.min((workoutMinutes / workoutTarget) * 100, 100);

  const stats = [
    {
      label: "Calories In/Out",
      value: `${caloriesIn.toLocaleString()}`,
      subValue: `/ ${caloriesOut.toLocaleString()} burned`,
      icon: Flame,
      progress: Math.min((caloriesIn / (goal === "fat_loss" ? caloriesOut * 0.8 : caloriesOut * 1.1)) * 100, 100),
      status: isDeficit ? "deficit" : "surplus",
      statusLabel: `${Math.abs(calorieBalance)} cal ${isDeficit ? "deficit" : "surplus"}`,
    },
    {
      label: "Protein",
      value: `${proteinIntake}g`,
      subValue: `/ ${proteinTarget}g`,
      icon: Target,
      progress: proteinProgress,
      status: proteinProgress >= 80 ? "good" : proteinProgress >= 50 ? "warning" : "low",
      statusLabel: proteinProgress >= 80 ? "On Track" : `${Math.round(proteinTarget - proteinIntake)}g to go`,
    },
    {
      label: "Macros",
      value: `${carbsIntake}C / ${fatsIntake}F`,
      subValue: `${carbsTarget}C / ${fatsTarget}F target`,
      icon: Activity,
      progress: ((carbsIntake / carbsTarget + fatsIntake / fatsTarget) / 2) * 100,
      status: "neutral",
      statusLabel: "Balanced",
    },
    {
      label: "Workout",
      value: `${workoutMinutes} min`,
      subValue: `/ ${workoutTarget} min`,
      icon: Dumbbell,
      progress: workoutProgress,
      status: workoutProgress >= 100 ? "complete" : "active",
      statusLabel: workoutProgress >= 100 ? "Done!" : `${workoutTarget - workoutMinutes} min left`,
    },
    {
      label: "Streak",
      value: `${streak} days`,
      subValue: "consecutive",
      icon: Zap,
      progress: Math.min((streak / 30) * 100, 100),
      status: streak >= 7 ? "fire" : "building",
      statusLabel: streak >= 7 ? "🔥 On Fire!" : "Keep going!",
    },
    {
      label: "Fitness Score",
      value: `${fitnessScore}`,
      subValue: "/ 100",
      icon: TrendingUp,
      progress: fitnessScore,
      status: fitnessScore >= 80 ? "excellent" : fitnessScore >= 60 ? "good" : "improving",
      statusLabel: fitnessScore >= 80 ? "Excellent" : fitnessScore >= 60 ? "Good" : "Improving",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Goal Badge */}
      <div className="flex items-center justify-between">
        <Badge className={cn("text-sm font-medium px-3 py-1", colors.badge)}>
          {goalLabels[goal]}
        </Badge>
        <span className="text-xs text-muted-foreground">Updated just now</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={cn(
              "card-glass border-border/50 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  `bg-gradient-to-br ${colors.gradient}`
                )}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.subValue}</p>
              </div>
              <Progress 
                value={stat.progress} 
                className="h-1.5 mt-3"
              />
              <p className={cn(
                "text-xs mt-1.5 font-medium",
                stat.status === "deficit" && goal === "fat_loss" && "text-success",
                stat.status === "surplus" && goal === "muscle_gain" && "text-success",
                stat.status === "good" && "text-success",
                stat.status === "complete" && "text-success",
                stat.status === "fire" && "text-orange-500",
                stat.status === "excellent" && "text-success",
                stat.status === "warning" && "text-warning",
                stat.status === "low" && "text-destructive"
              )}>
                {stat.statusLabel}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default FitnessSnapshot;
