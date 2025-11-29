import { TrendingDown, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useState } from "react";

interface ExpenseData {
  category: string;
  amount: number;
  color: string;
}

const expenseData: ExpenseData[] = [
  { category: "Food", amount: 680, color: "hsl(var(--primary))" },
  { category: "Transport", amount: 420, color: "hsl(var(--accent))" },
  { category: "Bills", amount: 850, color: "hsl(var(--chart-1))" },
  { category: "Entertainment", amount: 320, color: "hsl(var(--chart-2))" },
  { category: "Shopping", amount: 560, color: "hsl(var(--chart-3))" },
  { category: "Healthcare", amount: 350, color: "hsl(var(--chart-4))" },
];

export const ExpenseTracker = () => {
  const [viewType, setViewType] = useState<"bar" | "pie">("bar");
  const [timePeriod, setTimePeriod] = useState("month");

  const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Expense Breakdown</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Total: ₹{totalExpenses.toLocaleString()} this {timePeriod}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={viewType} onValueChange={(v) => setViewType(v as "bar" | "pie")}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === "bar" ? (
            <BarChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="category" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="hsl(var(--primary))"
                dataKey="amount"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6">
        {expenseData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/20">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{item.category}</p>
              <p className="text-sm font-semibold text-foreground">₹{item.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
