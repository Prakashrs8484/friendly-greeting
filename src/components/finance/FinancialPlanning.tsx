import { Shield, AlertTriangle, TrendingUp, Target, Clock, Calendar, PieChart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useFinancialContext } from "@/contexts/FinancialContext";
import { cn } from "@/lib/utils";

export const FinancialPlanning = () => {
  const { financialData } = useFinancialContext();

  const allocationGaps = {
    emergencyFund: financialData.allocation.actual.emergencyFund - financialData.allocation.recommended.emergencyFund,
    veryShortTerm: financialData.allocation.actual.veryShortTerm - financialData.allocation.recommended.veryShortTerm,
    shortMediumTerm: financialData.allocation.actual.shortMediumTerm - financialData.allocation.recommended.shortMediumTerm,
    longTermInvestments: financialData.allocation.actual.longTermInvestments - financialData.allocation.recommended.longTermInvestments
  };

  const totalGoalsAmount = {
    veryShortTerm: financialData.goals.veryShortTerm.reduce((sum, g) => sum + g.amount, 0),
    shortMediumTerm: financialData.goals.shortMediumTerm.reduce((sum, g) => sum + g.amount, 0),
    longTerm: financialData.goals.longTerm.reduce((sum, g) => sum + g.amount, 0)
  };

  const financialHealthScore = calculateHealthScore(
    financialData.emergencyFund.progress,
    allocationGaps
  );

  return (
    <div className="space-y-4">
      {/* Financial Health Summary */}
      <Card className="p-6 card-glass bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Complete Financial Planning</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Unified view of your financial health, goals, and allocation strategy
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Financial Health</p>
              <p className="text-2xl font-bold text-foreground">{financialHealthScore}%</p>
            </div>
            <Badge
              variant={financialHealthScore >= 75 ? "default" : "outline"}
              className={cn(
                "text-base px-3 py-1",
                financialHealthScore >= 75 && "bg-success/10 text-success border-success/30",
                financialHealthScore >= 50 && financialHealthScore < 75 && "bg-warning/10 text-warning border-warning/30",
                financialHealthScore < 50 && "bg-destructive/10 text-destructive border-destructive/30"
              )}
            >
              {financialHealthScore >= 75 ? "Excellent" : financialHealthScore >= 50 ? "Good" : "Needs Attention"}
            </Badge>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-background/60 backdrop-blur border-border">
            <p className="text-xs text-muted-foreground mb-1">Monthly Expenses</p>
            <p className="text-2xl font-bold text-foreground">₹{financialData.totalExpenses.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Baseline spending</p>
          </Card>

          <Card className="p-4 bg-background/60 backdrop-blur border-border">
            <p className="text-xs text-muted-foreground mb-1">Net Worth</p>
            <p className="text-2xl font-bold text-foreground">₹{(financialData.netWorth / 1000).toFixed(0)}K</p>
            <p className="text-xs text-success mt-1">+{financialData.monthlyChangePercent}% this month</p>
          </Card>

          <Card className="p-4 bg-background/60 backdrop-blur border-border">
            <p className="text-xs text-muted-foreground mb-1">Total Investments</p>
            <p className="text-2xl font-bold text-foreground">₹{(financialData.currentInvestmentValue / 1000).toFixed(0)}K</p>
            <p className="text-xs text-success mt-1">+{financialData.unrealizedGainsPercent.toFixed(1)}% returns</p>
          </Card>

          <Card className="p-4 bg-background/60 backdrop-blur border-border">
            <p className="text-xs text-muted-foreground mb-1">Monthly Savings</p>
            <p className="text-2xl font-bold text-foreground">₹{financialData.netSavings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">After expenses</p>
          </Card>
        </div>
      </Card>

      {/* Emergency Fund Tracker */}
      <Card className="p-6 card-glass">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Emergency Fund</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              6 months of expenses = ₹{financialData.emergencyFund.required.toLocaleString()}
            </p>
          </div>
          <Badge variant="outline" className={cn(
            financialData.emergencyFund.progress >= 100 ? "bg-success/10 text-success border-success/30" :
            financialData.emergencyFund.progress >= 50 ? "bg-warning/10 text-warning border-warning/30" :
            "bg-destructive/10 text-destructive border-destructive/30"
          )}>
            {financialData.emergencyFund.progress}%
          </Badge>
        </div>

        <Progress value={financialData.emergencyFund.progress} className="h-3 mb-4" />

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Amount</p>
            <p className="text-xl font-bold text-foreground">₹{financialData.emergencyFund.current.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining</p>
            <p className="text-xl font-bold text-foreground">
              ₹{(financialData.emergencyFund.required - financialData.emergencyFund.current).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly Target</p>
            <p className="text-xl font-bold text-foreground">
              ₹{Math.ceil((financialData.emergencyFund.required - financialData.emergencyFund.current) / 6).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Allocation Comparison */}
      <Card className="p-6 card-glass">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Asset Allocation Strategy</h3>
        </div>

        <div className="space-y-6">
          {/* Emergency Fund */}
          <AllocationItem
            label="Emergency Fund (3-6 months)"
            icon={Shield}
            recommended={financialData.allocation.recommended.emergencyFund}
            actual={financialData.allocation.actual.emergencyFund}
            gap={allocationGaps.emergencyFund}
          />

          {/* Very Short Term */}
          <AllocationItem
            label="Very Short-Term Needs (1-3 months)"
            icon={Clock}
            recommended={financialData.allocation.recommended.veryShortTerm}
            actual={financialData.allocation.actual.veryShortTerm}
            gap={allocationGaps.veryShortTerm}
          />

          {/* Short-Medium Term */}
          <AllocationItem
            label="Short-Medium Goals (6 months - 3 years)"
            icon={Calendar}
            recommended={financialData.allocation.recommended.shortMediumTerm}
            actual={financialData.allocation.actual.shortMediumTerm}
            gap={allocationGaps.shortMediumTerm}
          />

          {/* Long Term */}
          <AllocationItem
            label="Long-Term Investments (SIP/Stocks/MF/FD)"
            icon={Target}
            recommended={financialData.allocation.recommended.longTermInvestments}
            actual={financialData.allocation.actual.longTermInvestments}
            gap={allocationGaps.longTermInvestments}
          />
        </div>
      </Card>

      {/* Goals Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Very Short-Term Goals */}
        <Card className="p-6 card-glass">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Very Short-Term</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">1-3 months horizon</p>
          
          <div className="space-y-3 mb-4">
            {financialData.goals.veryShortTerm.map((goal, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-secondary/20 border border-border/50">
                <p className="font-semibold text-foreground text-sm">{goal.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">{goal.deadline}</p>
                  <p className="text-sm font-bold text-foreground">₹{goal.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Total Required</p>
              <p className="text-lg font-bold text-foreground">₹{totalGoalsAmount.veryShortTerm.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {/* Short-Medium Term Goals */}
        <Card className="p-6 card-glass">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Short-Medium Term</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">6 months - 3 years</p>
          
          <div className="space-y-3 mb-4">
            {financialData.goals.shortMediumTerm.map((goal, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-secondary/20 border border-border/50">
                <p className="font-semibold text-foreground text-sm">{goal.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">{goal.deadline}</p>
                  <p className="text-sm font-bold text-foreground">₹{goal.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Total Required</p>
              <p className="text-lg font-bold text-foreground">₹{totalGoalsAmount.shortMediumTerm.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {/* Long-Term Goals */}
        <Card className="p-6 card-glass">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Long-Term</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">3+ years horizon</p>
          
          <div className="space-y-3 mb-4">
            {financialData.goals.longTerm.map((goal, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-secondary/20 border border-border/50">
                <p className="font-semibold text-foreground text-sm">{goal.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">{goal.deadline}</p>
                  <p className="text-sm font-bold text-foreground">₹{(goal.amount / 1000).toFixed(0)}K</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Total Required</p>
              <p className="text-lg font-bold text-foreground">₹{(totalGoalsAmount.longTerm / 100000).toFixed(1)}L</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Imbalance Warnings */}
      {(Math.abs(allocationGaps.emergencyFund) > 10 || 
        Math.abs(allocationGaps.longTermInvestments) > 15) && (
        <Card className="p-6 bg-warning/5 border-warning/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Allocation Imbalances Detected</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {allocationGaps.emergencyFund < -10 && (
                  <li>• Your emergency fund is {Math.abs(allocationGaps.emergencyFund)}% below recommended. Consider building it up first.</li>
                )}
                {allocationGaps.longTermInvestments > 15 && (
                  <li>• You have {allocationGaps.longTermInvestments}% more in long-term investments than recommended. Ensure short-term needs are covered.</li>
                )}
                {allocationGaps.veryShortTerm < -5 && (
                  <li>• Very short-term savings are low. Keep some liquid funds for immediate needs.</li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

interface AllocationItemProps {
  label: string;
  icon: React.ElementType;
  recommended: number;
  actual: number;
  gap: number;
}

const AllocationItem = ({ label, icon: Icon, recommended, actual, gap }: AllocationItemProps) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">{label}</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            gap > 5 && "bg-warning/10 text-warning border-warning/30",
            gap < -5 && "bg-destructive/10 text-destructive border-destructive/30",
            Math.abs(gap) <= 5 && "bg-success/10 text-success border-success/30"
          )}
        >
          {gap > 0 ? "+" : ""}{gap}%
        </Badge>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Recommended: {recommended}%</span>
            <span className="font-semibold text-foreground">Actual: {actual}%</span>
          </div>
          <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                Math.abs(gap) <= 5 ? "bg-success" : gap > 5 ? "bg-warning" : "bg-destructive"
              )}
              style={{ width: `${actual}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

function calculateHealthScore(emergencyFundProgress: number, gaps: Record<string, number>): number {
  const emergencyScore = Math.min(emergencyFundProgress, 100) * 0.4;
  
  const allocationScore = Object.values(gaps).reduce((score, gap) => {
    const penalty = Math.abs(gap) > 15 ? 15 : Math.abs(gap) > 10 ? 10 : Math.abs(gap) > 5 ? 5 : 0;
    return score - penalty;
  }, 60);

  return Math.round(Math.max(0, Math.min(100, emergencyScore + allocationScore)));
}
