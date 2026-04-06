import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as fitnessApi from "@/lib/fitnessApi";

interface FitnessAnalyticsProps {
  endDate: string;
  refreshKey?: number;
  calorieTarget?: number;
}

function formatDayLabel(dateKey: string) {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

export function FitnessAnalytics({
  endDate,
  refreshKey = 0,
  calorieTarget = 2000,
}: FitnessAnalyticsProps) {
  const [activeTab, setActiveTab] = useState("calories");
  const [analytics, setAnalytics] = useState<fitnessApi.WeeklyAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fitnessApi.getWeeklyAnalytics(endDate);
        if (!isMounted) return;
        setAnalytics(response);
      } catch (err) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Failed to load analytics";
        setError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [endDate, refreshKey]);

  const calorieChartData = useMemo(
    () =>
      (analytics?.daily || []).map((metric) => ({
        day: formatDayLabel(metric.dateKey),
        consumed: metric.caloriesConsumed || 0,
        burned: metric.caloriesBurned || 0,
        target: calorieTarget,
      })),
    [analytics, calorieTarget]
  );

  const proteinChartData = useMemo(
    () =>
      (analytics?.daily || []).map((metric) => ({
        day: formatDayLabel(metric.dateKey),
        protein: metric.proteinIntake || 0,
      })),
    [analytics]
  );

  const workoutChartData = useMemo(
    () =>
      (analytics?.daily || []).map((metric) => ({
        day: formatDayLabel(metric.dateKey),
        duration: metric.workoutMinutes || 0,
      })),
    [analytics]
  );

  const deficitChartData = useMemo(
    () =>
      (analytics?.deficitSurplus || []).map((point) => ({
        day: formatDayLabel(point.dateKey),
        deficit: point.deficit || 0,
      })),
    [analytics]
  );

  const avgCalories = analytics?.weekly?.averageCaloriesConsumed || 0;
  const avgProtein = analytics?.weekly?.averageProtein || 0;
  const workoutDays = workoutChartData.filter((item) => item.duration > 0).length;
  const avgDeficit = Math.round(
    (analytics?.deficitSurplus || []).reduce((sum, point) => sum + (point.deficit || 0), 0) /
      Math.max((analytics?.deficitSurplus || []).length, 1)
  );

  if (loading && !analytics) {
    return (
      <Card className="card-glass">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Loading analytics...
        </CardContent>
      </Card>
    );
  }

  if (error && !analytics) {
    return (
      <Card className="card-glass">
        <CardContent className="py-8 text-center text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-5 w-5 text-primary" />
            Analytics
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              Avg {avgCalories} cal/day
            </Badge>
            <Badge
              variant="outline"
              className="text-xs border-success/20 bg-success/10 text-success"
            >
              {avgDeficit >= 0 ? (
                <TrendingDown className="mr-1 h-3 w-3" />
              ) : (
                <TrendingUp className="mr-1 h-3 w-3" />
              )}
              {Math.abs(avgDeficit)} cal {avgDeficit >= 0 ? "deficit" : "surplus"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="calories" className="text-xs">
              Calories
            </TabsTrigger>
            <TabsTrigger value="protein" className="text-xs">
              Protein
            </TabsTrigger>
            <TabsTrigger value="workouts" className="text-xs">
              Workouts
            </TabsTrigger>
            <TabsTrigger value="deficit" className="text-xs">
              Deficit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calories" className="mt-0">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={calorieChartData}>
                <defs>
                  <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBurned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
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
                  dot={false}
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="protein" className="mt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={proteinChartData}>
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
                <Bar dataKey="protein" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 text-center">
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                Avg {avgProtein}g/day
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="workouts" className="mt-0">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={workoutChartData}>
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
                  formatter={(value: number) => [`${value} min`, "Workout"]}
                />
                <Bar dataKey="duration" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 text-center">
              <Badge variant="outline" className="border-success/20 bg-success/10 text-success">
                {workoutDays}/7 workout days
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="deficit" className="mt-0">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={deficitChartData}>
                <defs>
                  <linearGradient id="colorDeficit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
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
                  formatter={(value: number) => [
                    `${Math.abs(value)} cal`,
                    value >= 0 ? "Deficit" : "Surplus",
                  ]}
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
              <Badge variant="outline" className="border-success/20 bg-success/10 text-success">
                Weekly {avgDeficit >= 0 ? "deficit" : "surplus"}: {Math.abs(avgDeficit * 7)} cal
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default FitnessAnalytics;
