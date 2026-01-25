import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Heart, 
  Moon, 
  Droplet, 
  Activity, 
  AlertCircle, 
  ChevronDown,
  Thermometer,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface RecoveryHealthProps {
  recoveryScore: number;
  sleepQuality: "poor" | "fair" | "good" | "excellent";
  sleepHours: number;
  hydrationLevel: number; // 0-100
  muscleSoreness: "none" | "light" | "moderate" | "severe";
  stressLevel: "low" | "moderate" | "high";
  restingHeartRate?: number;
  injuryNotes?: string[];
}

const sleepQualityConfig = {
  poor: { color: "text-destructive", bg: "bg-destructive/10", score: 25 },
  fair: { color: "text-warning", bg: "bg-warning/10", score: 50 },
  good: { color: "text-primary", bg: "bg-primary/10", score: 75 },
  excellent: { color: "text-success", bg: "bg-success/10", score: 100 },
};

const sorenessConfig = {
  none: { color: "text-success", label: "None", impact: "Ready for intense training" },
  light: { color: "text-primary", label: "Light", impact: "Safe for normal workout" },
  moderate: { color: "text-warning", label: "Moderate", impact: "Consider lighter session" },
  severe: { color: "text-destructive", label: "Severe", impact: "Rest recommended" },
};

const stressConfig = {
  low: { color: "text-success", impact: "Optimal for training" },
  moderate: { color: "text-warning", impact: "Monitor your energy levels" },
  high: { color: "text-destructive", impact: "Focus on recovery activities" },
};

export function RecoveryHealth({
  recoveryScore,
  sleepQuality,
  sleepHours,
  hydrationLevel,
  muscleSoreness,
  stressLevel,
  restingHeartRate,
  injuryNotes = [],
}: RecoveryHealthProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const signals = [
    {
      label: "Sleep Quality",
      icon: Moon,
      value: `${sleepQuality.charAt(0).toUpperCase() + sleepQuality.slice(1)} (${sleepHours}h)`,
      color: sleepQualityConfig[sleepQuality].color,
      progress: sleepQualityConfig[sleepQuality].score,
    },
    {
      label: "Hydration",
      icon: Droplet,
      value: `${hydrationLevel}%`,
      color: hydrationLevel >= 70 ? "text-success" : hydrationLevel >= 50 ? "text-warning" : "text-destructive",
      progress: hydrationLevel,
    },
    {
      label: "Muscle Soreness",
      icon: Activity,
      value: sorenessConfig[muscleSoreness].label,
      color: sorenessConfig[muscleSoreness].color,
      progress: muscleSoreness === "none" ? 100 : muscleSoreness === "light" ? 75 : muscleSoreness === "moderate" ? 50 : 25,
    },
    {
      label: "Stress Level",
      icon: Brain,
      value: stressLevel.charAt(0).toUpperCase() + stressLevel.slice(1),
      color: stressConfig[stressLevel].color,
      progress: stressLevel === "low" ? 100 : stressLevel === "moderate" ? 60 : 30,
    },
  ];

  return (
    <Card className="card-glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="w-5 h-5 text-rose-500" />
            Recovery & Health
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "font-semibold",
              recoveryScore >= 80 && "bg-success/10 text-success border-success/20",
              recoveryScore >= 60 && recoveryScore < 80 && "bg-warning/10 text-warning border-warning/20",
              recoveryScore < 60 && "bg-destructive/10 text-destructive border-destructive/20"
            )}
          >
            {recoveryScore}% Ready
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Recovery Score */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-primary/10 border border-rose-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Recovery</span>
            <span className={cn(
              "text-2xl font-bold",
              recoveryScore >= 80 && "text-success",
              recoveryScore >= 60 && recoveryScore < 80 && "text-warning",
              recoveryScore < 60 && "text-destructive"
            )}>
              {recoveryScore}%
            </span>
          </div>
          <Progress 
            value={recoveryScore} 
            className={cn(
              "h-3",
              recoveryScore >= 80 && "[&>div]:bg-success",
              recoveryScore >= 60 && recoveryScore < 80 && "[&>div]:bg-warning",
              recoveryScore < 60 && "[&>div]:bg-destructive"
            )}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {recoveryScore >= 80 
              ? "Your body is well-recovered. Great day for intense training!" 
              : recoveryScore >= 60 
                ? "Moderate recovery. Consider a balanced workout."
                : "Low recovery detected. Focus on rest and nutrition today."}
          </p>
        </div>

        {/* Health Signals Grid */}
        <div className="grid grid-cols-2 gap-3">
          {signals.map((signal, index) => {
            const Icon = signal.icon;
            return (
              <div 
                key={index}
                className="p-3 rounded-lg bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn("w-4 h-4", signal.color)} />
                  <span className="text-xs text-muted-foreground">{signal.label}</span>
                </div>
                <p className={cn("text-sm font-semibold", signal.color)}>{signal.value}</p>
                <Progress value={signal.progress} className="h-1 mt-2" />
              </div>
            );
          })}
        </div>

        {/* Resting Heart Rate */}
        {restingHeartRate && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-500" />
              <span className="text-sm text-muted-foreground">Resting Heart Rate</span>
            </div>
            <span className="text-sm font-semibold">{restingHeartRate} bpm</span>
          </div>
        )}

        {/* Injury Notes */}
        {injuryNotes.length > 0 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 transition-colors">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Injury/Pain Notes ({injuryNotes.length})</span>
                </div>
                <ChevronDown className={cn(
                  "w-4 h-4 text-destructive transition-transform",
                  isExpanded && "rotate-180"
                )} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-2 pl-6">
                {injuryNotes.map((note, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground">• {note}</p>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* AI Recommendation */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-primary">AI Recommendation: </span>
            {recoveryScore >= 80 
              ? "Push your limits today! Your body is ready for high-intensity training."
              : recoveryScore >= 60
                ? "A moderate workout would be ideal. Listen to your body and adjust intensity as needed."
                : "Focus on recovery: light yoga, stretching, or a walk. Prioritize sleep and hydration."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecoveryHealth;
