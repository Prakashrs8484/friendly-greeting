import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChefHat, ChevronDown, Sparkles, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

type FitnessGoal = "fat_loss" | "muscle_gain" | "maintenance";

interface MealSuggestion {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  estimatedCost: string;
  prepTime: string;
  ingredients: string[];
}

interface MealPlanSuggestionsProps {
  goal: FitnessGoal;
}

const mealSuggestionsByGoal: Record<FitnessGoal, MealSuggestion[]> = {
  fat_loss: [
    {
      id: "fl1",
      mealType: "breakfast",
      name: "Egg White Bhurji with Roti",
      description: "High protein, low fat breakfast to kickstart your day",
      calories: 280,
      protein: 22,
      carbs: 30,
      fats: 6,
      estimatedCost: "₹40",
      prepTime: "15 min",
      ingredients: ["4 egg whites", "1 whole wheat roti", "onion", "tomato", "green chilli", "coriander"],
    },
    {
      id: "fl2",
      mealType: "lunch",
      name: "Grilled Chicken Salad",
      description: "Lean protein with fiber-rich vegetables",
      calories: 350,
      protein: 35,
      carbs: 20,
      fats: 14,
      estimatedCost: "₹120",
      prepTime: "20 min",
      ingredients: ["150g chicken breast", "mixed greens", "cucumber", "tomato", "lemon dressing"],
    },
    {
      id: "fl3",
      mealType: "dinner",
      name: "Moong Dal Khichdi",
      description: "Light, easy to digest, perfect for fat loss",
      calories: 320,
      protein: 15,
      carbs: 50,
      fats: 6,
      estimatedCost: "₹35",
      prepTime: "25 min",
      ingredients: ["½ cup moong dal", "½ cup rice", "ghee", "cumin", "turmeric"],
    },
  ],
  muscle_gain: [
    {
      id: "mg1",
      mealType: "breakfast",
      name: "Paneer Paratha with Curd",
      description: "High protein vegetarian power breakfast",
      calories: 550,
      protein: 28,
      carbs: 55,
      fats: 22,
      estimatedCost: "₹60",
      prepTime: "20 min",
      ingredients: ["100g paneer", "2 whole wheat parathas", "1 cup curd", "pickle"],
    },
    {
      id: "mg2",
      mealType: "lunch",
      name: "Chicken Biryani",
      description: "Complete meal with protein and carbs for muscle growth",
      calories: 650,
      protein: 35,
      carbs: 70,
      fats: 20,
      estimatedCost: "₹150",
      prepTime: "45 min",
      ingredients: ["200g chicken", "1 cup basmati rice", "spices", "yogurt marinade", "onions"],
    },
    {
      id: "mg3",
      mealType: "snack",
      name: "Protein Smoothie",
      description: "Post-workout recovery shake",
      calories: 400,
      protein: 35,
      carbs: 45,
      fats: 10,
      estimatedCost: "₹80",
      prepTime: "5 min",
      ingredients: ["1 scoop protein powder", "1 banana", "1 cup milk", "2 tbsp peanut butter", "oats"],
    },
  ],
  maintenance: [
    {
      id: "m1",
      mealType: "breakfast",
      name: "Poha with Peanuts",
      description: "Traditional balanced breakfast",
      calories: 350,
      protein: 10,
      carbs: 50,
      fats: 12,
      estimatedCost: "₹30",
      prepTime: "15 min",
      ingredients: ["1 cup poha", "peanuts", "onion", "curry leaves", "lemon"],
    },
    {
      id: "m2",
      mealType: "lunch",
      name: "Dal Rice with Sabzi",
      description: "Classic Indian balanced meal",
      calories: 500,
      protein: 18,
      carbs: 65,
      fats: 15,
      estimatedCost: "₹50",
      prepTime: "30 min",
      ingredients: ["1 cup dal", "1 cup rice", "mixed vegetable sabzi", "ghee", "salad"],
    },
    {
      id: "m3",
      mealType: "dinner",
      name: "Roti, Dal, Sabzi",
      description: "Light and nutritious dinner",
      calories: 400,
      protein: 15,
      carbs: 55,
      fats: 12,
      estimatedCost: "₹45",
      prepTime: "25 min",
      ingredients: ["2 rotis", "dal tadka", "seasonal vegetable", "salad"],
    },
  ],
};

const workoutSuggestions = [
  { name: "Push Day (Chest, Shoulders, Triceps)", duration: "45-60 min", exercises: ["Bench Press", "Shoulder Press", "Tricep Dips", "Push-ups"] },
  { name: "Pull Day (Back, Biceps)", duration: "45-60 min", exercises: ["Deadlift", "Rows", "Pull-ups", "Bicep Curls"] },
  { name: "Leg Day", duration: "50-60 min", exercises: ["Squats", "Lunges", "Leg Press", "Calf Raises"] },
  { name: "HIIT Cardio", duration: "20-30 min", exercises: ["Burpees", "Mountain Climbers", "Jump Squats", "High Knees"] },
];

const budgetSwaps = [
  { expensive: "Chicken Breast", budget: "Eggs (6 eggs = similar protein)", savings: "₹80-100" },
  { expensive: "Protein Powder", budget: "Sattu + Curd", savings: "₹150-200" },
  { expensive: "Salmon", budget: "Rohu/Katla Fish", savings: "₹200-300" },
  { expensive: "Almonds", budget: "Peanuts", savings: "₹400-500/kg" },
  { expensive: "Oats", budget: "Daliya (Broken Wheat)", savings: "₹50-80" },
];

export function MealPlanSuggestions({ goal }: MealPlanSuggestionsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const meals = mealSuggestionsByGoal[goal];

  const sections = [
    { id: "meals", title: "AI Meal Plan", icon: ChefHat },
    { id: "workouts", title: "Workout Split", icon: ChefHat },
    { id: "budget", title: "Budget-Friendly Swaps", icon: IndianRupee },
  ];

  return (
    <div className="space-y-3">
      {/* Meal Plan */}
      <Collapsible 
        open={expandedSection === "meals"} 
        onOpenChange={(open) => setExpandedSection(open ? "meals" : null)}
      >
        <Card className="card-glass overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-secondary/20 transition-colors pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ChefHat className="w-5 h-5 text-primary" />
                  AI-Generated Indian Meal Plan
                </CardTitle>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  expandedSection === "meals" && "rotate-180"
                )} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              {meals.map((meal) => (
                <div 
                  key={meal.id}
                  className="p-3 rounded-xl bg-secondary/30 border border-border/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Badge variant="outline" className="text-[10px] mb-1">
                        {meal.mealType.toUpperCase()}
                      </Badge>
                      <h4 className="font-medium text-sm">{meal.name}</h4>
                      <p className="text-xs text-muted-foreground">{meal.description}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {meal.calories} cal
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
                    <span>P: {meal.protein}g</span>
                    <span>•</span>
                    <span>C: {meal.carbs}g</span>
                    <span>•</span>
                    <span>F: {meal.fats}g</span>
                    <span>•</span>
                    <span>{meal.prepTime}</span>
                    <span>•</span>
                    <span className="text-success">{meal.estimatedCost}</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                <Sparkles className="w-3 h-3 mr-2" />
                Regenerate Plan
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Workout Split */}
      <Collapsible 
        open={expandedSection === "workouts"} 
        onOpenChange={(open) => setExpandedSection(open ? "workouts" : null)}
      >
        <Card className="card-glass overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-secondary/20 transition-colors pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Workout Split Suggestions
                </CardTitle>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  expandedSection === "workouts" && "rotate-180"
                )} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-2">
              {workoutSuggestions.map((workout, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg bg-secondary/30 border border-border/50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{workout.name}</h4>
                    <Badge variant="outline" className="text-xs">{workout.duration}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {workout.exercises.join(" → ")}
                  </p>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Budget Swaps */}
      <Collapsible 
        open={expandedSection === "budget"} 
        onOpenChange={(open) => setExpandedSection(open ? "budget" : null)}
      >
        <Card className="card-glass overflow-hidden">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-secondary/20 transition-colors pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <IndianRupee className="w-5 h-5 text-success" />
                  Budget-Friendly Food Swaps
                </CardTitle>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  expandedSection === "budget" && "rotate-180"
                )} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-2">
              {budgetSwaps.map((swap, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg bg-success/5 border border-success/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground line-through">{swap.expensive}</p>
                      <p className="text-sm font-medium text-foreground">{swap.budget}</p>
                    </div>
                    <Badge className="bg-success/10 text-success border-success/20">
                      Save {swap.savings}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}

export default MealPlanSuggestions;
