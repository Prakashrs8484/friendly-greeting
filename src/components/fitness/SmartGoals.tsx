import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Flame, Dumbbell, Droplet, Moon, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type FitnessGoal = "fat_loss" | "muscle_gain" | "maintenance";

interface GoalData {
  label: string;
  current: number;
  target: number;
  unit: string;
  icon: React.ElementType;
  color: string;
}

interface SmartGoalsProps {
  goal: FitnessGoal;
  onGoalChange: (goal: FitnessGoal) => void;
  caloriesIn: number;
  caloriesTarget: number;
  proteinIntake: number;
  proteinTarget: number;
  workoutMinutes: number;
  workoutTarget: number;
  waterIntake: number;
  waterTarget: number;
  sleepHours: number;
  sleepTarget: number;
  recoveryScore: number;
}

const goalDescriptions: Record<FitnessGoal, { title: string; description: string }> = {
  fat_loss: {
    title: "Fat Loss",
    description: "Calorie deficit with high protein",
  },
  muscle_gain: {
    title: "Muscle Gain", 
    description: "Calorie surplus with strength focus",
  },
  maintenance: {
    title: "Maintenance",
    description: "Balanced intake and activity",
  },
};

export function SmartGoals({
  goal,
  onGoalChange,
  caloriesIn,
  caloriesTarget,
  proteinIntake,
  proteinTarget,
  workoutMinutes,
  workoutTarget,
  waterIntake,
  waterTarget,
  sleepHours,
  sleepTarget,
  recoveryScore,
}: SmartGoalsProps) {
  const goals: GoalData[] = [
    {
      label: "Calories",
      current: caloriesIn,
      target: caloriesTarget,
      unit: "cal",
      icon: Flame,
      color: "text-orange-500",
    },
    {
      label: "Protein",
      current: proteinIntake,
      target: proteinTarget,
      unit: "g",
      icon: Target,
      color: "text-primary",
    },
    {
      label: "Workout",
      current: workoutMinutes,
      target: workoutTarget,
      unit: "min",
      icon: Dumbbell,
      color: "text-emerald-500",
    },
    {
      label: "Hydration",
      current: waterIntake,
      target: waterTarget,
      unit: "glasses",
      icon: Droplet,
      color: "text-blue-500",
    },
    {
      label: "Sleep",
      current: sleepHours,
      target: sleepTarget,
      unit: "hrs",
      icon: Moon,
      color: "text-indigo-500",
    },
  ];

  const getStatus = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return "complete";
    if (percentage >= 80) return "almost";
    if (percentage >= 50) return "halfway";
    return "low";
  };

  const statusColors = {
    complete: "text-success",
    almost: "text-primary",
    halfway: "text-warning",
    low: "text-muted-foreground",
  };

  return (
    <Card className="card-glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Smart Goals & Progress</CardTitle>
        </div>
        {/* Goal Selector */}
        <div className="pt-2">
          <Select value={goal} onValueChange={(v) => onGoalChange(v as FitnessGoal)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(goalDescriptions).map(([key, { title, description }]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex flex-col">
                    <span className="font-medium">{title}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Goals List */}
        {goals.map((g, index) => {
          const percentage = Math.min((g.current / g.target) * 100, 100);
          const status = getStatus(g.current, g.target);
          const Icon = g.icon;

          return (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-4 h-4", g.color)} />
                  <span className="text-sm font-medium">{g.label}</span>
                </div>
                <span className={cn("text-sm font-medium", statusColors[status])}>
                  {g.current} / {g.target} {g.unit}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}

        {/* Recovery Score */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <span className="text-sm font-medium">Recovery Score</span>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "font-semibold",
                recoveryScore >= 80 && "bg-success/10 text-success border-success/20",
                recoveryScore >= 60 && recoveryScore < 80 && "bg-warning/10 text-warning border-warning/20",
                recoveryScore < 60 && "bg-destructive/10 text-destructive border-destructive/20"
              )}
            >
              {recoveryScore}%
            </Badge>
          </div>
          <Progress 
            value={recoveryScore} 
            className={cn(
              "h-2",
              recoveryScore >= 80 && "[&>div]:bg-success",
              recoveryScore >= 60 && recoveryScore < 80 && "[&>div]:bg-warning",
              recoveryScore < 60 && "[&>div]:bg-destructive"
            )} 
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            {recoveryScore >= 80 
              ? "Great recovery! Ready for intense training." 
              : recoveryScore >= 60 
                ? "Moderate recovery. Consider lighter workout."
                : "Low recovery. Focus on rest and nutrition."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default SmartGoals;
