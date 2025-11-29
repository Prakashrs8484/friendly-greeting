import { Shield, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

interface EmergencyFundPlannerProps {
  monthlyExpenses: number;
  bracket: string;
  currentEmergencyFund?: number;
}

const bracketMultipliers: Record<string, number> = {
  "15K-25K": 4,
  "25K-50K": 4.5,
  "50K-75K": 5,
  "75K-1L": 5.5,
  "1L+": 6
};

export const EmergencyFundPlanner = ({ 
  monthlyExpenses, 
  bracket, 
  currentEmergencyFund = 8500 
}: EmergencyFundPlannerProps) => {
  
  const multiplier = bracketMultipliers[bracket] || 6;
  const requiredAmount = Math.round(monthlyExpenses * multiplier);
  const progress = Math.min((currentEmergencyFund / requiredAmount) * 100, 100);
  const remaining = Math.max(requiredAmount - currentEmergencyFund, 0);

  const yearlySchedule = useMemo(() => {
    const monthlyContribution = Math.ceil(remaining / 12);
    const schedule = [];
    let accumulated = currentEmergencyFund;

    for (let month = 1; month <= 12; month++) {
      accumulated += monthlyContribution;
      if (accumulated >= requiredAmount) accumulated = requiredAmount;
      
      schedule.push({
        month,
        monthName: new Date(2025, month - 1).toLocaleString('default', { month: 'short' }),
        target: monthlyContribution,
        accumulated,
        progress: (accumulated / requiredAmount) * 100
      });
    }
    return schedule;
  }, [remaining, requiredAmount, currentEmergencyFund]);

  return (
    <Card className="card-hover card-glass">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <Shield className="w-5 h-5 text-warning" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">Emergency Fund Planner</CardTitle>
            <p className="text-sm text-muted-foreground">
              {multiplier} months of expenses recommended for {bracket} bracket
            </p>
          </div>
          <Badge variant={progress >= 100 ? "default" : "outline"} className="text-sm">
            {progress.toFixed(0)}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-success/5 border border-success/20">
            <p className="text-xs text-muted-foreground mb-1">Current Fund</p>
            <p className="text-lg font-bold text-foreground">₹{currentEmergencyFund.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
            <p className="text-xs text-muted-foreground mb-1">Required</p>
            <p className="text-lg font-bold text-foreground">₹{requiredAmount.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <p className="text-xs text-muted-foreground mb-1">Remaining</p>
            <p className="text-lg font-bold text-foreground">₹{remaining.toLocaleString()}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Progress</span>
            <span className="text-sm font-semibold text-primary">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Alert if not complete */}
        {progress < 100 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/5 border border-warning/20">
            <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">
                Build Your Safety Net
              </p>
              <p className="text-xs text-muted-foreground">
                Save ₹{Math.ceil(remaining / 12).toLocaleString()}/month for the next 12 months to complete your emergency fund.
              </p>
            </div>
          </div>
        )}

        {/* Yearly Collection Schedule */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">12-Month Collection Schedule</h4>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2 font-medium">Month</th>
                  <th className="text-right p-2 font-medium">Save</th>
                  <th className="text-right p-2 font-medium">Total</th>
                  <th className="text-right p-2 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {yearlySchedule.map((item, idx) => (
                  <tr key={idx} className="border-t border-border hover:bg-muted/20">
                    <td className="p-2">{item.monthName}</td>
                    <td className="p-2 text-right text-success font-medium">
                      +₹{item.target.toLocaleString()}
                    </td>
                    <td className="p-2 text-right font-semibold">
                      ₹{item.accumulated.toLocaleString()}
                    </td>
                    <td className="p-2 text-right">
                      <span className={`text-xs font-medium ${
                        item.progress >= 100 ? 'text-success' : 'text-muted-foreground'
                      }`}>
                        {item.progress.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
