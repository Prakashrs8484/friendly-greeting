import { Wallet, Edit3, Check, X, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { toast } from "sonner";

interface BracketRules {
  needs: number;
  wants: number;
  investments: number;
  emergencyFund: number;
  categories: {
    housing: number;
    food: number;
    utilities: number;
    mobile: number;
    transport: number;
    eatingOut: number;
    entertainment: number;
    shopping: number;
    personalCare: number;
    education: number;
    travel: number;
    gifts: number;
    misc: number;
  };
}

const bracketDefaults: Record<string, BracketRules> = {
  "15K-25K": {
    needs: 70,
    wants: 20,
    investments: 10,
    emergencyFund: 15,
    categories: {
      housing: 35, food: 20, utilities: 8, mobile: 5, transport: 10,
      eatingOut: 5, entertainment: 5, shopping: 5, personalCare: 3,
      education: 2, travel: 1, gifts: 1, misc: 0
    }
  },
  "25K-50K": {
    needs: 65,
    wants: 20,
    investments: 15,
    emergencyFund: 18,
    categories: {
      housing: 30, food: 18, utilities: 8, mobile: 4, transport: 8,
      eatingOut: 6, entertainment: 6, shopping: 6, personalCare: 4,
      education: 4, travel: 3, gifts: 2, misc: 1
    }
  },
  "50K-75K": {
    needs: 55,
    wants: 25,
    investments: 20,
    emergencyFund: 20,
    categories: {
      housing: 25, food: 15, utilities: 7, mobile: 3, transport: 7,
      eatingOut: 8, entertainment: 7, shopping: 8, personalCare: 5,
      education: 5, travel: 5, gifts: 3, misc: 2
    }
  },
  "75K-1L": {
    needs: 50,
    wants: 25,
    investments: 25,
    emergencyFund: 22,
    categories: {
      housing: 22, food: 13, utilities: 6, mobile: 3, transport: 6,
      eatingOut: 8, entertainment: 8, shopping: 9, personalCare: 6,
      education: 6, travel: 6, gifts: 4, misc: 3
    }
  },
  "1L+": {
    needs: 45,
    wants: 25,
    investments: 30,
    emergencyFund: 25,
    categories: {
      housing: 20, food: 12, utilities: 5, mobile: 2, transport: 5,
      eatingOut: 9, entertainment: 8, shopping: 10, personalCare: 7,
      education: 7, travel: 8, gifts: 5, misc: 2
    }
  }
};

interface SmartBudgetAllocatorProps {
  monthlySalary: number;
  bracket: string;
}

export const SmartBudgetAllocator = ({ monthlySalary, bracket }: SmartBudgetAllocatorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [percentages, setPercentages] = useState(bracketDefaults[bracket] || bracketDefaults["25K-50K"]);
  const [tempPercentages, setTempPercentages] = useState(percentages);

  const categoryLabels: Record<string, string> = {
    housing: "Housing/Rent",
    food: "Food & Groceries",
    utilities: "Utilities & Bills",
    mobile: "Mobile/Internet",
    transport: "Transportation",
    eatingOut: "Eating Out",
    entertainment: "Entertainment",
    shopping: "Shopping",
    personalCare: "Personal Care",
    education: "Education",
    travel: "Travel",
    gifts: "Gifts & Donations",
    misc: "Miscellaneous"
  };

  const calculateAmount = (percentage: number) => {
    return Math.round((monthlySalary * percentage) / 100);
  };

  const handleEdit = () => {
    setTempPercentages(percentages);
    setIsEditing(true);
  };

  const handleSave = () => {
    const total = Object.values(tempPercentages.categories).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 100) > 0.1) {
      toast.error("Category percentages must sum to 100%");
      return;
    }
    setPercentages(tempPercentages);
    setIsEditing(false);
    toast.success("Budget allocation updated successfully!");
  };

  const handleCancel = () => {
    setTempPercentages(percentages);
    setIsEditing(false);
  };

  const currentPercentages = isEditing ? tempPercentages : percentages;

  return (
    <Card className="card-hover card-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Smart Budget Allocator</CardTitle>
              <p className="text-sm text-muted-foreground">
                Based on {bracket} bracket • Monthly: ₹{monthlySalary.toLocaleString()}
              </p>
            </div>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel} className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="gap-2">
                <Check className="w-4 h-4" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* High-level breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-success/5 border border-success/20">
            <p className="text-xs text-muted-foreground mb-1">Needs</p>
            <p className="text-lg font-bold text-foreground">{currentPercentages.needs}%</p>
            <p className="text-xs text-muted-foreground">₹{calculateAmount(currentPercentages.needs).toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Wants</p>
            <p className="text-lg font-bold text-foreground">{currentPercentages.wants}%</p>
            <p className="text-xs text-muted-foreground">₹{calculateAmount(currentPercentages.wants).toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <p className="text-xs text-muted-foreground mb-1">Investments</p>
            <p className="text-lg font-bold text-foreground">{currentPercentages.investments}%</p>
            <p className="text-xs text-muted-foreground">₹{calculateAmount(currentPercentages.investments).toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
            <p className="text-xs text-muted-foreground mb-1">Emergency</p>
            <p className="text-lg font-bold text-foreground">{currentPercentages.emergencyFund}%</p>
            <p className="text-xs text-muted-foreground">₹{calculateAmount(currentPercentages.emergencyFund).toLocaleString()}</p>
          </div>
        </div>

        {/* Detailed category breakdown */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold text-foreground">Category Breakdown</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-3.5 h-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Percentages based on your income bracket</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(currentPercentages.categories).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                <span className="text-sm text-foreground">{categoryLabels[key]}</span>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <Input
                      type="number"
                      value={value}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value) || 0;
                        setTempPercentages({
                          ...tempPercentages,
                          categories: {
                            ...tempPercentages.categories,
                            [key]: newValue
                          }
                        });
                      }}
                      className="w-16 h-7 text-xs text-right"
                      step="0.5"
                    />
                  ) : (
                    <Badge variant="outline" className="font-mono">
                      {value}%
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground w-20 text-right">
                    ₹{calculateAmount(value).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
