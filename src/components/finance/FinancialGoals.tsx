import { Target, Plus, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SavingsGoal {
  name: string;
  current: number;
  target: number;
  progress: number;
  deadline: string;
  category: string;
}

const savingsGoals: SavingsGoal[] = [
  {
    name: "Emergency Fund",
    current: 8500,
    target: 15000,
    progress: 57,
    deadline: "Dec 2025",
    category: "Security",
  },
  {
    name: "Vacation to Japan",
    current: 2800,
    target: 5000,
    progress: 56,
    deadline: "Jun 2025",
    category: "Travel",
  },
  {
    name: "New Laptop",
    current: 900,
    target: 2000,
    progress: 45,
    deadline: "Mar 2025",
    category: "Tech",
  },
  {
    name: "Investment Fund",
    current: 3200,
    target: 10000,
    progress: 32,
    deadline: "Dec 2025",
    category: "Growth",
  },
];

export const FinancialGoals = () => {
  const totalSaved = savingsGoals.reduce((sum, goal) => sum + goal.current, 0);
  const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.target, 0);

  return (
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Financial Goals</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            ₹{totalSaved.toLocaleString()} saved of ₹{totalTarget.toLocaleString()} total goals
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </div>

      <div className="space-y-4">
        {savingsGoals.map((goal, idx) => {
          const monthlyNeeded = calculateMonthlyNeeded(goal.current, goal.target, goal.deadline);

          return (
            <Card key={idx} className="p-4 bg-secondary/20 border-border/50">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground mb-1">{goal.name}</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {goal.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Due: {goal.deadline}</span>
                  </div>
                </div>
                <Badge
                  variant={goal.progress >= 75 ? "default" : "outline"}
                  className={goal.progress >= 75 ? "bg-success/10 text-success border-success/30" : ""}
                >
                  {goal.progress}%
                </Badge>
              </div>

              <Progress value={goal.progress} className="h-2 mb-3" />

              <div className="flex flex-col sm:flex-row justify-between gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Saved: </span>
                  <span className="font-semibold text-foreground">
                    ₹{goal.current.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Target: </span>
                  <span className="font-semibold text-foreground">
                    ₹{goal.target.toLocaleString()}
                  </span>
                </div>
              </div>

              {monthlyNeeded > 0 && (
                <div className="mt-3 p-2 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 text-xs">
                    <TrendingUp className="w-3 h-3 text-primary" />
                    <span className="text-muted-foreground">
                      Save <span className="font-semibold text-foreground">₹{monthlyNeeded}</span> monthly
                      to reach goal on time
                    </span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </Card>
  );
};

function calculateMonthlyNeeded(current: number, target: number, deadline: string): number {
  const remaining = target - current;
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const monthsRemaining = Math.max(
    1,
    (deadlineDate.getFullYear() - today.getFullYear()) * 12 +
      (deadlineDate.getMonth() - today.getMonth())
  );
  return Math.ceil(remaining / monthsRemaining);
}
