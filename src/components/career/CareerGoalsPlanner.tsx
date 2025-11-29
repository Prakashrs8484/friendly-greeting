import { Target, Plus, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface CareerGoal {
  id: string;
  title: string;
  progress: number;
  deadline: string;
  priority: "high" | "medium" | "low";
  steps: string[];
  description?: string;
}

const careerGoals: CareerGoal[] = [
  {
    id: "1",
    title: "Master TypeScript & Advanced Patterns",
    progress: 75,
    deadline: "End of Q1 2025",
    priority: "high",
    description: "Deep dive into advanced TypeScript features and design patterns",
    steps: [
      "Complete Advanced TypeScript Course (Week 1-2)",
      "Build 2 TypeScript Projects (Week 3-4)",
      "Pass TypeScript Certification Exam (Week 5)",
    ],
  },
  {
    id: "2",
    title: "AWS Solutions Architect Certification",
    progress: 45,
    deadline: "March 2025",
    priority: "high",
    description: "Obtain AWS Solutions Architect Associate certification",
    steps: [
      "Study AWS Core Services (Week 1-3)",
      "Complete Practice Labs (Week 4-6)",
      "Take Mock Exams (Week 7-8)",
    ],
  },
  {
    id: "3",
    title: "Build Full-Stack Portfolio Project",
    progress: 60,
    deadline: "February 2025",
    priority: "medium",
    description: "Create a comprehensive full-stack application for portfolio",
    steps: [
      "Design System Architecture (Week 1)",
      "Develop Backend APIs (Week 2-3)",
      "Build Frontend UI (Week 4-5)",
    ],
  },
  {
    id: "4",
    title: "Get Promoted to Senior Team Lead",
    progress: 30,
    deadline: "Q3 2025",
    priority: "high",
    description: "Work towards promotion by demonstrating leadership and technical excellence",
    steps: [
      "Lead 2 major projects successfully",
      "Mentor 3 junior developers",
      "Present technical talks to team",
    ],
  },
];

export const CareerGoalsPlanner = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddGoal = () => {
    setDialogOpen(false);
    toast({
      title: "Goal Added",
      description: "Career Agent is processing your new goal and updating your plan.",
    });
  };

  const totalProgress = Math.round(
    careerGoals.reduce((sum, goal) => sum + goal.progress, 0) / careerGoals.length
  );

  return (
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Career Goals Planner</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Overall Progress: {totalProgress}% • {careerGoals.length} Active Goals
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Career Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Goal Title</Label>
                <Input placeholder="e.g., Become a Senior Developer" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe your goal and what success looks like..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {careerGoals.map((goal) => (
          <Card key={goal.id} className="p-4 bg-secondary/20 border-border/50">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-2">
                  <h4 className="font-semibold text-foreground">{goal.title}</h4>
                  <Badge
                    variant={
                      goal.priority === "high"
                        ? "destructive"
                        : goal.priority === "medium"
                        ? "outline"
                        : "secondary"
                    }
                    className="text-xs flex-shrink-0"
                  >
                    {goal.priority}
                  </Badge>
                </div>
                {goal.description && (
                  <p className="text-xs text-muted-foreground mb-2">{goal.description}</p>
                )}
                <p className="text-xs text-muted-foreground">Deadline: {goal.deadline}</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <Badge
                  variant={goal.progress >= 75 ? "default" : "outline"}
                  className={
                    goal.progress >= 75
                      ? "bg-success/10 text-success border-success/30"
                      : ""
                  }
                >
                  {goal.progress}%
                </Badge>
              </div>
            </div>

            <Progress value={goal.progress} className="h-2 mb-3" />

            <div className="space-y-2 mt-3">
              <p className="text-xs font-semibold text-foreground">Action Steps:</p>
              {goal.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>

            {goal.progress < 100 && (
              <div className="mt-3 p-2 rounded-lg bg-accent/5 border border-accent/10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-accent" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {100 - goal.progress}%
                    </span>{" "}
                    remaining to achieve this goal
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Card>
  );
};
