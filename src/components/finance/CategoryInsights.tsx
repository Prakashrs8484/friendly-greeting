import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TrendDataPoint = { month: string; amount: number };
type Transaction = { date: string; description: string; amount: number };

const EXPENSE_TREND_DATA: Record<string, TrendDataPoint[]> = {
  Health: [
    { month: "Jul", amount: 650 },
    { month: "Aug", amount: 720 },
    { month: "Sep", amount: 680 },
    { month: "Oct", amount: 800 },
    { month: "Nov", amount: 850 },
  ],
  Food: [
    { month: "Jul", amount: 800 },
    { month: "Aug", amount: 750 },
    { month: "Sep", amount: 690 },
    { month: "Oct", amount: 700 },
    { month: "Nov", amount: 720 },
  ],
  Transport: [
    { month: "Jul", amount: 500 },
    { month: "Aug", amount: 550 },
    { month: "Sep", amount: 520 },
    { month: "Oct", amount: 600 },
    { month: "Nov", amount: 580 },
  ],
};

const INCOME_TREND_DATA: Record<string, TrendDataPoint[]> = {
  "Job Salary": [
    { month: "Jul", amount: 42000 },
    { month: "Aug", amount: 43000 },
    { month: "Sep", amount: 44000 },
    { month: "Oct", amount: 44500 },
    { month: "Nov", amount: 45000 },
  ],
  Freelance: [
    { month: "Jul", amount: 18000 },
    { month: "Aug", amount: 19500 },
    { month: "Sep", amount: 21000 },
    { month: "Oct", amount: 20500 },
    { month: "Nov", amount: 22500 },
  ],
  Classes: [
    { month: "Jul", amount: 10000 },
    { month: "Aug", amount: 9500 },
    { month: "Sep", amount: 8500 },
    { month: "Oct", amount: 8000 },
    { month: "Nov", amount: 9000 },
  ],
  Investments: [
    { month: "Jul", amount: 6000 },
    { month: "Aug", amount: 6200 },
    { month: "Sep", amount: 6400 },
    { month: "Oct", amount: 6600 },
    { month: "Nov", amount: 6750 },
  ],
  Business: [
    { month: "Jul", amount: 5500 },
    { month: "Aug", amount: 6000 },
    { month: "Sep", amount: 6200 },
    { month: "Oct", amount: 6500 },
    { month: "Nov", amount: 6750 },
  ],
};

const EXPENSE_TRANSACTIONS: Record<string, Transaction[]> = {
  Health: [
    { date: "Nov 28", description: "Pharmacy - Medicines", amount: 250 },
    { date: "Nov 25", description: "Gym Membership", amount: 500 },
    { date: "Nov 20", description: "Doctor Consultation", amount: 100 },
  ],
  Food: [
    { date: "Nov 29", description: "Grocery Store", amount: 380 },
    { date: "Nov 27", description: "Restaurant Dinner", amount: 220 },
    { date: "Nov 24", description: "Coffee Shop", amount: 120 },
  ],
  Transport: [
    { date: "Nov 28", description: "Fuel", amount: 300 },
    { date: "Nov 25", description: "Uber Rides", amount: 180 },
    { date: "Nov 22", description: "Metro Card", amount: 100 },
  ],
};

const INCOME_TRANSACTIONS: Record<string, Transaction[]> = {
  "Job Salary": [
    { date: "Nov 30", description: "Monthly Salary", amount: 45000 },
    { date: "Oct 31", description: "Monthly Salary", amount: 44500 },
    { date: "Sep 30", description: "Monthly Salary", amount: 44000 },
  ],
  Freelance: [
    { date: "Nov 28", description: "Web Development Project", amount: 12000 },
    { date: "Nov 15", description: "Logo Design", amount: 6500 },
    { date: "Nov 05", description: "Consultation", amount: 4000 },
  ],
  Classes: [
    { date: "Nov 25", description: "Online Course Batch 3", amount: 5000 },
    { date: "Nov 10", description: "Workshop Session", amount: 4000 },
  ],
  Investments: [
    { date: "Nov 30", description: "Mutual Fund Returns", amount: 4500 },
    { date: "Nov 15", description: "Stock Dividends", amount: 2250 },
  ],
  Business: [
    { date: "Nov 27", description: "Product Sales", amount: 4000 },
    { date: "Nov 18", description: "Service Revenue", amount: 2750 },
  ],
};

interface CategoryInsightsProps {
  category: string;
  onClose: () => void;
  mode?: "expense" | "income";
}

export const CategoryInsights = ({ category, onClose, mode = "expense" }: CategoryInsightsProps) => {
  const isIncomeMode = mode === "income";
  
  const trendDataSource: Record<string, TrendDataPoint[]> = isIncomeMode ? INCOME_TREND_DATA : EXPENSE_TREND_DATA;
  const transactionsSource: Record<string, Transaction[]> = isIncomeMode ? INCOME_TRANSACTIONS : EXPENSE_TRANSACTIONS;
  
  const defaultTrendData = isIncomeMode ? INCOME_TREND_DATA["Job Salary"] : EXPENSE_TREND_DATA.Health;
  const defaultTransactions = isIncomeMode ? INCOME_TRANSACTIONS["Job Salary"] : EXPENSE_TRANSACTIONS.Health;
  
  const trendData: TrendDataPoint[] = trendDataSource[category] || defaultTrendData;
  const transactions: Transaction[] = transactionsSource[category] || defaultTransactions;
  
  const currentAmount = trendData[trendData.length - 1].amount;
  const previousAmount = trendData[trendData.length - 2].amount;
  const change = ((currentAmount - previousAmount) / previousAmount) * 100;
  const isIncrease = change > 0;

  return (
    <Card className="card-hover card-glass w-full overflow-hidden">
      <CardHeader className="p-3 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-xl font-semibold truncate">{category} Insights</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-6">
        {/* Trend Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">5-Month Trend</h3>
            <Badge 
              variant="outline" 
              className={cn(
                "font-semibold",
                isIncrease ? "text-destructive border-destructive/20" : "text-success border-success/20"
              )}
            >
              {isIncrease ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {Math.abs(change).toFixed(1)}%
            </Badge>
          </div>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-lg">
                          <p className="text-sm font-semibold">₹{payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            {isIncomeMode ? "Recent Income" : "Recent Transactions"}
          </h3>
          <div className="space-y-2">
            {transactions.map((txn, idx) => (
              <div 
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-accent/5 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">{txn.date}</p>
                </div>
                <p className="text-sm font-semibold text-foreground">₹{txn.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
