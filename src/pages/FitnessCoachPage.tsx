import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FitnessSnapshot } from "@/components/fitness/FitnessSnapshot";
import {
  FitnessCoachChat,
  type FitnessChatMessage,
} from "@/components/fitness/FitnessCoachChat";
import { TodayTimeline } from "@/components/fitness/TodayTimeline";
import { SmartGoals } from "@/components/fitness/SmartGoals";
import { CoachInsights } from "@/components/fitness/CoachInsights";
import { FitnessAnalytics } from "@/components/fitness/FitnessAnalytics";
import { RecoveryHealth } from "@/components/fitness/RecoveryHealth";
import { MealPlanSuggestions } from "@/components/fitness/MealPlanSuggestions";
import { useToast } from "@/hooks/use-toast";
import * as fitnessApi from "@/lib/fitnessApi";

type FitnessGoal = "fat_loss" | "muscle_gain" | "maintenance";

interface TimelineItem {
  id: string;
  type: "breakfast" | "lunch" | "dinner" | "snack" | "workout" | "activity";
  time: string;
  sortKey?: number;
  title: string;
  description: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  caloriesBurned?: number;
  duration?: number;
  isAiEstimated: boolean;
}

function createDefaultMetric(dateKey: string): fitnessApi.FitnessDailyMetric {
  return {
    dateKey,
    caloriesConsumed: 0,
    caloriesBurned: 0,
    netCalories: 0,
    proteinIntake: 0,
    carbsIntake: 0,
    fatIntake: 0,
    waterIntakeMl: 0,
    workoutMinutes: 0,
    sleepHours: 0,
    recoveryScore: 0,
    fitnessScore: 0,
    streakCount: 0,
  };
}

function createDefaultDailyStats(dateKey: string): fitnessApi.FitnessDailyStats {
  return {
    dateKey,
    intakeCalories: 0,
    intakeProtein: 0,
    intakeCarbs: 0,
    intakeFats: 0,
    burnedCalories: 0,
    netCalories: 0,
    deficitCalories: 0,
    calorieTarget: 2000,
    mealCount: 0,
    activityCount: 0,
  };
}

const FitnessCoachPage = () => {
  const { toast } = useToast();
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [goal, setGoal] = useState<FitnessGoal>("fat_loss");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCommandSubmitting, setIsCommandSubmitting] = useState(false);
  const [analyticsRefreshKey, setAnalyticsRefreshKey] = useState(0);

  const [dailyMetric, setDailyMetric] = useState<fitnessApi.FitnessDailyMetric>(
    createDefaultMetric(today)
  );
  const [dailyStats, setDailyStats] = useState<fitnessApi.FitnessDailyStats>(
    createDefaultDailyStats(today)
  );
  const [goals, setGoals] = useState<fitnessApi.FitnessGoal | null>(null);
  const [timelineEntries, setTimelineEntries] = useState<fitnessApi.FitnessEntry[]>([]);
  const [recovery, setRecovery] = useState<fitnessApi.RecoveryData | null>(null);
  const [insights, setInsights] = useState<fitnessApi.AIInsights | null>(null);
  const [chatMessages, setChatMessages] = useState<FitnessChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Tell me what you ate or what activity you did. I will chat naturally and track your calories and macros automatically.",
      timestamp: new Date().toISOString(),
      events: [],
    },
  ]);

  const refreshRealtimeData = useCallback(async () => {
    const [dashboardRes, timelineRes, recoveryRes] = await Promise.all([
      fitnessApi.getDashboard(),
      fitnessApi.getTimeline(today),
      fitnessApi.getRecoveryData(today),
    ]);

    setDailyMetric(dashboardRes.dashboard || createDefaultMetric(today));
    setTimelineEntries(timelineRes.entries || []);
    setRecovery(recoveryRes || null);
  }, [today]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        await refreshRealtimeData();
        const [goalsRes, insightsRes] = await Promise.all([
          fitnessApi.getGoals(),
          fitnessApi.getInsights(today),
        ]);
        setGoal(goalsRes.goals?.goalMode || "fat_loss");
        setGoals(goalsRes.goals || null);
        setInsights(insightsRes || null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load fitness data";
        setError(message);
        toast({ title: "Error", description: message, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [refreshRealtimeData, toast, today]);

  const timelineItems: TimelineItem[] = timelineEntries.map((entry) => {
    const time = new Date(entry.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    let type: TimelineItem["type"] = "activity";
    let title = entry.description || entry.entryType;

    if (entry.entryType === "meal") {
      const mealType = entry.subtype as TimelineItem["type"] | undefined;
      type =
        mealType && ["breakfast", "lunch", "dinner", "snack"].includes(mealType)
          ? mealType
          : "snack";
      title = entry.subtype || "Meal";
    } else if (entry.entryType === "workout") {
      type = "workout";
      title = entry.workoutType || "Workout";
    } else if (entry.entryType === "activity") {
      type = "activity";
      title = entry.activityType || "Activity";
    }

    return {
      id: entry._id || "",
      type,
      time,
      sortKey: new Date(entry.timestamp).getTime(),
      title,
      description: entry.description || "",
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fats: entry.fat,
      caloriesBurned: entry.caloriesBurned,
      duration: entry.duration,
      isAiEstimated: entry.aiEstimated || false,
    };
  });

  const handleFitnessChat = async (text: string) => {
    const userMessage: FitnessChatMessage = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((previous) => [...previous, userMessage]);

    try {
      setIsCommandSubmitting(true);

      const response = await fitnessApi.fitnessChat({
        text,
        date: today,
      });

      const assistantMessage: FitnessChatMessage = {
        id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        role: "assistant",
        content: response.chatResponse,
        timestamp: new Date().toISOString(),
        events: response.events || [],
      };

      setChatMessages((previous) => [...previous, assistantMessage]);
      setDailyStats(response.updatedDailyStats || createDefaultDailyStats(today));
      setTimelineEntries(response.timeline || []);

      if (response.dashboard?.today) {
        setDailyMetric(response.dashboard.today);
      } else if (response.dailyMetric) {
        setDailyMetric(response.dailyMetric);
      }

      setAnalyticsRefreshKey((value) => value + 1);
      await refreshRealtimeData();

      toast({
        title: response.events.length > 0 ? "Tracking updated" : "Chat updated",
        description:
          response.events.length > 0
            ? `${response.updatedDailyStats.intakeCalories} cal in • ${response.updatedDailyStats.burnedCalories} cal burned`
            : "No new meal/activity events detected",
      });
    } catch (err) {
      setChatMessages((previous) => [
        ...previous,
        {
          id: `a-error-${Date.now()}`,
          role: "assistant",
          content: "I could not process that message. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
      const message = err instanceof Error ? err.message : "Failed to process fitness command";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsCommandSubmitting(false);
    }
  };

  const handleAddWater = async () => {
    try {
      await fitnessApi.createTimelineEntry({
        entryType: "hydration",
        volumeMl: 250,
        timestamp: new Date().toISOString(),
      });

      await refreshRealtimeData();
      toast({ title: "Water logged", description: "Added 1 glass (250 ml)" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to log water";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const handleGoalChange = async (newGoal: FitnessGoal) => {
    try {
      const response = await fitnessApi.updateGoals({ goalMode: newGoal });
      setGoal(newGoal);
      setGoals(response.goals || null);
      setAnalyticsRefreshKey((value) => value + 1);
      await refreshRealtimeData();
      toast({ title: "Goal updated", description: `Set goal to ${newGoal.replace("_", " ")}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update goal";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  };

  const waterIntakeGlasses = dailyMetric?.waterIntakeMl
    ? Math.round(dailyMetric.waterIntakeMl / 250)
    : 0;
  const waterTargetGlasses = Math.max(1, Math.round((goals?.targets.water || 2000) / 250));

  if (loading) {
    return (
      <DashboardLayout hideNavigation>
        <div className="page-container flex min-h-screen items-center justify-center animate-fade-in">
          <p className="text-lg text-gray-500">Loading fitness data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !goals) {
    return (
      <DashboardLayout hideNavigation>
        <div className="page-container animate-fade-in">
          <div className="text-center text-red-500">
            <h2 className="text-xl font-semibold">Error loading data</h2>
            <p>{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout hideNavigation>
      <div className="page-container space-y-6 animate-fade-in">
        <div className="mb-2">
          <h1 className="page-title">Fitness Coach</h1>
          <p className="page-subtitle">
            Conversational AI coaching with automatic nutrition and activity tracking
          </p>
        </div>

        <FitnessSnapshot
          goal={goal}
          caloriesIn={dailyMetric.caloriesConsumed}
          caloriesOut={dailyMetric.caloriesBurned}
          proteinIntake={dailyMetric.proteinIntake}
          proteinTarget={goals?.targets.protein || 150}
          carbsIntake={dailyMetric.carbsIntake || dailyStats.intakeCarbs}
          carbsTarget={goals ? Math.round(goals.targets.calories * 0.45 / 4) : 225}
          fatsIntake={dailyMetric.fatIntake || dailyStats.intakeFats}
          fatsTarget={goals ? Math.round(goals.targets.calories * 0.25 / 9) : 55}
          workoutMinutes={dailyMetric.workoutMinutes}
          workoutTarget={goals?.targets.workoutMinutes || 30}
          streak={dailyMetric.streakCount}
          fitnessScore={dailyMetric.fitnessScore}
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="h-[500px]">
              <FitnessCoachChat
                messages={chatMessages}
                isSubmitting={isCommandSubmitting}
                onSendMessage={handleFitnessChat}
              />
            </div>

            <TodayTimeline
              items={timelineItems}
              waterIntake={waterIntakeGlasses}
              waterTarget={waterTargetGlasses}
              onAddWater={handleAddWater}
            />

            <FitnessAnalytics
              endDate={today}
              refreshKey={analyticsRefreshKey}
              calorieTarget={goals?.targets.calories || 2000}
            />
          </div>

          <div className="space-y-6">
            <SmartGoals
              goal={goal}
              onGoalChange={handleGoalChange}
              caloriesIn={dailyMetric.caloriesConsumed}
              caloriesTarget={goals?.targets.calories || 2000}
              proteinIntake={dailyMetric.proteinIntake}
              proteinTarget={goals?.targets.protein || 150}
              workoutMinutes={dailyMetric.workoutMinutes}
              workoutTarget={goals?.targets.workoutMinutes || 30}
              waterIntake={waterIntakeGlasses}
              waterTarget={waterTargetGlasses}
              sleepHours={dailyMetric.sleepHours}
              sleepTarget={goals?.targets.sleepHours || 8}
              recoveryScore={dailyMetric.recoveryScore}
            />

            {insights && insights.insights?.coachInsights.length > 0 && (
              <CoachInsights
                proteinIntake={dailyMetric.proteinIntake}
                proteinTarget={goals?.targets.protein || 150}
                caloriesIn={dailyMetric.caloriesConsumed}
                caloriesTarget={goals?.targets.calories || 2000}
                workoutMinutes={dailyMetric.workoutMinutes}
                streak={dailyMetric.streakCount}
                recoveryScore={dailyMetric.recoveryScore}
                waterIntake={waterIntakeGlasses}
                waterTarget={waterTargetGlasses}
              />
            )}

            {recovery && recovery.scores && (
              <RecoveryHealth
                recoveryScore={recovery.scores.recoveryScore}
                sleepQuality={
                  recovery.scores.sleepQuality > 7
                    ? "good"
                    : recovery.scores.sleepQuality > 5
                      ? "fair"
                      : "poor"
                }
                sleepHours={dailyMetric.sleepHours}
                hydrationLevel={recovery.scores.hydrationLevel}
                muscleSoreness={
                  (recovery.signals?.muscleSoreness || 5) > 7
                    ? "severe"
                    : (recovery.signals?.muscleSoreness || 5) > 4
                      ? "moderate"
                      : "light"
                }
                stressLevel={
                  (recovery.signals?.stressLevel || 5) > 7
                    ? "high"
                    : (recovery.signals?.stressLevel || 5) > 4
                      ? "moderate"
                      : "low"
                }
                restingHeartRate={recovery.signals?.restingHeartRate || 60}
                injuryNotes={recovery.signals?.injuryNotes ? [recovery.signals.injuryNotes] : []}
              />
            )}

            <MealPlanSuggestions goal={goal} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FitnessCoachPage;
