import { PiggyBank, TrendingUp, AlertCircle, Lock, Unlock, Brain, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BudgetCategory {
  name: string;
  spent: number;
  budget: number;
  icon?: string;
}

const budgetCategories: BudgetCategory[] = [
  { name: "Housing", spent: 1200, budget: 1500 },
  { name: "Food & Dining", spent: 450, budget: 600 },
  { name: "Transportation", spent: 280, budget: 400 },
  { name: "Entertainment", spent: 180, budget: 300 },
  { name: "Utilities", spent: 150, budget: 200 },
  { name: "Healthcare", spent: 120, budget: 250 },
];

export const BudgetPlanner = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [budgets, setBudgets] = useState(budgetCategories);
  const [editingBudgets, setEditingBudgets] = useState<Record<string, number>>({});

  const totalSpent = budgets.reduce((sum, cat) => sum + cat.spent, 0);
  const totalBudget = budgets.reduce((sum, cat) => sum + cat.budget, 0);
  const overallProgress = (totalSpent / totalBudget) * 100;

  const handleUnlock = () => {
    setIsLocked(false);
    const initialEditing: Record<string, number> = {};
    budgets.forEach(cat => {
      initialEditing[cat.name] = cat.budget;
    });
    setEditingBudgets(initialEditing);
  };

  const handleSave = () => {
    // Validate that no budget is lower than current spending
    const invalidBudgets = budgets.filter(cat => {
      const newBudget = editingBudgets[cat.name] || cat.budget;
      return newBudget < cat.spent;
    });

    if (invalidBudgets.length > 0) {
      const categoryNames = invalidBudgets.map(cat => cat.name).join(', ');
      toast.error(`Cannot save: Budget cannot be lower than current spending for ${categoryNames}`);
      return;
    }

    const updatedBudgets = budgets.map(cat => ({
      ...cat,
      budget: editingBudgets[cat.name] || cat.budget
    }));
    setBudgets(updatedBudgets);
    setIsLocked(true);
    toast.success("Budget updated successfully!");
  };

  const handleCancel = () => {
    setIsLocked(true);
    setEditingBudgets({});
  };

  const handleRegenerateAI = () => {
    toast.success("AI is regenerating your budget based on spending patterns...");
    // Simulate AI regeneration
    setTimeout(() => {
      setBudgets(budgetCategories);
      setIsLocked(true);
      toast.success("Budget regenerated!");
    }, 1000);
  };

  return (
    <Card className="card-hover card-glass">
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg sm:text-xl">Budget Planner</CardTitle>
              {!isLocked && <Badge variant="outline" className="gap-1"><Brain className="w-3 h-3" />Editing</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              ₹{totalSpent.toLocaleString()} / ₹{totalBudget.toLocaleString()} spent
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isLocked ? (
              <>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleRegenerateAI}>
                  <Brain className="w-4 h-4" />
                  <span className="hidden sm:inline">AI Regenerate</span>
                  <span className="sm:hidden">AI</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleUnlock}>
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button size="sm" className="gap-2" onClick={handleSave}>
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">Overall Budget</span>
          <Badge variant={overallProgress > 90 ? "destructive" : overallProgress > 75 ? "outline" : "default"}>
            {overallProgress.toFixed(0)}%
          </Badge>
        </div>
        <Progress value={overallProgress} className="h-3" />
      </div>

        <div className="space-y-4">
          {budgets.map((category, idx) => {
            const currentBudget = isLocked ? category.budget : (editingBudgets[category.name] || category.budget);
            const percentage = (category.spent / currentBudget) * 100;
            const isOverBudget = category.spent > currentBudget;
            const isNearLimit = percentage > 80 && percentage <= 100;

            return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      ₹{category.spent} /
                    </span>
                    {!isLocked ? (
                      <div className="flex flex-col items-end">
                        <Input
                          type="number"
                          value={editingBudgets[category.name] || category.budget}
                          onChange={(e) => {
                            const newValue = parseInt(e.target.value) || 0;
                            setEditingBudgets({
                              ...editingBudgets,
                              [category.name]: newValue
                            });
                          }}
                          className={cn(
                            "w-20 h-7 text-sm",
                            editingBudgets[category.name] < category.spent && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        {editingBudgets[category.name] < category.spent && (
                          <span className="text-[10px] text-destructive mt-0.5">
                            Min: ₹{category.spent}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-foreground">
                        ₹{currentBudget}
                      </span>
                    )}
                    {isOverBudget && <AlertCircle className="w-4 h-4 text-destructive" />}
                  </div>
                </div>
                <Progress
                  value={Math.min(percentage, 100)}
                  className={`h-2 ${
                    isOverBudget
                      ? "[&>div]:bg-destructive"
                      : isNearLimit
                      ? "[&>div]:bg-warning"
                      : ""
                  }`}
                />
                {isOverBudget && (
                  <p className="text-xs text-destructive">
                    Over budget by ₹{category.spent - currentBudget}
                  </p>
                )}
                {isNearLimit && !isOverBudget && (
                  <p className="text-xs text-warning">
                    {(100 - percentage).toFixed(0)}% remaining
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
