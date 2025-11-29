import { TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState } from "react";

const incomeData = [
  { month: "May", salary: 4800, freelance: 0, other: 0 },
  { month: "Jun", salary: 5100, freelance: 0, other: 0 },
  { month: "Jul", salary: 4900, freelance: 0, other: 0 },
  { month: "Aug", salary: 5300, freelance: 0, other: 0 },
  { month: "Sep", salary: 5000, freelance: 0, other: 0 },
  { month: "Oct", salary: 5200, freelance: 800, other: 150 },
];

export const IncomeTracker = () => {
  const [timePeriod, setTimePeriod] = useState("6months");

  const totalIncome = incomeData[incomeData.length - 1].salary + 
    incomeData[incomeData.length - 1].freelance + 
    incomeData[incomeData.length - 1].other;

  return (
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Income Trends</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Total this month: ₹{totalIncome.toLocaleString()}
          </p>
        </div>
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-[150px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3months">Last 3 Months</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={incomeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="salary"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Salary"
            />
            <Line
              type="monotone"
              dataKey="freelance"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              name="Freelance"
            />
            <Line
              type="monotone"
              dataKey="other"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              name="Other"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Salary</p>
          <p className="text-lg font-bold text-foreground">
            ₹{incomeData[incomeData.length - 1].salary.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
          <p className="text-xs text-muted-foreground mb-1">Freelance</p>
          <p className="text-lg font-bold text-foreground">
            ₹{incomeData[incomeData.length - 1].freelance.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Other</p>
          <p className="text-lg font-bold text-foreground">
            ₹{incomeData[incomeData.length - 1].other.toLocaleString()}
          </p>
        </div>
      </div>
    </Card>
  );
};
