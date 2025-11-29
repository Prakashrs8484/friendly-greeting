import { useState } from "react";
import { 
  Moon, Sunrise, Zap, Target, CheckCircle2, Sparkles, Plus, 
  Calendar, TrendingUp, Heart, Brain, Coffee, Smile, Meh, Frown,
  Play, Pause, RotateCcw, BookOpen, Award, Settings, Download,
  Clock, Activity, Wind, Sun, CloudRain
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import AgentChat from "@/components/AgentChat";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LifestylePage = () => {
  const { toast } = useToast();
  const [habitDialogOpen, setHabitDialogOpen] = useState(false);
  const [moodDialogOpen, setMoodDialogOpen] = useState(false);
  const [reflectionDialogOpen, setReflectionDialogOpen] = useState(false);
  const [focusSessionActive, setFocusSessionActive] = useState(false);
  const [focusTime, setFocusTime] = useState(25 * 60); // 25 minutes in seconds
  const [moodLevel, setMoodLevel] = useState([7]);
  const [energyLevel, setEnergyLevel] = useState([7]);

  const handleLogHabit = () => {
    setHabitDialogOpen(false);
    toast({
      title: "Habit logged successfully",
      description: "Your streak has been updated!",
    });
  };

  const handleLogMood = () => {
    setMoodDialogOpen(false);
    toast({
      title: "Mood & energy logged",
      description: "Your patterns are being analyzed by the AI.",
    });
  };

  const handleLogReflection = () => {
    setReflectionDialogOpen(false);
    toast({
      title: "Reflection saved",
      description: "Your thoughts have been recorded.",
    });
  };

  const toggleFocusSession = () => {
    setFocusSessionActive(!focusSessionActive);
    if (!focusSessionActive) {
      toast({
        title: "Focus session started",
        description: "Stay focused for the next 25 minutes!",
      });
    }
  };

  const handleChatMessage = (message: string) => {
    console.log("User message:", message);
  };

  return (
    <DashboardLayout hideNavigation>
      <div className="page-container animate-fade-in">
        {/* Header with Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="page-title">
              Lifestyle & Productivity
            </h1>
            <p className="page-subtitle">Good Morning, Prakash 🌤 — Ready to make today balanced and productive?</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
          <Dialog open={habitDialogOpen} onOpenChange={setHabitDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Log Habit</span>
                <span className="sm:hidden">Habit</span>
              </Button>
            </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Habit Completion</DialogTitle>
                  <DialogDescription>
                    Mark a habit as complete for today
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="habit-select">Select Habit</Label>
                    <Select>
                      <SelectTrigger id="habit-select">
                        <SelectValue placeholder="Choose a habit" />
                      </SelectTrigger>
                      <SelectContent>
                        {habits.map((habit) => (
                          <SelectItem key={habit.id} value={habit.id}>
                            {habit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="habit-notes">Notes (Optional)</Label>
                    <Textarea id="habit-notes" placeholder="How did it go?" />
                  </div>
                  <Button onClick={handleLogHabit} className="w-full">
                    Complete Habit
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          <Dialog open={moodDialogOpen} onOpenChange={setMoodDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Log Mood</span>
                <span className="sm:hidden">Mood</span>
              </Button>
            </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>How are you feeling?</DialogTitle>
                  <DialogDescription>
                    Track your mood and energy levels
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  <div>
                    <Label>Mood Level</Label>
                    <div className="flex items-center justify-between mb-2">
                      <Frown className="w-5 h-5 text-destructive" />
                      <Meh className="w-5 h-5 text-muted-foreground" />
                      <Smile className="w-5 h-5 text-success" />
                    </div>
                    <Slider
                      value={moodLevel}
                      onValueChange={setMoodLevel}
                      max={10}
                      step={1}
                      className="mb-2"
                    />
                    <p className="text-sm text-center text-muted-foreground">{moodLevel[0]}/10</p>
                  </div>
                  <div>
                    <Label>Energy Level</Label>
                    <Slider
                      value={energyLevel}
                      onValueChange={setEnergyLevel}
                      max={10}
                      step={1}
                      className="mb-2"
                    />
                    <p className="text-sm text-center text-muted-foreground">{energyLevel[0]}/10</p>
                  </div>
                  <div>
                    <Label htmlFor="mood-notes">What's on your mind?</Label>
                    <Textarea id="mood-notes" placeholder="Optional notes..." />
                  </div>
                  <Button onClick={handleLogMood} className="w-full">
                    Save Mood Entry
                  </Button>
                </div>
              </DialogContent>
          </Dialog>

          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
          </div>
        </div>

      {/* Dashboard Overview */}
      <Card className="card-glass p-6 border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Today's Overview</h2>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Productivity Score: 87/100
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {overviewStats.map((stat, idx) => (
              <Card key={idx} className="p-4 bg-card/60 backdrop-blur">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`text-xs mt-1 ${stat.trend === 'up' ? 'text-success' : 'text-muted-foreground'}`}>
                  {stat.change}
                </p>
              </Card>
            ))}
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="workspace-grid">
        {/* Left Column - 2/3 width */}
        <div className="workspace-content-column">
            {/* AI Agent Chat */}
            <Card className="p-4 h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Lifestyle Agent</h3>
                    <p className="text-xs text-muted-foreground">Your personal growth companion</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                  Active
                </Badge>
              </div>
              <div className="flex-1 overflow-hidden">
                <AgentChat
                  agentName="Lifestyle Agent"
                  agentIcon={Sparkles}
                  placeholder="Ask about habits, routines, productivity..."
                  onSendMessage={handleChatMessage}
                  initialMessages={[
                    {
                      role: "agent",
                      content: "Good morning! 🌤 You've been consistent with your morning meditation for 18 days — amazing! Ready to tackle today's goals?",
                      timestamp: new Date(Date.now() - 60000),
                    },
                  ]}
                />
              </div>
            </Card>

            {/* Smart Habit Tracker */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Smart Habit Tracker</h3>
                  <p className="text-sm text-muted-foreground">Track your daily habits and build consistency</p>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Habit
                </Button>
              </div>

              <div className="space-y-3">
                {habits.map((habit) => (
                  <Card key={habit.id} className="p-4 bg-secondary/20">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${habit.completed ? 'bg-success/20' : 'bg-muted'}`}>
                          <habit.icon className={`w-4 h-4 ${habit.completed ? 'text-success' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{habit.name}</h4>
                          <p className="text-xs text-muted-foreground">{habit.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              🔥 {habit.streak} day streak
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {habit.frequency}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant={habit.completed ? "outline" : "default"}
                      >
                        {habit.completed ? <CheckCircle2 className="w-4 h-4" /> : "Complete"}
                      </Button>
                    </div>
                    <Progress value={habit.completionRate} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {habit.completionRate}% completion this week
                    </p>
                  </Card>
                ))}
              </div>

              <Card className="p-4 bg-primary/5 border-primary/20 mt-4">
                <h4 className="font-semibold text-foreground mb-2">Habit Analytics</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">80%</p>
                    <p className="text-xs text-muted-foreground">Weekly completion</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">Wednesday</p>
                    <p className="text-xs text-muted-foreground">Most consistent</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">4</p>
                    <p className="text-xs text-muted-foreground">Active habits</p>
                  </div>
                </div>
              </Card>
            </Card>

            {/* Daily Routine Planner */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Daily Routine</h3>
                  <p className="text-sm text-muted-foreground">Your optimized schedule for today</p>
                </div>
                <Button size="sm" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Adjust
                </Button>
              </div>

              <Tabs defaultValue="morning" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="morning">Morning</TabsTrigger>
                  <TabsTrigger value="afternoon">Afternoon</TabsTrigger>
                  <TabsTrigger value="evening">Evening</TabsTrigger>
                  <TabsTrigger value="night">Night</TabsTrigger>
                </TabsList>

                <TabsContent value="morning" className="space-y-2 mt-4">
                  {morningRoutine.map((activity, idx) => (
                    <Card key={idx} className="p-3 bg-secondary/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant={activity.completed ? "default" : "outline"} className="text-xs">
                            {activity.time}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium text-foreground">{activity.activity}</p>
                            <p className="text-xs text-muted-foreground">{activity.duration}</p>
                          </div>
                        </div>
                        {activity.completed && <CheckCircle2 className="w-4 h-4 text-success" />}
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="afternoon" className="space-y-2 mt-4">
                  {afternoonRoutine.map((activity, idx) => (
                    <Card key={idx} className="p-3 bg-secondary/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">{activity.time}</Badge>
                          <div>
                            <p className="text-sm font-medium text-foreground">{activity.activity}</p>
                            <p className="text-xs text-muted-foreground">{activity.duration}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="evening" className="space-y-2 mt-4">
                  {eveningRoutine.map((activity, idx) => (
                    <Card key={idx} className="p-3 bg-secondary/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">{activity.time}</Badge>
                          <div>
                            <p className="text-sm font-medium text-foreground">{activity.activity}</p>
                            <p className="text-xs text-muted-foreground">{activity.duration}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="night" className="space-y-2 mt-4">
                  {nightRoutine.map((activity, idx) => (
                    <Card key={idx} className="p-3 bg-secondary/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">{activity.time}</Badge>
                          <div>
                            <p className="text-sm font-medium text-foreground">{activity.activity}</p>
                            <p className="text-xs text-muted-foreground">{activity.duration}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </Card>

            {/* Productivity Analytics */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Productivity & Focus Trends</h3>
              <Tabs defaultValue="habits" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="habits">Habits</TabsTrigger>
                  <TabsTrigger value="mood">Mood</TabsTrigger>
                  <TabsTrigger value="focus">Focus</TabsTrigger>
                </TabsList>

                <TabsContent value="habits" className="mt-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={habitTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Legend />
                      <Line type="monotone" dataKey="completion" stroke="hsl(var(--primary))" strokeWidth={2} name="Habit Completion %" />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="mood" className="mt-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={moodTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" domain={[0, 10]} />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Legend />
                      <Line type="monotone" dataKey="mood" stroke="hsl(var(--success))" strokeWidth={2} name="Mood Level" />
                      <Line type="monotone" dataKey="energy" stroke="hsl(var(--primary))" strokeWidth={2} name="Energy Level" />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="focus" className="mt-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={focusTrendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                      <Legend />
                      <Bar dataKey="minutes" fill="hsl(var(--primary))" name="Focus Minutes" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6 min-w-0">
            {/* Focus Timer */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Focus Session</h3>
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="text-center py-6">
                <p className="text-5xl font-bold text-foreground mb-2">
                  {Math.floor(focusTime / 60)}:{(focusTime % 60).toString().padStart(2, '0')}
                </p>
                <p className="text-sm text-muted-foreground mb-4">Pomodoro Timer</p>
                <div className="flex items-center justify-center gap-2">
                  <Button 
                    onClick={toggleFocusSession}
                    variant={focusSessionActive ? "outline" : "default"}
                  >
                    {focusSessionActive ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="icon">
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Card className="p-3 bg-card/60 backdrop-blur mt-4">
                <p className="text-xs text-muted-foreground mb-2">Today's Focus Stats</p>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-foreground">3</p>
                    <p className="text-xs text-muted-foreground">Sessions</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-primary">75</p>
                    <p className="text-xs text-muted-foreground">Minutes</p>
                  </div>
                </div>
              </Card>
            </Card>

            {/* Mood & Energy Tracker */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Mood & Energy</h3>
                <Button size="sm" variant="outline" onClick={() => setMoodDialogOpen(true)}>
                  Log
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Current Mood</span>
                    <Badge variant="outline" className="bg-success/10 text-success">
                      8/10
                    </Badge>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Energy Level</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      7/10
                    </Badge>
                  </div>
                  <Progress value={70} className="h-2" />
                </div>
              </div>
              <Card className="p-3 bg-secondary/20 mt-4">
                <p className="text-xs text-muted-foreground mb-2">AI Insight</p>
                <p className="text-sm text-foreground">
                  Your mood dips on low-sleep days. Consider prioritizing rest tonight.
                </p>
              </Card>
            </Card>

            {/* Reflection Journal */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Daily Reflection</h3>
                </div>
                <Dialog open={reflectionDialogOpen} onOpenChange={setReflectionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      Write
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Daily Reflection</DialogTitle>
                      <DialogDescription>
                        Take a moment to reflect on your day
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reflection">What went well today?</Label>
                        <Textarea 
                          id="reflection" 
                          placeholder="Write your thoughts..."
                          rows={5}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gratitude">What are you grateful for?</Label>
                        <Textarea 
                          id="gratitude" 
                          placeholder="List 3 things..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={handleLogReflection} className="w-full">
                        Save Reflection
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {recentReflections.map((reflection, idx) => (
                  <Card key={idx} className="p-3 bg-secondary/20">
                    <p className="text-xs text-muted-foreground mb-1">{reflection.date}</p>
                    <p className="text-sm text-foreground">{reflection.text}</p>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Self-Care Recommendations */}
            <Card className="p-6 bg-gradient-to-br from-success/10 to-primary/10">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-4 h-4 text-success" />
                <h3 className="font-semibold text-foreground">Self-Care Tips</h3>
              </div>
              <div className="space-y-3">
                {selfCareRecommendations.map((tip, idx) => (
                  <Card key={idx} className="p-3 bg-card/60 backdrop-blur">
                    <div className="flex items-start gap-2">
                      <tip.icon className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{tip.title}</p>
                        <p className="text-xs text-muted-foreground">{tip.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Weekly Summary */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Weekly Summary</h3>
              </div>
              <div className="space-y-3">
                {weeklySummary.map((stat, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <Progress value={stat.value} className="h-2" />
                  </div>
                ))}
              </div>
              <Card className="p-3 bg-primary/5 border-primary/20 mt-4">
                <p className="text-xs text-muted-foreground mb-1">AI Summary</p>
                <p className="text-sm text-foreground">
                  You achieved 90% of your planned habits this week. Energy levels were highest on days with early workouts.
                </p>
              </Card>
            </Card>

            {/* Achievements */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Recent Achievements</h3>
              </div>
              <div className="space-y-2">
                {achievements.map((achievement, idx) => (
                  <Card key={idx} className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.emoji}</div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground">{achievement.date}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Data
const overviewStats = [
  { label: "Active Habits", value: "4", change: "+1 this week", icon: Target, bgColor: "bg-primary/10", iconColor: "text-primary", trend: "up" },
  { label: "Current Streak", value: "18", change: "Days running", icon: Zap, bgColor: "bg-success/10", iconColor: "text-success", trend: "up" },
  { label: "Focus Time", value: "2.5h", change: "+30 min today", icon: Clock, bgColor: "bg-primary/10", iconColor: "text-primary", trend: "up" },
  { label: "Mood Score", value: "8/10", change: "Feeling good", icon: Smile, bgColor: "bg-success/10", iconColor: "text-success", trend: "up" },
];

const habits = [
  { 
    id: "1", 
    name: "Morning Meditation", 
    description: "10 minutes of mindfulness", 
    icon: Brain,
    streak: 18, 
    frequency: "Daily",
    completed: true,
    completionRate: 85
  },
  { 
    id: "2", 
    name: "Daily Exercise", 
    description: "30 minutes of physical activity", 
    icon: Activity,
    streak: 12, 
    frequency: "Daily",
    completed: true,
    completionRate: 70
  },
  { 
    id: "3", 
    name: "Gratitude Journal", 
    description: "Write 3 things you're grateful for", 
    icon: BookOpen,
    streak: 15, 
    frequency: "Daily",
    completed: false,
    completionRate: 90
  },
  { 
    id: "4", 
    name: "Read Before Bed", 
    description: "20 minutes of reading", 
    icon: BookOpen,
    streak: 9, 
    frequency: "Daily",
    completed: false,
    completionRate: 65
  },
];

const morningRoutine = [
  { time: "6:30 AM", activity: "Wake up & hydrate", duration: "5 min", completed: true },
  { time: "6:35 AM", activity: "Morning meditation", duration: "10 min", completed: true },
  { time: "6:45 AM", activity: "Light stretching", duration: "10 min", completed: true },
  { time: "7:00 AM", activity: "Healthy breakfast", duration: "20 min", completed: true },
  { time: "7:30 AM", activity: "Review daily goals", duration: "10 min", completed: false },
];

const afternoonRoutine = [
  { time: "12:30 PM", activity: "Lunch break", duration: "30 min" },
  { time: "1:00 PM", activity: "Short walk", duration: "15 min" },
  { time: "2:00 PM", activity: "Focus session", duration: "90 min" },
  { time: "4:00 PM", activity: "Hydration & snack", duration: "10 min" },
];

const eveningRoutine = [
  { time: "6:00 PM", activity: "Dinner", duration: "30 min" },
  { time: "7:00 PM", activity: "Evening workout", duration: "45 min" },
  { time: "8:00 PM", activity: "Family time", duration: "60 min" },
  { time: "9:00 PM", activity: "Digital detox begins", duration: "Ongoing" },
];

const nightRoutine = [
  { time: "9:15 PM", activity: "Light reading", duration: "30 min" },
  { time: "9:45 PM", activity: "Prepare for tomorrow", duration: "10 min" },
  { time: "10:00 PM", activity: "Gratitude journal", duration: "10 min" },
  { time: "10:30 PM", activity: "Sleep routine", duration: "30 min" },
];

const habitTrendData = [
  { day: "Mon", completion: 80 },
  { day: "Tue", completion: 85 },
  { day: "Wed", completion: 90 },
  { day: "Thu", completion: 75 },
  { day: "Fri", completion: 85 },
  { day: "Sat", completion: 95 },
  { day: "Sun", completion: 88 },
];

const moodTrendData = [
  { day: "Mon", mood: 7, energy: 6 },
  { day: "Tue", mood: 8, energy: 7 },
  { day: "Wed", mood: 8, energy: 8 },
  { day: "Thu", mood: 6, energy: 5 },
  { day: "Fri", mood: 7, energy: 7 },
  { day: "Sat", mood: 9, energy: 8 },
  { day: "Sun", mood: 8, energy: 7 },
];

const focusTrendData = [
  { day: "Mon", minutes: 120 },
  { day: "Tue", minutes: 150 },
  { day: "Wed", minutes: 135 },
  { day: "Thu", minutes: 90 },
  { day: "Fri", minutes: 120 },
  { day: "Sat", minutes: 60 },
  { day: "Sun", minutes: 75 },
];

const recentReflections = [
  { date: "Today", text: "Great progress on my meditation practice. Feeling more centered." },
  { date: "Yesterday", text: "Struggled with focus in the afternoon. Need to adjust my lunch." },
  { date: "2 days ago", text: "Excellent workout session! Energy levels are improving." },
];

const selfCareRecommendations = [
  { title: "Take a 5-min breathing break", description: "You've been focused for 90 minutes", icon: Wind },
  { title: "Stay hydrated", description: "Last water intake was 2 hours ago", icon: Coffee },
  { title: "Stretch your body", description: "Help prevent tension buildup", icon: Activity },
  { title: "Get some sunlight", description: "Boost your vitamin D levels", icon: Sun },
];

const weeklySummary = [
  { label: "Habit Consistency", value: 90, change: "+5%", trend: "up" },
  { label: "Productivity Score", value: 87, change: "+3%", trend: "up" },
  { label: "Sleep Quality", value: 85, change: "+2%", trend: "up" },
  { label: "Mood Average", value: 78, change: "-2%", trend: "down" },
];

const achievements = [
  { emoji: "🔥", title: "18-Day Streak", date: "Meditation habit" },
  { emoji: "🎯", title: "90% Completion", date: "This week" },
  { emoji: "⚡", title: "150 Focus Minutes", date: "Personal best" },
];

export default LifestylePage;
