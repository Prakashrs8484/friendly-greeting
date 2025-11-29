import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Heart, Activity, Flame, Droplet, Moon, Plus, Sparkles, TrendingUp, Dumbbell, Calendar, Trophy, Target, Zap, Clock, CheckCircle2, AlertCircle, BarChart3, Stethoscope, User, MapPin, Info, BookOpen, ArrowRight, X } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import AgentChat from "@/components/AgentChat";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

const HealthPage = () => {
  const { toast } = useToast();
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [workoutDialogOpen, setWorkoutDialogOpen] = useState(false);
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);
  const [conditionDialogOpen, setConditionDialogOpen] = useState(false);
  const [conditionStep, setConditionStep] = useState(1);
  const [painLevel, setPainLevel] = useState([5]);
  const [selectedBodyPart, setSelectedBodyPart] = useState("");

  const handleLogActivity = () => {
    setActivityDialogOpen(false);
    toast({
      title: "Activity Logged",
      description: "Your workout has been recorded successfully.",
    });
  };

  const handleChatMessage = async (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("pain") || lowerMessage.includes("condition") || lowerMessage.includes("recovery")) {
      return "I've assessed your condition. I recommend starting with gentle stretching exercises and avoiding high-impact activities for now. Would you like me to create a personalized recovery plan?";
    }
    return "I've analyzed your request. Your fitness plan has been updated based on your goals.";
  };

  const handleConditionAssessment = () => {
    setConditionDialogOpen(false);
    setConditionStep(1);
    toast({
      title: "Condition Assessed",
      description: "AI Health Agent has created a personalized recovery plan for you.",
    });
  };

  return (
    <DashboardLayout hideNavigation>
      <div className="page-container animate-fade-in">
        {/* Header with Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="page-title">
              Health & Fitness Workspace
            </h1>
            <p className="page-subtitle">
              Your AI-powered fitness command center — Plan, Track, Optimize
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Activity</span>
                  <span className="sm:hidden">Activity</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Physical Activity</DialogTitle>
                  <DialogDescription>Record your workout or physical activity</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Activity Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="cycling">Cycling</SelectItem>
                        <SelectItem value="strength">Strength Training</SelectItem>
                        <SelectItem value="yoga">Yoga</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input type="number" placeholder="45" />
                  </div>
                  <div className="space-y-2">
                    <Label>Intensity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select intensity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="intense">Intense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleLogActivity}>Log Activity</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Report</span>
              <span className="sm:hidden">Report</span>
            </Button>
          </div>
        </div>

        {/* Fitness Overview Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {fitnessOverview.map((stat, index) => (
            <Card key={index} className="card-hover card-glass">
              <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant={stat.trending === "up" ? "default" : "secondary"} className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <Progress value={stat.progress} className="h-2 mt-3" />
                </CardContent>
              </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="workspace-grid">
          {/* Left Column - Chat & Insights */}
          <div className="workspace-content-column">
              {/* AI Fitness Agent Chat */}
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Fitness Coach AI</CardTitle>
                      <CardDescription>Your personal training assistant</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AgentChat
                    agentName="Fitness Coach"
                    agentIcon={Sparkles}
                    placeholder="Ask about workouts, recovery, or progress..."
                    onSendMessage={handleChatMessage}
                    initialMessages={[
                      {
                        role: "agent",
                        content: "Good morning! Ready for your strength training session today? I've prepared a customized workout based on your recovery status.",
                        timestamp: new Date(),
                      },
                    ]}
                  />
                </CardContent>
              </Card>

              {/* Workout Planning & Calendar */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Workout Plan & Schedule</CardTitle>
                      <CardDescription>AI-generated personalized training program</CardDescription>
                    </div>
                    <Dialog open={workoutDialogOpen} onOpenChange={setWorkoutDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Workout
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Schedule New Workout</DialogTitle>
                          <DialogDescription>Let AI suggest or create your own</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Workout Type</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="strength">Strength Training</SelectItem>
                                <SelectItem value="cardio">Cardio</SelectItem>
                                <SelectItem value="flexibility">Flexibility</SelectItem>
                                <SelectItem value="recovery">Recovery</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Date & Time</Label>
                            <Input type="datetime-local" />
                          </div>
                          <div className="space-y-2">
                            <Label>Duration (minutes)</Label>
                            <Input type="number" placeholder="60" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => setWorkoutDialogOpen(false)}>Schedule Workout</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="week">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="week">This Week</TabsTrigger>
                      <TabsTrigger value="month">This Month</TabsTrigger>
                    </TabsList>
                    <TabsContent value="week" className="space-y-4 mt-4">
                      {weeklyWorkouts.map((workout, index) => (
                        <Card key={index} className="hover:border-primary/50 transition-all">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-lg ${workout.completed ? 'bg-primary' : 'bg-muted'} flex items-center justify-center`}>
                                  {workout.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                                  ) : (
                                    <Clock className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-semibold">{workout.day}</h4>
                                  <p className="text-sm text-muted-foreground">{workout.type}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {workout.duration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Flame className="w-3 h-3" />
                                      {workout.calories} cal
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {workout.difficulty}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              {!workout.completed && (
                                <Button size="sm">Start</Button>
                              )}
                            </div>
                            <div className="space-y-2">
                              {workout.exercises.map((exercise, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
                                  <span>{exercise.name}</span>
                                  <span className="text-muted-foreground">{exercise.sets}</span>
                                </div>
                              ))}
                            </div>
                            {workout.targetMuscles && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-xs text-muted-foreground">
                                  Target: {workout.targetMuscles.join(", ")}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>
                    <TabsContent value="month">
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Monthly calendar view coming soon</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Activity Tracking & Charts */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Analytics</CardTitle>
                  <CardDescription>Performance trends and progress visualization</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="workouts">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="workouts">Workouts</TabsTrigger>
                      <TabsTrigger value="calories">Calories</TabsTrigger>
                      <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                    </TabsList>
                    <TabsContent value="workouts" className="mt-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={workoutFrequencyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Legend />
                          <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </TabsContent>
                    <TabsContent value="calories" className="mt-4">
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={caloriesTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }} 
                          />
                          <Legend />
                          <Line type="monotone" dataKey="burned" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="goal" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    </TabsContent>
                    <TabsContent value="breakdown" className="mt-4">
                      <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={activityBreakdownData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {activityBreakdownData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'hsl(var(--card))', 
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }} 
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Achievements & Milestones */}
              <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-accent" />
                    <CardTitle>Achievements & Milestones</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-all">
                        <div className={`w-12 h-12 rounded-full ${achievement.unlocked ? 'bg-gradient-to-br from-primary to-accent' : 'bg-muted'} flex items-center justify-center`}>
                          <Trophy className={`w-6 h-6 ${achievement.unlocked ? 'text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          {achievement.unlocked ? (
                            <Badge className="mt-2">Unlocked!</Badge>
                          ) : (
                            <Progress value={achievement.progress} className="h-2 mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Quick Stats & Recovery */}
            <div className="space-y-6">
              {/* Current Streak */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <Zap className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold mb-2">12 Days</h3>
                    <p className="text-muted-foreground">Current Streak</p>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium">Personal Best: 18 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fitness Score */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <CardTitle>Fitness Score</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        87
                      </div>
                      <p className="text-sm text-muted-foreground">Out of 100</p>
                    </div>
                    <Progress value={87} className="h-3" />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Consistency</span>
                        <span className="font-medium">92%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Intensity</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recovery</span>
                        <span className="font-medium">83%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recovery & Wellness */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      <CardTitle>Recovery Status</CardTitle>
                    </div>
                    <Dialog open={recoveryDialogOpen} onOpenChange={setRecoveryDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Log Recovery Data</DialogTitle>
                          <DialogDescription>Track your body's recovery status</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Energy Level (1-10)</Label>
                            <Input type="number" min="1" max="10" placeholder="7" />
                          </div>
                          <div className="space-y-2">
                            <Label>Muscle Soreness</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="mild">Mild</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="severe">Severe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Sleep Quality (hours)</Label>
                            <Input type="number" step="0.5" placeholder="7.5" />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => setRecoveryDialogOpen(false)}>Save Data</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <div className="text-3xl font-bold mb-1">85%</div>
                    <p className="text-sm text-muted-foreground">Recovery Complete</p>
                  </div>
                  <div className="space-y-3">
                    {recoveryMetrics.map((metric, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <metric.icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{metric.label}</span>
                          </span>
                          <span className="font-medium">{metric.value}</span>
                        </div>
                        <Progress value={metric.percentage} className="h-2" />
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-start gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-accent mt-0.5" />
                      <p className="text-muted-foreground">
                        Light activity recommended today. Your body is 85% recovered.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card className="border-accent/20 bg-accent/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <CardTitle>AI Recommendations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {aiRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                      <div className={`w-8 h-8 rounded-lg ${rec.priority === 'high' ? 'bg-accent' : 'bg-primary'} flex items-center justify-center flex-shrink-0`}>
                        <rec.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Health Conditions & Recovery Management */}
              <Card className="border-accent/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-accent" />
                      <CardTitle>Health Conditions</CardTitle>
                    </div>
                    <Dialog open={conditionDialogOpen} onOpenChange={(open) => {
                      setConditionDialogOpen(open);
                      if (!open) setConditionStep(1);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Assess
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Health Condition Assessment</DialogTitle>
                          <DialogDescription>
                            Help us understand your condition for personalized recovery
                          </DialogDescription>
                        </DialogHeader>

                        {/* Multi-step assessment */}
                        <div className="space-y-6 py-4">
                          {/* Step indicator */}
                          <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  step === conditionStep ? "w-8 bg-primary" : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>

                          {/* Step 1: Basic Info */}
                          {conditionStep === 1 && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>What's bothering you?</Label>
                                <Textarea
                                  placeholder="Describe your condition (e.g., 'I have lower back pain for the past 3 days')"
                                  rows={4}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Affected Body Part</Label>
                                <Select value={selectedBodyPart} onValueChange={setSelectedBodyPart}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select body part" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="lower-back">Lower Back</SelectItem>
                                    <SelectItem value="upper-back">Upper Back</SelectItem>
                                    <SelectItem value="neck">Neck</SelectItem>
                                    <SelectItem value="shoulder">Shoulder</SelectItem>
                                    <SelectItem value="knee">Knee</SelectItem>
                                    <SelectItem value="ankle">Ankle</SelectItem>
                                    <SelectItem value="wrist">Wrist</SelectItem>
                                    <SelectItem value="hip">Hip</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          {/* Step 2: Pain Assessment */}
                          {conditionStep === 2 && (
                            <div className="space-y-6">
                              <div className="space-y-3">
                                <Label>Pain Intensity (Current)</Label>
                                <div className="space-y-2">
                                  <Slider
                                    value={painLevel}
                                    onValueChange={setPainLevel}
                                    max={10}
                                    step={1}
                                    className="w-full"
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>No Pain</span>
                                    <span className="text-lg font-bold text-foreground">{painLevel[0]}/10</span>
                                    <span>Severe</span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>How long have you had this condition?</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1-3days">1-3 days</SelectItem>
                                    <SelectItem value="4-7days">4-7 days</SelectItem>
                                    <SelectItem value="1-2weeks">1-2 weeks</SelectItem>
                                    <SelectItem value="2-4weeks">2-4 weeks</SelectItem>
                                    <SelectItem value="1-3months">1-3 months</SelectItem>
                                    <SelectItem value="3months+">More than 3 months</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>When does it hurt most?</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select trigger" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="morning">In the morning</SelectItem>
                                    <SelectItem value="sitting">While sitting</SelectItem>
                                    <SelectItem value="standing">While standing</SelectItem>
                                    <SelectItem value="movement">During movement</SelectItem>
                                    <SelectItem value="exercise">During exercise</SelectItem>
                                    <SelectItem value="night">At night</SelectItem>
                                    <SelectItem value="constant">Constant</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          {/* Step 3: Lifestyle Factors */}
                          {conditionStep === 3 && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Daily sitting hours</Label>
                                <Input type="number" placeholder="8" />
                              </div>
                              <div className="space-y-2">
                                <Label>Recent activities that might have caused this</Label>
                                <Textarea
                                  placeholder="E.g., Heavy lifting, long drive, new exercise routine"
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Current activity level</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select level" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sedentary">Sedentary (little/no exercise)</SelectItem>
                                    <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                                    <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                                    <SelectItem value="active">Very Active (6-7 days/week)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          {/* Step 4: Medical History */}
                          {conditionStep === 4 && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Have you had this condition before?</Label>
                                <Select>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="no">No, first time</SelectItem>
                                    <SelectItem value="yes-resolved">Yes, but it resolved</SelectItem>
                                    <SelectItem value="yes-recurring">Yes, recurring issue</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Any relevant past injuries?</Label>
                                <Textarea
                                  placeholder="Describe any past injuries or medical conditions"
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Are you currently taking any medication?</Label>
                                <Input placeholder="List medications (optional)" />
                              </div>
                            </div>
                          )}
                        </div>

                        <DialogFooter className="flex gap-2">
                          {conditionStep > 1 && (
                            <Button
                              variant="outline"
                              onClick={() => setConditionStep(conditionStep - 1)}
                            >
                              Previous
                            </Button>
                          )}
                          {conditionStep < 4 ? (
                            <Button onClick={() => setConditionStep(conditionStep + 1)}>
                              Next
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          ) : (
                            <Button onClick={handleConditionAssessment}>
                              Complete Assessment
                            </Button>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {healthConditions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Stethoscope className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No active conditions</p>
                      <p className="text-xs mt-1">Click Assess to report any discomfort</p>
                    </div>
                  ) : (
                    healthConditions.map((condition, index) => (
                      <Card key={index} className="border-l-4" style={{ borderLeftColor: condition.severityColor }}>
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{condition.name}</h4>
                                  <Badge variant={condition.severity === "mild" ? "secondary" : "destructive"}>
                                    {condition.severity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {condition.location}
                                </p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Recovery Progress</span>
                                <span className="font-medium">{condition.recoveryProgress}%</span>
                              </div>
                              <Progress value={condition.recoveryProgress} className="h-2" />
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>Day {condition.daysSince} of recovery</span>
                              <span>Est. {condition.estimatedRecovery} days total</span>
                            </div>

                            {condition.aiSummary && (
                              <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                                <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-muted-foreground">{condition.aiSummary}</p>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button size="sm" variant="outline" className="flex-1">
                                View Plan
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1">
                                Log Progress
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}

                  {/* Preventive Tips */}
                  {healthConditions.length > 0 && (
                    <Card className="bg-primary/5 border-primary/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-2">
                          <BookOpen className="w-4 h-4 text-primary mt-0.5" />
                          <div className="flex-1">
                            <h5 className="font-semibold text-sm mb-2">Prevention Tips</h5>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              <li>• Take 5-minute breaks every hour</li>
                              <li>• Adjust chair height for better posture</li>
                              <li>• Perform gentle stretches 2-3 times daily</li>
                              <li>• Stay hydrated and maintain good sleep</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>

              {/* Progress Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Summary</CardTitle>
                  <CardDescription>vs. last week</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {progressMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{metric.label}</span>
                        <span className="text-muted-foreground">{metric.value} / {metric.goal}</span>
                      </div>
                      <Progress value={metric.percentage} className="h-2" />
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        <span className="text-emerald-500">+{metric.improvement}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    </DashboardLayout>
  );
};

const fitnessOverview = [
  {
    icon: Dumbbell,
    label: "Total Workouts",
    value: "42",
    change: "+8 this week",
    progress: 84,
    gradient: "from-primary to-primary/80",
    trending: "up",
  },
  {
    icon: Flame,
    label: "Calories Burned",
    value: "12.4k",
    change: "+1.2k",
    progress: 76,
    gradient: "from-orange-500 to-red-500",
    trending: "up",
  },
  {
    icon: Clock,
    label: "Active Hours",
    value: "28.5h",
    change: "+3.5h",
    progress: 82,
    gradient: "from-primary to-accent",
    trending: "up",
  },
  {
    icon: Zap,
    label: "Current Streak",
    value: "12d",
    change: "Best: 18d",
    progress: 67,
    gradient: "from-accent to-accent/80",
    trending: "up",
  },
  {
    icon: Target,
    label: "Goal Progress",
    value: "87%",
    change: "+5%",
    progress: 87,
    gradient: "from-emerald-500 to-teal-500",
    trending: "up",
  },
];

const weeklyWorkouts = [
  {
    day: "Monday",
    type: "Upper Body Strength",
    duration: "45 min",
    calories: "380",
    difficulty: "Intense",
    completed: true,
    exercises: [
      { name: "Bench Press", sets: "4 x 10" },
      { name: "Pull-ups", sets: "3 x 8" },
      { name: "Shoulder Press", sets: "3 x 12" },
      { name: "Bicep Curls", sets: "3 x 15" },
    ],
    targetMuscles: ["Chest", "Back", "Shoulders", "Arms"],
  },
  {
    day: "Tuesday",
    type: "Cardio & Core",
    duration: "30 min",
    calories: "250",
    difficulty: "Moderate",
    completed: true,
    exercises: [
      { name: "Running", sets: "20 min" },
      { name: "Plank", sets: "3 x 60s" },
      { name: "Mountain Climbers", sets: "3 x 20" },
      { name: "Russian Twists", sets: "3 x 30" },
    ],
    targetMuscles: ["Core", "Cardio"],
  },
  {
    day: "Wednesday",
    type: "Lower Body Strength",
    duration: "50 min",
    calories: "420",
    difficulty: "Intense",
    completed: false,
    exercises: [
      { name: "Squats", sets: "4 x 12" },
      { name: "Deadlifts", sets: "4 x 8" },
      { name: "Lunges", sets: "3 x 10" },
      { name: "Leg Press", sets: "3 x 15" },
    ],
    targetMuscles: ["Quads", "Hamstrings", "Glutes", "Lower Back"],
  },
  {
    day: "Thursday",
    type: "Active Recovery",
    duration: "30 min",
    calories: "180",
    difficulty: "Light",
    completed: false,
    exercises: [
      { name: "Yoga Flow", sets: "20 min" },
      { name: "Stretching", sets: "10 min" },
    ],
    targetMuscles: ["Full Body", "Flexibility"],
  },
  {
    day: "Friday",
    type: "Full Body Circuit",
    duration: "40 min",
    calories: "350",
    difficulty: "Intense",
    completed: false,
    exercises: [
      { name: "Burpees", sets: "3 x 15" },
      { name: "Kettlebell Swings", sets: "3 x 20" },
      { name: "Box Jumps", sets: "3 x 12" },
      { name: "Battle Ropes", sets: "3 x 30s" },
    ],
    targetMuscles: ["Full Body", "Cardio", "Endurance"],
  },
];

const progressMetrics = [
  { label: "Weekly Workouts", value: "4", goal: "5", percentage: 80, improvement: 12 },
  { label: "Active Minutes", value: "210", goal: "300", percentage: 70, improvement: 8 },
  { label: "Calories Burned", value: "1,850", goal: "2,500", percentage: 74, improvement: 15 },
  { label: "Sleep Quality", value: "85", goal: "100", percentage: 85, improvement: 5 },
];

const workoutFrequencyData = [
  { day: "Mon", sessions: 2 },
  { day: "Tue", sessions: 1 },
  { day: "Wed", sessions: 2 },
  { day: "Thu", sessions: 1 },
  { day: "Fri", sessions: 2 },
  { day: "Sat", sessions: 1 },
  { day: "Sun", sessions: 0 },
];

const caloriesTrendData = [
  { day: "Mon", burned: 420, goal: 400 },
  { day: "Tue", burned: 380, goal: 400 },
  { day: "Wed", burned: 450, goal: 400 },
  { day: "Thu", burned: 320, goal: 400 },
  { day: "Fri", burned: 480, goal: 400 },
  { day: "Sat", burned: 390, goal: 400 },
  { day: "Sun", burned: 280, goal: 400 },
];

const activityBreakdownData = [
  { name: "Strength", value: 35, color: "hsl(var(--primary))" },
  { name: "Cardio", value: 30, color: "hsl(var(--accent))" },
  { name: "Flexibility", value: 20, color: "hsl(142, 76%, 36%)" },
  { name: "Recovery", value: 15, color: "hsl(221, 83%, 53%)" },
];

const achievements = [
  {
    title: "10k Steps Streak",
    description: "Achieved 10,000 steps for 7 consecutive days",
    unlocked: true,
    progress: 100,
  },
  {
    title: "Early Bird",
    description: "Complete 5 morning workouts before 7 AM",
    unlocked: true,
    progress: 100,
  },
  {
    title: "Calorie Crusher",
    description: "Burn 500+ calories in a single workout",
    unlocked: false,
    progress: 85,
  },
  {
    title: "Consistency King",
    description: "Work out for 30 consecutive days",
    unlocked: false,
    progress: 40,
  },
];

const recoveryMetrics = [
  { icon: Heart, label: "Heart Rate Variability", value: "Good", percentage: 85 },
  { icon: Moon, label: "Sleep Quality", value: "7.5h", percentage: 94 },
  { icon: Droplet, label: "Hydration", value: "2.8L", percentage: 70 },
  { icon: Activity, label: "Muscle Soreness", value: "Mild", percentage: 20 },
];

const aiRecommendations = [
  {
    icon: Dumbbell,
    title: "Increase Intensity",
    description: "Your body has adapted. Try adding 5kg to your lifts.",
    priority: "high",
  },
  {
    icon: Droplet,
    title: "Hydration Reminder",
    description: "You're 30% below your daily water goal.",
    priority: "medium",
  },
  {
    icon: Moon,
    title: "Rest Day Suggestion",
    description: "Consider taking tomorrow off for optimal recovery.",
    priority: "high",
  },
  {
    icon: Flame,
    title: "Calorie Adjustment",
    description: "Increase calorie intake by 200 for muscle growth.",
    priority: "medium",
  },
];

const healthConditions = [
  {
    name: "Lower Back Strain",
    location: "Lower Back (L4-L5)",
    severity: "mild",
    severityColor: "hsl(142, 76%, 36%)",
    daysSince: 4,
    estimatedRecovery: 10,
    recoveryProgress: 40,
    aiSummary: "Your lower back pain has improved by 30% over the last 2 days. Continue with gentle stretches and avoid heavy lifting. You're on track for full recovery.",
    recoveryPlan: {
      exercises: [
        { name: "Cat-Cow Stretch", duration: "2 min", frequency: "3x daily" },
        { name: "Child's Pose", duration: "3 min", frequency: "Morning & Evening" },
        { name: "Pelvic Tilts", duration: "2 min", frequency: "3x daily" },
      ],
      restrictions: ["Avoid heavy lifting (>10kg)", "No twisting motions", "Limit sitting to 30 min intervals"],
      recommendations: ["Apply heat therapy 15 min before stretching", "Sleep on your side with pillow support", "Take walking breaks every hour"],
    },
  },
];

export default HealthPage;
