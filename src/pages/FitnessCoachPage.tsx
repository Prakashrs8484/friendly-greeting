import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { FitnessSnapshot } from "@/components/fitness/FitnessSnapshot";
import { FitnessCoachChat } from "@/components/fitness/FitnessCoachChat";
import { TodayTimeline } from "@/components/fitness/TodayTimeline";
import { SmartGoals } from "@/components/fitness/SmartGoals";
import { CoachInsights } from "@/components/fitness/CoachInsights";
import { FitnessAnalytics } from "@/components/fitness/FitnessAnalytics";
import { RecoveryHealth } from "@/components/fitness/RecoveryHealth";
import { MealPlanSuggestions } from "@/components/fitness/MealPlanSuggestions";
import { useToast } from "@/hooks/use-toast";

type FitnessGoal = "fat_loss" | "muscle_gain" | "maintenance";

const FitnessCoachPage = () => {
  const { toast } = useToast();
  const [goal, setGoal] = useState<FitnessGoal>("fat_loss");
  const [waterIntake, setWaterIntake] = useState(5);
  
  // Simulated state - would come from backend
  const [dailyData, setDailyData] = useState({
    caloriesIn: 1450,
    caloriesOut: 1850,
    proteinIntake: 85,
    proteinTarget: 140,
    carbsIntake: 120,
    carbsTarget: 180,
    fatsIntake: 45,
    fatsTarget: 60,
    workoutMinutes: 35,
    workoutTarget: 45,
    streak: 12,
    fitnessScore: 78,
    sleepHours: 7,
    sleepTarget: 8,
    recoveryScore: 72,
  });

  const [timelineItems, setTimelineItems] = useState([
    { id: "1", type: "breakfast" as const, time: "08:30", title: "Breakfast", description: "2 idlis with sambar", calories: 180, protein: 6, carbs: 32, fats: 2, isAiEstimated: true },
    { id: "2", type: "workout" as const, time: "10:00", title: "Morning Workout", description: "Upper body strength", caloriesBurned: 280, duration: 35, isAiEstimated: false },
    { id: "3", type: "lunch" as const, time: "13:00", title: "Lunch", description: "Dal rice with chicken curry", calories: 650, protein: 42, carbs: 55, fats: 22, isAiEstimated: true },
    { id: "4", type: "snack" as const, time: "16:30", title: "Snack", description: "Greek yogurt with nuts", calories: 220, protein: 18, carbs: 12, fats: 10, isAiEstimated: true },
    { id: "5", type: "activity" as const, time: "19:00", title: "Evening Walk", description: "Post-dinner walk", caloriesBurned: 120, duration: 25, isAiEstimated: true },
  ]);

  const handleLogMeal = (data: { calories: number; protein: number; carbs: number; fats: number; description: string }) => {
    setDailyData(prev => ({
      ...prev,
      caloriesIn: prev.caloriesIn + data.calories,
      proteinIntake: prev.proteinIntake + data.protein,
      carbsIntake: prev.carbsIntake + data.carbs,
      fatsIntake: prev.fatsIntake + data.fats,
    }));
    const newItem = {
      id: Date.now().toString(),
      type: "snack" as const,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: "Meal Logged",
      description: data.description,
      calories: data.calories,
      protein: data.protein,
      carbs: data.carbs,
      fats: data.fats,
      isAiEstimated: true,
    };
    setTimelineItems(prev => [...prev, newItem]);
    toast({ title: "Meal logged!", description: `Added ${data.calories} cal, ${data.protein}g protein` });
  };

  const handleLogWorkout = (data: { caloriesBurned: number; duration: number; type: string }) => {
    setDailyData(prev => ({
      ...prev,
      caloriesOut: prev.caloriesOut + data.caloriesBurned,
      workoutMinutes: prev.workoutMinutes + data.duration,
    }));
    const newItem = {
      id: Date.now().toString(),
      type: "workout" as const,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: data.type,
      description: data.type,
      caloriesBurned: data.caloriesBurned,
      duration: data.duration,
      isAiEstimated: true,
    };
    setTimelineItems(prev => [...prev, newItem]);
    toast({ title: "Workout logged!", description: `Burned ${data.caloriesBurned} cal in ${data.duration} min` });
  };

  const handleLogActivity = (data: { caloriesBurned: number; duration: number; type: string }) => {
    setDailyData(prev => ({
      ...prev,
      caloriesOut: prev.caloriesOut + data.caloriesBurned,
    }));
    const newItem = {
      id: Date.now().toString(),
      type: "activity" as const,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      title: "Activity",
      description: data.type,
      caloriesBurned: data.caloriesBurned,
      duration: data.duration,
      isAiEstimated: true,
    };
    setTimelineItems(prev => [...prev, newItem]);
  };

  const handleAddWater = () => {
    setWaterIntake(prev => prev + 1);
    toast({ title: "Water logged", description: `${waterIntake + 1} glasses today` });
  };

  return (
    <DashboardLayout hideNavigation>
      <div className="page-container animate-fade-in space-y-6">
        {/* Header */}
        <div className="mb-2">
          <h1 className="page-title">Fitness Coach</h1>
          <p className="page-subtitle">Your AI-powered personal trainer, nutritionist & health advisor — all in one place</p>
        </div>

        {/* Fitness Snapshot */}
        <FitnessSnapshot
          goal={goal}
          caloriesIn={dailyData.caloriesIn}
          caloriesOut={dailyData.caloriesOut}
          proteinIntake={dailyData.proteinIntake}
          proteinTarget={dailyData.proteinTarget}
          carbsIntake={dailyData.carbsIntake}
          carbsTarget={dailyData.carbsTarget}
          fatsIntake={dailyData.fatsIntake}
          fatsTarget={dailyData.fatsTarget}
          workoutMinutes={dailyData.workoutMinutes}
          workoutTarget={dailyData.workoutTarget}
          streak={dailyData.streak}
          fitnessScore={dailyData.fitnessScore}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - AI Coach Chat (Center of attention) */}
          <div className="xl:col-span-2 space-y-6">
            {/* AI Fitness Coach - Main Panel */}
            <div className="h-[500px]">
              <FitnessCoachChat
                goal={goal}
                onLogMeal={handleLogMeal}
                onLogWorkout={handleLogWorkout}
                onLogActivity={handleLogActivity}
              />
            </div>

            {/* Today Timeline */}
            <TodayTimeline
              items={timelineItems}
              waterIntake={waterIntake}
              waterTarget={8}
              onAddWater={handleAddWater}
            />

            {/* Analytics */}
            <FitnessAnalytics />
          </div>

          {/* Right Column - Goals, Insights, Recovery */}
          <div className="space-y-6">
            {/* Smart Goals */}
            <SmartGoals
              goal={goal}
              onGoalChange={setGoal}
              caloriesIn={dailyData.caloriesIn}
              caloriesTarget={goal === "fat_loss" ? 1800 : goal === "muscle_gain" ? 2500 : 2000}
              proteinIntake={dailyData.proteinIntake}
              proteinTarget={dailyData.proteinTarget}
              workoutMinutes={dailyData.workoutMinutes}
              workoutTarget={dailyData.workoutTarget}
              waterIntake={waterIntake}
              waterTarget={8}
              sleepHours={dailyData.sleepHours}
              sleepTarget={dailyData.sleepTarget}
              recoveryScore={dailyData.recoveryScore}
            />

            {/* Coach Insights */}
            <CoachInsights
              proteinIntake={dailyData.proteinIntake}
              proteinTarget={dailyData.proteinTarget}
              caloriesIn={dailyData.caloriesIn}
              caloriesTarget={goal === "fat_loss" ? 1800 : 2200}
              workoutMinutes={dailyData.workoutMinutes}
              streak={dailyData.streak}
              recoveryScore={dailyData.recoveryScore}
              waterIntake={waterIntake}
              waterTarget={8}
            />

            {/* Recovery & Health */}
            <RecoveryHealth
              recoveryScore={dailyData.recoveryScore}
              sleepQuality="good"
              sleepHours={dailyData.sleepHours}
              hydrationLevel={(waterIntake / 8) * 100}
              muscleSoreness="light"
              stressLevel="moderate"
              restingHeartRate={62}
              injuryNotes={["Mild shoulder tightness from yesterday's workout"]}
            />

            {/* Collapsible Suggestions */}
            <MealPlanSuggestions goal={goal} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FitnessCoachPage;
