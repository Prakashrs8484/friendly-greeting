// src/lib/fitnessApi.ts
// Fitness module API client with endpoints for dashboard, goals, recovery, insights, analytics, and data management

import { apiRequest } from "./apiService";

function toDateKey(value?: string): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date().toISOString().split("T")[0];
}

function createEmptyMetric(dateKey?: string): FitnessDailyMetric {
  return {
    dateKey: toDateKey(dateKey),
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

function createEmptyRecovery(date?: string): RecoveryData {
  const dateKey = toDateKey(date);
  return {
    success: true,
    date: dateKey,
    signals: null,
    metric: createEmptyMetric(dateKey),
    scores: {
      sleepQuality: 0,
      hydrationLevel: 0,
      trainingLoad: 0,
      recoveryScore: 0,
    },
    recommendations: [],
  };
}

function normalizeMetricEnvelope(payload: unknown): FitnessDailyMetric {
  if (!payload || typeof payload !== "object") return createEmptyMetric();
  const data = payload as { metric?: FitnessDailyMetric };
  return data.metric || (payload as FitnessDailyMetric);
}

// ============ TYPE DEFINITIONS ============

export interface FitnessDailyMetric {
  _id?: string;
  userId?: string;
  dateKey: string;
  caloriesConsumed: number;
  caloriesBurned: number;
  netCalories?: number;
  proteinIntake: number;
  carbsIntake?: number;
  fatIntake?: number;
  waterIntakeMl: number;
  workoutMinutes: number;
  sleepHours: number;
  recoveryScore: number;
  fitnessScore: number;
  streakCount: number;
  entryCount?: number;
  lastComputedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FitnessEntry {
  _id: string;
  userId?: string;
  entryType: "meal" | "workout" | "sleep" | "hydration" | "activity" | "recovery";
  subtype?: string;
  dateKey: string;
  timestamp: string;
  description?: string;
  source?: "manual" | "chat";
  aiEstimated?: boolean;
  // Meal fields
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  // Workout fields
  workoutType?: string;
  intensity?: string;
  caloriesBurned?: number;
  duration?: number;
  // Sleep fields
  startTime?: string;
  endTime?: string;
  sleepHours?: number;
  sleepQuality?: number;
  // Hydration fields
  volumeMl?: number;
  // Activity fields
  activityType?: string;
  steps?: number;
  // Recovery fields
  heartRateVariability?: number;
  restingHeartRate?: number;
  recoveryQuality?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FitnessGoal {
  _id?: string;
  userId?: string;
  goalMode: "fat_loss" | "muscle_gain" | "maintenance";
  targets: {
    calories: number;
    protein: number;
    water: number;
    workoutMinutes: number;
    sleepHours: number;
  };
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GoalProgress {
  success: boolean;
  date: string;
  goals: {
    calories: { current: number; target: number; remaining: number; percentage: number; exceeded: boolean };
    protein: { current: number; target: number; remaining: number; percentage: number; exceeded: boolean };
    water: { current: number; target: number; remaining: number; percentage: number; exceeded: boolean };
    workout: { current: number; target: number; remaining: number; percentage: number; exceeded: boolean };
    sleep: { current: number; target: number; remaining: number; percentage: number; exceeded: boolean };
  };
  allGoalsMet: boolean;
  goalsMetCount: number;
}

export interface RecoverySignal {
  _id?: string;
  userId?: string;
  dateKey: string;
  muscleSoreness: number; // 1-10
  stressLevel: number; // 1-10
  restingHeartRate: number;
  injuryNotes?: string;
  energyLevel?: number;
  moodScore?: number;
  createdAt?: string;
}

export interface RecoveryData {
  success: boolean;
  date: string;
  signals: RecoverySignal | null;
  metric: FitnessDailyMetric | null;
  scores: {
    sleepQuality: number;
    hydrationLevel: number;
    trainingLoad: number;
    recoveryScore: number;
  };
  recommendations: Array<{
    title: string;
    message: string;
    priority: "high" | "medium" | "low";
  }>;
}

export interface CoachInsight {
  title: string;
  message: string;
  category: "performance" | "nutrition" | "recovery" | "progress";
  priority: "high" | "medium" | "low";
}

export interface MealSuggestion {
  mealType: string;
  suggestion: string;
  reasoning: string;
  calorieTarget?: number;
}

export interface WorkoutSuggestion {
  suggestion: string;
  reasoning: string;
  estimatedDuration: number;
  estimatedCalories: number;
  intensity: "light" | "moderate" | "high";
}

export interface BudgetFoodSwap {
  original: string;
  suggestion: string;
  caloriesSaved: number;
  reasoning: string;
}

export interface AIInsights {
  success: boolean;
  date: string;
  insights: {
    coachInsights: CoachInsight[];
    mealSuggestions: MealSuggestion[];
    workoutSuggestions: WorkoutSuggestion[];
    budgetFoodSwaps: BudgetFoodSwap[];
  };
  cached?: boolean;
  aiUsed?: boolean;
}

export interface WeeklyAnalytics {
  success: boolean;
  period: { startDate: string; endDate: string; days: number };
  daily: FitnessDailyMetric[];
  weekly: {
    totalCaloriesConsumed: number;
    totalCaloriesBurned: number;
    totalProtein: number;
    totalWater: number;
    totalWorkoutMinutes: number;
    totalSleepHours: number;
    averageCaloriesConsumed: number;
    averageCaloriesBurned: number;
    averageProtein: number;
    averageWater: number;
    averageWorkoutMinutes: number;
    averageSleepHours: number;
    averageRecoveryScore: number;
    averageFitnessScore: number;
    daysWithLogging: number;
    consistencyPercent: number;
  };
  deficitSurplus: Array<{ dateKey: string; deficit: number; net: number }>;
  trends: {
    consumed: number[];
    burned: number[];
    protein: number[];
    workoutMinutes: number[];
    sleepHours: number[];
  };
}

export interface TrendAnalytics {
  success: boolean;
  period: { fromDate: string; toDate: string; dayCount: number };
  summary: {
    dayCount: number;
    daysWithLogging: number;
    consistencyPercent: number;
    totalCaloriesConsumed: number;
    totalCaloriesBurned: number;
    averageCaloriesConsumed: number;
    averageCaloriesBurned: number;
    averageRecoveryScore: number;
    averageFitnessScore: number;
    goalsMetTarget: {
      protein: string;
      proteinPercent: number;
      water: string;
      waterPercent: number;
      workout: string;
      workoutPercent: number;
      sleep: string;
      sleepPercent: number;
    };
  };
  daily: FitnessDailyMetric[];
  trends: {
    dates: string[];
    consumed: number[];
    burned: number[];
    protein: number[];
    workoutMinutes: number[];
    sleepHours: number[];
    water: number[];
    recoveryScore: number[];
    fitnessScore: number[];
  };
}

export interface DayResetResult {
  success: boolean;
  message: string;
  reset: {
    success: boolean;
    dateKey: string;
    deleted: { entryCount: number; byType?: Record<string, number>; metricRemoved: boolean };
    clearedPayload: Partial<FitnessDailyMetric> & { entries: FitnessEntry[] };
  };
}

export interface ChatInputPayload {
  text: string;
  date?: string;
  timestamp?: string;
}

export interface ChatInputResponse {
  success: boolean;
  rawText: string;
  parsedActions: Array<{
    actionType: string;
    extractedData: Record<string, unknown>;
    confidence: number;
    source: "rule" | "llm";
  }>;
  createdEntries: FitnessEntry[];
  updatedDashboard: FitnessDailyMetric;
  coachReply: string;
}

export interface FitnessCommandPayload {
  text: string;
  date?: string;
  timestamp?: string;
}

export interface FitnessCommandEvent {
  type: "meal_log" | "activity_log";
  rawText: string;
  timestamp: string;
  intakeCalories: number;
  burnedCalories: number;
  netCalories: number;
}

export interface FitnessCommandResponse {
  success: boolean;
  parsedCommand:
    | { type: "meal_log"; food: string; quantity: number; unit: string }
    | { type: "activity_log"; activity: string; duration: number; unit: string };
  event: FitnessCommandEvent;
  dailyStats: {
    _id?: string;
    userId?: string;
    dateKey: string;
    intakeCalories: number;
    burnedCalories: number;
    netCalories: number;
    mealCount: number;
    activityCount: number;
    lastUpdatedAt?: string;
  };
  dailyMetric: FitnessDailyMetric;
  dashboard: {
    today: FitnessDailyMetric | null;
    lastSevenDays: FitnessDailyMetric[];
    weeklyStats: Record<string, unknown>;
    currentStreak: number;
    progressTowardGoals: Record<string, unknown>;
    profile: Record<string, unknown>;
  };
  timeline: FitnessEntry[];
  weeklyAnalytics: WeeklyAnalytics | null;
  collectionsUpdated: {
    mealsCollection: string;
    activitiesCollection: string;
    dailyStatsCollection: string;
  };
}

export type FitnessChatEvent =
  | {
      type: "meal_log";
      food: string;
      quantity: number;
      unit: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    }
  | {
      type: "activity_log";
      activity: string;
      duration: number;
      food?: string;
      quantity?: number;
      unit: string;
      caloriesBurned: number;
      durationMinutes: number;
    };

export interface FitnessDailyStats {
  _id?: string;
  userId?: string;
  dateKey: string;
  intakeCalories: number;
  intakeProtein: number;
  intakeCarbs: number;
  intakeFats: number;
  burnedCalories: number;
  netCalories: number;
  deficitCalories: number;
  calorieTarget: number;
  mealCount: number;
  activityCount: number;
  lastUpdatedAt?: string;
}

export interface FitnessChatResponse {
  success: boolean;
  chatResponse: string;
  events: FitnessChatEvent[];
  updatedDailyStats: FitnessDailyStats;
  dailyMetric: FitnessDailyMetric;
  dashboard: {
    today: FitnessDailyMetric | null;
    lastSevenDays: FitnessDailyMetric[];
    weeklyStats: Record<string, unknown>;
    currentStreak: number;
    progressTowardGoals: Record<string, unknown>;
    profile: Record<string, unknown>;
  };
  timeline: FitnessEntry[];
  weeklyAnalytics: WeeklyAnalytics | null;
}

// ============ DASHBOARD & METRICS ============

export const getDashboard = () =>
  apiRequest<{
    success: boolean;
    dashboard: FitnessDailyMetric & { weeklyStats: Record<string, unknown> };
    lastUpdated: string;
  }>(
    "/api/fitness/dashboard"
  );

export const getDailyMetric = async (dateKey: string) => {
  const payload = await apiRequest<{ success: boolean; metric: FitnessDailyMetric | null }>(
    `/api/fitness/metric/${dateKey}`
  );
  return payload.metric || createEmptyMetric(dateKey);
};

export const recomputeMetrics = async (dateKey: string) => {
  const payload = await apiRequest<{ success: boolean; metric: FitnessDailyMetric }>(
    `/api/fitness/metric/recompute/${dateKey}`,
    {
      method: "POST",
    }
  );
  return normalizeMetricEnvelope(payload);
};

// ============ TIMELINE CRUD ============

export const getTimeline = (date: string) =>
  apiRequest<{ success: boolean; date: string; entries: FitnessEntry[] }>(
    `/api/fitness/timeline?date=${date}`
  );

export const createTimelineEntry = (data: Partial<FitnessEntry>) =>
  apiRequest<{ success: boolean; entry: FitnessEntry }>(
    "/api/fitness/timeline",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

export const updateTimelineEntry = (entryId: string, data: Partial<FitnessEntry>) =>
  apiRequest<{ success: boolean; entry: FitnessEntry }>(
    `/api/fitness/timeline/${entryId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );

export const deleteTimelineEntry = (entryId: string) =>
  apiRequest<{ success: boolean; message: string; deletedEntry: FitnessEntry }>(
    `/api/fitness/timeline/${entryId}`,
    {
      method: "DELETE",
    }
  );

// ============ CHAT INPUT ============

export const chatInput = (payload: ChatInputPayload) =>
  apiRequest<ChatInputResponse>("/api/fitness/chat/input", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fitnessCommand = (payload: FitnessCommandPayload) =>
  apiRequest<FitnessCommandResponse>("/api/fitness/command", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const fitnessChat = (payload: FitnessCommandPayload) =>
  apiRequest<FitnessChatResponse>("/api/fitness/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });

// ============ GOALS ============

export const getGoals = () =>
  apiRequest<{ success: boolean; goals: FitnessGoal }>(
    "/api/fitness/goals"
  );

export const updateGoals = (data: Partial<FitnessGoal>) =>
  apiRequest<{ success: boolean; goals: FitnessGoal }>(
    "/api/fitness/goals",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );

export const getGoalsProgress = (date: string) =>
  apiRequest<{ success: boolean; progress: GoalProgress }>(`/api/fitness/goals/progress?date=${date}`);

export const getDefaultTargets = (mode: "fat_loss" | "muscle_gain" | "maintenance") =>
  apiRequest<{ success: boolean; targets?: FitnessGoal["targets"]; defaults?: FitnessGoal["targets"] }>(
    `/api/fitness/goals/defaults?mode=${mode}`
  ).then((payload) => ({
    success: payload.success,
    targets: payload.targets || payload.defaults || {
      calories: 2000,
      protein: 150,
      water: 2000,
      workoutMinutes: 30,
      sleepHours: 8,
    },
  }));

// ============ RECOVERY ============

export const getRecoveryData = async (date: string) => {
  const payload = await apiRequest<
    | RecoveryData
    | {
        success: boolean;
        recovery?: Partial<RecoveryData> & {
          date?: string;
          dateKey?: string;
          components?: {
            sleepQuality?: number;
            hydrationLevel?: number;
            trainingLoad?: number;
          };
          recoveryScore?: number;
          metric?: FitnessDailyMetric | null;
        };
      }
  >(`/api/fitness/recovery?date=${date}`);

  if (payload && typeof payload === "object" && "recovery" in payload) {
    const wrapped = payload as {
      success: boolean;
      recovery?: Partial<RecoveryData> & {
        date?: string;
        dateKey?: string;
        components?: {
          sleepQuality?: number;
          hydrationLevel?: number;
          trainingLoad?: number;
        };
        recoveryScore?: number;
        metric?: FitnessDailyMetric | null;
      };
    };
    const recovery = wrapped.recovery;
    if (!recovery) return createEmptyRecovery(date);

    const componentScores = recovery.components || {};
    const normalizedScores = {
      ...createEmptyRecovery(date).scores,
      ...(recovery.scores || {}),
      sleepQuality:
        recovery.scores?.sleepQuality ?? componentScores.sleepQuality ?? createEmptyRecovery(date).scores.sleepQuality,
      hydrationLevel:
        recovery.scores?.hydrationLevel ??
        componentScores.hydrationLevel ??
        createEmptyRecovery(date).scores.hydrationLevel,
      trainingLoad:
        recovery.scores?.trainingLoad ?? componentScores.trainingLoad ?? createEmptyRecovery(date).scores.trainingLoad,
      recoveryScore:
        recovery.scores?.recoveryScore ??
        recovery.recoveryScore ??
        createEmptyRecovery(date).scores.recoveryScore,
    };

    return {
      ...createEmptyRecovery(recovery.date || recovery.dateKey || date),
      ...recovery,
      success: wrapped.success,
      date: recovery.date || recovery.dateKey || date,
      metric: recovery.metric || null,
      scores: normalizedScores,
      recommendations: Array.isArray(recovery.recommendations)
        ? recovery.recommendations.map((item) => ({
            title: (item as { title?: string; category?: string }).title ||
              (item as { category?: string }).category ||
              'Recovery Note',
            message: (item as { message?: string; action?: string }).message ||
              (item as { action?: string }).action ||
              'No recommendation details available.',
            priority: ((item as { priority?: string }).priority || 'medium') as
              | 'high'
              | 'medium'
              | 'low',
          }))
        : [],
    } as RecoveryData;
  }

  const direct = payload as RecoveryData;
  return {
    ...createEmptyRecovery(date),
    ...direct,
    date: direct.date || date,
    scores: {
      ...createEmptyRecovery(date).scores,
      ...(direct.scores || {}),
    },
    recommendations: Array.isArray(direct.recommendations) ? direct.recommendations : [],
  };
};

export const addRecoverySignals = (data: Omit<RecoverySignal, "_id" | "userId" | "createdAt">) =>
  apiRequest<{ success: boolean; signals: RecoverySignal }>(
    "/api/fitness/recovery/signals",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

export const getRecoveryTrend = (startDate: string, endDate: string) =>
  apiRequest<{ success: boolean; trend: RecoverySignal[] }>(
    `/api/fitness/recovery/trend?start=${startDate}&end=${endDate}`
  );

// ============ INSIGHTS ============

export const getInsights = async (date: string) => {
  const payload = await apiRequest<{
    success: boolean;
    date: string;
    cached?: boolean;
    aiUsed?: boolean;
    insights?: {
      coachInsights?: CoachInsight[];
      mealSuggestions?: MealSuggestion[];
      workoutSuggestions?: WorkoutSuggestion[];
      budgetFoodSwaps?: BudgetFoodSwap[];
    };
  }>(`/api/fitness/insights?date=${date}`);

  const insightNode = payload.insights || {};
  return {
    success: payload.success,
    date: payload.date || date,
    cached: payload.cached,
    aiUsed: payload.aiUsed,
    insights: {
      coachInsights: Array.isArray(insightNode.coachInsights) ? insightNode.coachInsights : [],
      mealSuggestions: Array.isArray(insightNode.mealSuggestions) ? insightNode.mealSuggestions : [],
      workoutSuggestions: Array.isArray(insightNode.workoutSuggestions)
        ? insightNode.workoutSuggestions
        : [],
      budgetFoodSwaps: Array.isArray(insightNode.budgetFoodSwaps)
        ? insightNode.budgetFoodSwaps
        : [],
    },
  } as AIInsights;
};

// ============ ANALYTICS ============

export const getWeeklyAnalytics = async (endDate: string) => {
  const response = await apiRequest<{ success: boolean; analytics: WeeklyAnalytics }>(
    `/api/fitness/analytics/weekly?endDate=${endDate}`
  );
  return response.analytics;
};

export const getTrendAnalytics = async (fromDate: string, toDate: string) => {
  const response = await apiRequest<{ success: boolean; analytics: TrendAnalytics }>(
    `/api/fitness/analytics/trends?from=${fromDate}&to=${toDate}`
  );
  return response.analytics;
};

// ============ DAY RESET ============

export const hardResetDay = (date: string) =>
  apiRequest<DayResetResult>("/api/fitness/day/reset", {
    method: "POST",
    body: JSON.stringify({ date }),
  });

export const softResetDay = (date: string) =>
  apiRequest<DayResetResult>("/api/fitness/day/soft-reset", {
    method: "POST",
    body: JSON.stringify({ date }),
  });

export const getDeletedEntries = (date: string) =>
  apiRequest<{ success: boolean; date: string; deletedCount: number; deleted: FitnessEntry[] }>(
    `/api/fitness/day/deleted?date=${date}`
  );

export const restoreDay = (date: string) =>
  apiRequest<{
    success: boolean;
    message: string;
    restored: { restored: { entryCount: number; metricRecomputed: boolean } };
  }>("/api/fitness/day/restore", {
    method: "POST",
    body: JSON.stringify({ date }),
  });

export const getResetHistory = (days: number = 30) =>
  apiRequest<{
    success: boolean;
    lookbackDays: number;
    totalResetDays: number;
    resetHistory: Array<{
      dateKey: string;
      deletedAt: string;
      entryCount: number;
      entryTypes: Record<string, number>;
    }>;
  }>(`/api/fitness/day/reset-history?days=${days}`);

export const purgeSoftDeleted = (olderThanDays: number = 30) =>
  apiRequest<{
    success: boolean;
    message: string;
    purge: {
      success: boolean;
      purged: { entryCount: number; olderThanDays: number; oldestEntryDate: string };
    };
  }>(`/api/fitness/day/purge-deleted?olderThanDays=${olderThanDays}`, {
    method: "DELETE",
  });
