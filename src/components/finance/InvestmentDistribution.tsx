import { PieChart, TrendingUp, Edit3, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface InvestmentDistributionProps {
  monthlyInvestmentAmount: number;
}

const defaultAllocations = {
  mutualFunds: 40,
  debtFunds: 20,
  stocks: 25,
  fd: 10,
  gold: 5
};

const expectedReturns = {
  mutualFunds: 12,
  debtFunds: 7,
  stocks: 15,
  fd: 6.5,
  gold: 8
};

export const InvestmentDistribution = ({ monthlyInvestmentAmount }: InvestmentDistributionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [allocations, setAllocations] = useState(defaultAllocations);
  const [tempAllocations, setTempAllocations] = useState(allocations);
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("yearly");

  const currentAllocations = isEditing ? tempAllocations : allocations;

  const blendedReturn = useMemo(() => {
    return Object.entries(currentAllocations).reduce((total, [key, percentage]) => {
      return total + (percentage * expectedReturns[key as keyof typeof expectedReturns]) / 100;
    }, 0);
  }, [currentAllocations]);

  const corpusGrowth = useMemo(() => {
    const data = [];
    const monthlyContribution = monthlyInvestmentAmount;
    let corpus = 0;
    const monthlyReturn = blendedReturn / 12 / 100;

    const periods = viewMode === "monthly" ? 60 : 20; // 5 years monthly or 20 years yearly

    for (let i = 0; i <= periods; i++) {
      if (viewMode === "monthly") {
        corpus = corpus * (1 + monthlyReturn) + monthlyContribution;
        data.push({
          period: `M${i}`,
          corpus: Math.round(corpus),
          contribution: monthlyContribution * i,
          returns: Math.round(corpus - monthlyContribution * i)
        });
      } else {
        const yearlyContribution = monthlyContribution * 12;
        for (let m = 0; m < 12; m++) {
          corpus = corpus * (1 + monthlyReturn) + monthlyContribution;
        }
        data.push({
          period: `Y${i}`,
          corpus: Math.round(corpus),
          contribution: yearlyContribution * i,
          returns: Math.round(corpus - yearlyContribution * i)
        });
      }
    }
    return data;
  }, [monthlyInvestmentAmount, blendedReturn, viewMode]);

  const handleEdit = () => {
    setTempAllocations(allocations);
    setIsEditing(true);
  };

  const handleSave = () => {
    const total = Object.values(tempAllocations).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 100) > 0.1) {
      toast.error("Allocations must sum to 100%");
      return;
    }
    setAllocations(tempAllocations);
    setIsEditing(false);
    toast.success("Investment distribution updated!");
  };

  const handleCancel = () => {
    setTempAllocations(allocations);
    setIsEditing(false);
  };

  const assetLabels = {
    mutualFunds: "Mutual Funds",
    debtFunds: "Debt Funds",
    stocks: "Stocks/Equity",
    fd: "Fixed Deposit",
    gold: "Gold"
  };

  return (
    <Card className="card-hover card-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <PieChart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Investment Distribution Planner</CardTitle>
              <p className="text-sm text-muted-foreground">
                Monthly Investment: ₹{monthlyInvestmentAmount.toLocaleString()} • Expected Return: {blendedReturn.toFixed(2)}%
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
        {/* Asset Allocation */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Asset Allocation</h4>
          {Object.entries(currentAllocations).map(([key, value]) => {
            const amount = Math.round((monthlyInvestmentAmount * value) / 100);
            return (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{assetLabels[key as keyof typeof assetLabels]}</span>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value) || 0;
                          setTempAllocations({
                            ...tempAllocations,
                            [key]: newValue
                          });
                        }}
                        className="w-16 h-7 text-xs text-right"
                        step="1"
                      />
                    ) : (
                      <span className="text-sm font-semibold">{value}%</span>
                    )}
                    <span className="text-xs text-muted-foreground w-24 text-right">
                      ₹{amount.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={value} className="h-2 flex-1" />
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {expectedReturns[key as keyof typeof expectedReturns]}% p.a.
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Corpus Growth Visualization */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Projected Corpus Growth</h4>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "monthly" | "yearly")} className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="monthly" className="text-xs">Monthly (5Y)</TabsTrigger>
                <TabsTrigger value="yearly" className="text-xs">Yearly (20Y)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={corpusGrowth}>
                <defs>
                  <linearGradient id="corpusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="period" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  interval={viewMode === "monthly" ? 11 : 3}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={11}
                  tickFormatter={(value) => `₹${(value / 100000).toFixed(1)}L`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      corpus: "Total Corpus",
                      contribution: "Total Contribution",
                      returns: "Total Returns"
                    };
                    return [`₹${value.toLocaleString()}`, labels[name] || name];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="corpus" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#corpusGradient)"
                />
                <Line 
                  type="monotone" 
                  dataKey="contribution" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Final Corpus</p>
              <p className="text-sm font-bold text-foreground">
                ₹{(corpusGrowth[corpusGrowth.length - 1].corpus / 100000).toFixed(2)}L
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Invested</p>
              <p className="text-sm font-bold text-foreground">
                ₹{(corpusGrowth[corpusGrowth.length - 1].contribution / 100000).toFixed(2)}L
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Total Returns</p>
              <p className="text-sm font-bold text-success">
                ₹{(corpusGrowth[corpusGrowth.length - 1].returns / 100000).toFixed(2)}L
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
