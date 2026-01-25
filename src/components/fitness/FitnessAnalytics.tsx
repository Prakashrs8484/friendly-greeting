import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from "recharts";

const weeklyCaloriesData = [
  { day: "Mon", consumed: 1850, burned: 450, target: 2000 },
  { day: "Tue", consumed: 2100, burned: 380, target: 2000 },
  { day: "Wed", consumed: 1950, burned: 520, target: 2000 },
  { day: "Thu", consumed: 2200, burned: 400, target: 2000 },
  { day: "Fri", consumed: 1800, burned: 600, target: 2000 },
  { day: "Sat", consumed: 2300, burned: 300, target: 2000 },
  { day: "Sun", consumed: 1900, burned: 450, target: 2000 },
];

const weeklyProteinData = [
  { day: "Mon", protein: 125, target: 140 },
  { day: "Tue", protein: 142, target: 140 },
  { day: "Wed", protein: 118, target: 140 },
  { day: "Thu", protein: 155, target: 140 },
  { day: "Fri", protein: 130, target: 140 },
  { day: "Sat", protein: 95, target: 140 },
  { day: "Sun", protein: 138, target: 140 },
];

const weeklyWorkoutsData = [
  { day: "Mon", duration: 45, type: "Strength" },
  { day: "Tue", duration: 30, type: "Cardio" },
  { day: "Wed", duration: 60, type: "Strength" },
  { day: "Thu", duration: 0, type: "Rest" },
  { day: "Fri", duration: 45, type: "HIIT" },
  { day: "Sat", duration: 20, type: "Yoga" },
  { day: "Sun", duration: 40, type: "Cardio" },
];

const deficitData = [
  { day: "Mon", deficit: -400 },
  { day: "Tue", deficit: -280 },
  { day: "Wed", deficit: -570 },
  { day: "Thu", deficit: -200 },
  { day: "Fri", deficit: -800 },
  { day: "Sat", deficit: 0 },
  { day: "Sun", deficit: -550 },
];

interface FitnessAnalyticsProps {
  period?: "today" | "week" | "month";
}

export function FitnessAnalytics({ period = "week" }: FitnessAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("calories");

  const avgCalories = Math.round(weeklyCaloriesData.reduce((sum, d) => sum + d.consumed, 0) / 7);
  const avgProtein = Math.round(weeklyProteinData.reduce((sum, d) => sum + d.protein, 0) / 7);
  const totalWorkoutDays = weeklyWorkoutsData.filter(d => d.duration > 0).length;
  const avgDeficit = Math.round(deficitData.reduce((sum, d) => sum + d.deficit, 0) / 7);

  return (
    <Card className="card-glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-primary" />
            Analytics
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Avg {avgCalories} cal/day
            </Badge>
            <Badge 
              variant="outline" 
              className="text-xs bg-success/10 text-success border-success/20"
            >
              <TrendingDown className="w-3 h-3 mr-1" />
              {Math.abs(avgDeficit)} cal deficit
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="calories" className="text-xs">Calories</TabsTrigger>
            <TabsTrigger value="protein" className="text-xs">Protein</TabsTrigger>
            <TabsTrigger value="workouts" className="text-xs">Workouts</TabsTrigger>
            <TabsTrigger value="deficit" className="text-xs">Deficit</TabsTrigger>
          </TabsList>

          <TabsContent value="calories" className="mt-0">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weeklyCaloriesData}>
                <defs>
                  <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBurned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="consumed" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#colorConsumed)"
                  strokeWidth={2}
                  name="Consumed"
                />
                <Area 
                  type="monotone" 
                  dataKey="burned" 
                  stroke="hsl(var(--success))" 
                  fill="url(#colorBurned)"
                  strokeWidth={2}
                  name="Burned"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5" 
                  strokeWidth={1}
                  name="Target"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="protein" className="mt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyProteinData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="protein" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  name="Protein (g)"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  name="Target"
                  dot={false}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 text-center">
              <Badge variant="outline" className={avgProtein >= 140 ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}>
                {avgProtein >= 140 ? "✓" : "↓"} Avg {avgProtein}g/day
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="workouts" className="mt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyWorkoutsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value, name, props) => [
                    `${value} min`,
                    props.payload.type
                  ]}
                />
                <Bar 
                  dataKey="duration" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                  name="Duration (min)"
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 text-center">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                {totalWorkoutDays}/7 workout days
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="deficit" className="mt-0">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={deficitData}>
                <defs>
                  <linearGradient id="colorDeficit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value} cal`, value < 0 ? "Deficit" : "Surplus"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="deficit" 
                  stroke="hsl(142 71% 45%)" 
                  fill="url(#colorDeficit)"
                  strokeWidth={2}
                  name="Calorie Balance"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-3 text-center">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                Weekly deficit: {Math.abs(avgDeficit * 7)} cal (~{(Math.abs(avgDeficit * 7) / 7700).toFixed(1)} kg)
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default FitnessAnalytics;
