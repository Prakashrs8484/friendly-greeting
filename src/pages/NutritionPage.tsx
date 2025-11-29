import { useState } from "react";
import { Apple, Droplet, Flame, TrendingUp, ChefHat, Clock, Plus, Target, BarChart3, Calendar, Utensils, Sparkles, CheckCircle2, Settings, Download } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import AIModuleCard from "@/components/AIModuleCard";
import AgentChat from "@/components/AgentChat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const NutritionPage = () => {
  const { toast } = useToast();
  const [mealDialogOpen, setMealDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [waterCount, setWaterCount] = useState(6);

  const handleLogMeal = () => {
    setMealDialogOpen(false);
    toast({
      title: "Meal Logged",
      description: "Nutrition data calculated and added to your daily intake.",
    });
  };

  const handleLogWater = () => {
    setWaterCount(prev => prev + 1);
    toast({
      title: "Water Logged",
      description: `${waterCount + 1} cups today. Stay hydrated!`,
    });
  };

  const handleChatMessage = (message: string) => {
    // AI agent processing logic
    console.log("Processing nutrition query:", message);
  };

  return (
    <DashboardLayout hideNavigation>
      <div className="page-container animate-fade-in">
        {/* Header with Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="page-title">
              Nutrition & Diet Workspace
            </h1>
            <p className="page-subtitle">Your personal nutrition lab powered by AI</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
          <Dialog open={mealDialogOpen} onOpenChange={setMealDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Log Meal</span>
                <span className="sm:hidden">Meal</span>
              </Button>
            </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Log Your Meal</DialogTitle>
                  <DialogDescription>Add ingredients and let AI calculate nutrition automatically</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Meal Type</Label>
                    <Select defaultValue="breakfast">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ingredients & Quantities</Label>
                    <Textarea 
                      placeholder="e.g., 6 eggs, 1 banana, 100g oats, 1 cup milk..."
                      className="min-h-[100px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">AI will automatically calculate nutritional values</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Meal Name (Optional)</Label>
                      <Input placeholder="e.g., Morning Power Bowl" />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input type="time" defaultValue="08:00" />
                    </div>
                  </div>
                  <Button onClick={handleLogMeal} className="w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Calculate & Log Meal
                  </Button>
                </div>
              </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleLogWater} className="gap-2">
            <Droplet className="w-4 h-4" />
            <span className="hidden sm:inline">Log Water</span>
            <span className="sm:hidden">Water</span>
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Export Report</span>
            <span className="md:hidden">Export</span>
          </Button>
          </div>
        </div>

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {nutritionOverview.map((stat, idx) => (
          <Card key={idx} className="card-hover card-glass">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={stat.status === "good" ? "default" : stat.status === "warning" ? "secondary" : "outline"} className="text-xs">
                        {stat.status === "good" ? "On Track" : stat.status === "warning" ? "Low" : "Over"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{stat.target}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <Progress value={stat.progress} className="mt-4 h-2" />
              </CardContent>
            </Card>
        ))}
      </div>

      {/* AI Summary Card */}
      <Card className="card-glass border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">AI Nutrition Insight</h3>
                <p className="text-sm text-muted-foreground">
                  You've met 85% of your protein goal today! You're low on fiber — consider adding some greens or whole grains to dinner. 
                  Your calorie intake is perfectly balanced with your fitness routine.
                </p>
              </div>
            </div>
          </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="workspace-grid">
        {/* Left Column - Chat & Meals (2/3) */}
        <div className="workspace-content-column">
            {/* AI Agent Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-primary" />
                  Nutrition Agent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <AgentChat
                    agentName="Nutrition Agent"
                    agentIcon={Apple}
                    placeholder="Ask me to plan meals, calculate macros, suggest recipes..."
                    onSendMessage={handleChatMessage}
                    initialMessages={[
                      {
                        role: "agent",
                        content: "Hi! I'm your AI Nutrition Agent. I can help you plan meals, track nutrients, suggest recipes, and optimize your diet based on your fitness goals. What would you like to work on today?",
                        timestamp: new Date(Date.now() - 60000),
                      },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Today's Meals */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Meals</CardTitle>
                    <CardDescription>Track what you've eaten today</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysMeals.map((meal, idx) => (
                    <Card key={idx} className="bg-secondary/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <meal.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground">{meal.name}</h4>
                              <p className="text-sm text-muted-foreground">{meal.time}</p>
                            </div>
                          </div>
                          <Badge>{meal.calories} cal</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground mb-3">
                          {meal.items.map((item, i) => (
                            <p key={i}>• {item}</p>
                          ))}
                        </div>
                        <div className="flex gap-6 text-xs">
                          <span className="text-muted-foreground">Protein: <span className="font-semibold text-foreground">{meal.protein}g</span></span>
                          <span className="text-muted-foreground">Carbs: <span className="font-semibold text-foreground">{meal.carbs}g</span></span>
                          <span className="text-muted-foreground">Fats: <span className="font-semibold text-foreground">{meal.fats}g</span></span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {todaysMeals.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No meals logged yet today</p>
                      <Button className="mt-4" onClick={() => setMealDialogOpen(true)}>
                        Log Your First Meal
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Meal Plan */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AI Meal Plan</CardTitle>
                    <CardDescription>Personalized weekly meal suggestions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Regenerate Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="today">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="week">This Week</TabsTrigger>
                    <TabsTrigger value="shopping">Shopping List</TabsTrigger>
                  </TabsList>
                  <TabsContent value="today" className="space-y-3 mt-4">
                    {mealPlanToday.map((meal, idx) => (
                      <Card key={idx} className="bg-secondary/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground">{meal.type}</h4>
                            <Badge variant="outline">{meal.calories} cal</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{meal.dish}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fats}g</span>
                            <Button variant="ghost" size="sm">Swap</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                  <TabsContent value="week" className="space-y-3 mt-4">
                    {weeklyMealPlan.map((day, idx) => (
                      <Card key={idx} className="bg-secondary/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground">{day.day}</h4>
                            <Badge variant="outline">{day.totalCalories} cal</Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>🍳 {day.breakfast}</p>
                            <p>🥗 {day.lunch}</p>
                            <p>🍽️ {day.dinner}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>
                  <TabsContent value="shopping" className="mt-4">
                    <div className="space-y-2">
                      {shoppingList.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30">
                          <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Nutrition Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="calories">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="calories">Calories</TabsTrigger>
                    <TabsTrigger value="macros">Macros</TabsTrigger>
                    <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                  </TabsList>
                  <TabsContent value="calories" className="mt-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={caloriesTrendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="consumed" stroke="hsl(var(--primary))" strokeWidth={2} name="Consumed" />
                        <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>
                  <TabsContent value="macros" className="mt-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={macrosTrendData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="day" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="protein" fill="hsl(var(--primary))" name="Protein (g)" />
                        <Bar dataKey="carbs" fill="hsl(142 76% 36%)" name="Carbs (g)" />
                        <Bar dataKey="fats" fill="hsl(24 95% 53%)" name="Fats (g)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </TabsContent>
                  <TabsContent value="breakdown" className="mt-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={macroBreakdownData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {macroBreakdownData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Goals & Stats (1/3) */}
          <div className="space-y-6 min-w-0">
            {/* Nutrient Goals */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Daily Goals</CardTitle>
                  <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Set Nutrition Goals</DialogTitle>
                        <DialogDescription>Customize your daily nutrient targets</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Fitness Objective</Label>
                          <Select defaultValue="muscle">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="muscle">Muscle Gain</SelectItem>
                              <SelectItem value="loss">Weight Loss</SelectItem>
                              <SelectItem value="maintain">Maintenance</SelectItem>
                              <SelectItem value="endurance">Endurance</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Daily Calories</Label>
                            <Input type="number" defaultValue="2500" />
                          </div>
                          <div>
                            <Label>Protein (g)</Label>
                            <Input type="number" defaultValue="150" />
                          </div>
                          <div>
                            <Label>Carbs (g)</Label>
                            <Input type="number" defaultValue="250" />
                          </div>
                          <div>
                            <Label>Fats (g)</Label>
                            <Input type="number" defaultValue="70" />
                          </div>
                        </div>
                        <Button className="w-full">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Save Goals
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {nutrientGoals.map((goal, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          goal.status === "good" ? "bg-green-500" :
                          goal.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                        }`} />
                        <span className="text-sm font-medium text-foreground">{goal.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {goal.current} / {goal.target}{goal.unit}
                      </span>
                    </div>
                    <Progress 
                      value={(goal.current / goal.target) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Current Goal Card */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Current Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-foreground">Muscle Gain</p>
                    <p className="text-sm text-muted-foreground">High protein, moderate carbs</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-background/50">
                      <p className="text-xs text-muted-foreground">Calories</p>
                      <p className="text-lg font-bold text-foreground">2500</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background/50">
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="text-lg font-bold text-foreground">150g</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background/50">
                      <p className="text-xs text-muted-foreground">Days</p>
                      <p className="text-lg font-bold text-foreground">12</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Water Intake */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-blue-500" />
                  Water Intake
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-foreground">{waterCount} cups</span>
                    <Badge variant="outline">Target: 8 cups</Badge>
                  </div>
                  <Progress value={(waterCount / 8) * 100} className="h-3" />
                  <Button variant="outline" className="w-full" onClick={handleLogWater}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Water
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <AIModuleCard
              title="Smart Recommendations"
              status="active"
              icon={Sparkles}
            >
              <div className="space-y-3">
                {aiRecommendations.map((rec, idx) => (
                  <Card key={idx} className="bg-secondary/30 border-none">
                    <CardContent className="p-3">
                      <p className="text-sm text-foreground font-medium mb-1">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AIModuleCard>

            {/* Weekly Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weekly Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {weeklySummary.map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                      <Badge variant={stat.trend === "up" ? "default" : "secondary"} className="text-xs">
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recipe Suggestions */}
            <AIModuleCard
              title="Recipe Suggestions"
              status="active"
              icon={ChefHat}
            >
              <div className="space-y-3">
                {recipeSuggestions.map((recipe, idx) => (
                  <Card key={idx} className="bg-secondary/20 border-none">
                    <CardContent className="p-3">
                      <h4 className="font-semibold text-foreground text-sm mb-1">{recipe.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{recipe.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {recipe.time}
                        </span>
                        <Badge variant="outline" className="text-xs">{recipe.macros}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AIModuleCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Mock Data
const nutritionOverview = [
  { label: "Calories Today", value: "1,850", target: "/ 2,500", progress: 74, status: "good", icon: Flame },
  { label: "Protein", value: "125g", target: "/ 150g", progress: 83, status: "good", icon: TrendingUp },
  { label: "Carbs", value: "210g", target: "/ 250g", progress: 84, status: "good", icon: Apple },
  { label: "Fats", value: "52g", target: "/ 70g", progress: 74, status: "good", icon: Droplet },
];

const todaysMeals = [
  {
    name: "Breakfast",
    time: "8:00 AM",
    icon: ChefHat,
    calories: 650,
    items: ["6 whole eggs", "2 slices whole wheat toast", "1 banana", "1 cup green tea"],
    protein: 42,
    carbs: 65,
    fats: 28,
  },
  {
    name: "Lunch",
    time: "1:00 PM",
    icon: Utensils,
    calories: 750,
    items: ["200g grilled chicken breast", "1 cup brown rice", "Mixed vegetables", "Olive oil dressing"],
    protein: 55,
    carbs: 80,
    fats: 15,
  },
  {
    name: "Snack",
    time: "4:00 PM",
    icon: Apple,
    calories: 200,
    items: ["Greek yogurt", "1 scoop protein powder", "Handful of almonds"],
    protein: 28,
    carbs: 15,
    fats: 9,
  },
];

const mealPlanToday = [
  { type: "Breakfast", dish: "Oatmeal with berries and protein powder", calories: 500, protein: 35, carbs: 60, fats: 12 },
  { type: "Lunch", dish: "Grilled salmon with quinoa and asparagus", calories: 650, protein: 45, carbs: 55, fats: 22 },
  { type: "Snack", dish: "Greek yogurt parfait with nuts", calories: 250, protein: 20, carbs: 25, fats: 8 },
  { type: "Dinner", dish: "Lean beef stir-fry with brown rice", calories: 700, protein: 50, carbs: 70, fats: 18 },
];

const weeklyMealPlan = [
  { day: "Monday", breakfast: "Oatmeal with berries", lunch: "Grilled chicken salad", dinner: "Salmon with quinoa", totalCalories: "2100" },
  { day: "Tuesday", breakfast: "Greek yogurt parfait", lunch: "Turkey wrap", dinner: "Lean beef stir-fry", totalCalories: "2050" },
  { day: "Wednesday", breakfast: "Protein smoothie", lunch: "Tuna poke bowl", dinner: "Chicken breast & veggies", totalCalories: "1980" },
  { day: "Thursday", breakfast: "Scrambled eggs & toast", lunch: "Quinoa Buddha bowl", dinner: "Grilled fish tacos", totalCalories: "2150" },
  { day: "Friday", breakfast: "Protein pancakes", lunch: "Chicken Caesar salad", dinner: "Steak with sweet potato", totalCalories: "2200" },
];

const shoppingList = [
  "6 dozen eggs",
  "2 lbs chicken breast",
  "1 lb salmon fillets",
  "Greek yogurt (32oz)",
  "Oats (2 lbs)",
  "Brown rice (5 lbs)",
  "Mixed berries",
  "Almonds & walnuts",
  "Spinach & kale",
  "Sweet potatoes",
  "Olive oil",
  "Protein powder",
];

const nutrientGoals = [
  { name: "Calories", current: 1850, target: 2500, unit: "", status: "good" },
  { name: "Protein", current: 125, target: 150, unit: "g", status: "good" },
  { name: "Carbs", current: 210, target: 250, unit: "g", status: "good" },
  { name: "Fats", current: 52, target: 70, unit: "g", status: "good" },
  { name: "Fiber", current: 18, target: 30, unit: "g", status: "warning" },
  { name: "Water", current: 6, target: 8, unit: " cups", status: "warning" },
];

const caloriesTrendData = [
  { day: "Mon", consumed: 2300, target: 2500 },
  { day: "Tue", consumed: 2450, target: 2500 },
  { day: "Wed", consumed: 2200, target: 2500 },
  { day: "Thu", consumed: 2550, target: 2500 },
  { day: "Fri", consumed: 2400, target: 2500 },
  { day: "Sat", consumed: 2350, target: 2500 },
  { day: "Sun", consumed: 1850, target: 2500 },
];

const macrosTrendData = [
  { day: "Mon", protein: 145, carbs: 240, fats: 68 },
  { day: "Tue", protein: 152, carbs: 255, fats: 72 },
  { day: "Wed", protein: 138, carbs: 220, fats: 65 },
  { day: "Thu", protein: 155, carbs: 265, fats: 75 },
  { day: "Fri", protein: 148, carbs: 245, fats: 70 },
  { day: "Sat", protein: 142, carbs: 235, fats: 68 },
  { day: "Sun", protein: 125, carbs: 210, fats: 52 },
];

const macroBreakdownData = [
  { name: "Protein", value: 125, color: "hsl(var(--primary))" },
  { name: "Carbs", value: 210, color: "hsl(142 76% 36%)" },
  { name: "Fats", value: 52, color: "hsl(24 95% 53%)" },
];

const aiRecommendations = [
  { title: "Add more fiber", description: "Try adding whole grains or legumes to reach your 30g daily fiber goal." },
  { title: "Hydration reminder", description: "You're 2 cups away from your water goal. Stay hydrated!" },
  { title: "Post-workout meal", description: "Based on your workout schedule, add a protein shake after your evening session." },
];

const weeklySummary = [
  { label: "Avg Daily Calories", value: "2,300", change: "+5%", trend: "up" },
  { label: "Protein Intake", value: "142g", change: "+8%", trend: "up" },
  { label: "Meal Consistency", value: "85%", change: "+12%", trend: "up" },
  { label: "Goal Achievement", value: "92%", change: "+3%", trend: "up" },
];

const recipeSuggestions = [
  { name: "High-Protein Smoothie Bowl", description: "Blend protein powder, berries, banana, spinach", time: "5 min", macros: "35P | 45C | 8F" },
  { name: "Chicken Meal Prep", description: "Grilled chicken with sweet potato and broccoli", time: "30 min", macros: "45P | 50C | 12F" },
  { name: "Energy Balls", description: "Oats, dates, almond butter, and protein powder", time: "10 min", macros: "8P | 22C | 6F" },
];

export default NutritionPage;
