import { TrendingUp, PieChart as PieChartIcon, BarChart3, Target } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, Legend } from "recharts";

const categoryData = [
  { name: 'Mutual Funds', value: 58000, color: 'hsl(var(--chart-1))' },
  { name: 'Stocks', value: 125000, color: 'hsl(var(--chart-2))' },
  { name: 'Gold & Silver', value: 32500, color: 'hsl(var(--chart-3))' },
  { name: 'Debt Funds', value: 45000, color: 'hsl(var(--chart-4))' },
  { name: 'Crypto', value: 15000, color: 'hsl(var(--chart-5))' }
];

const riskData = [
  { name: 'Low Risk', value: 77500, color: 'hsl(142, 76%, 36%)' },
  { name: 'Medium Risk', value: 103000, color: 'hsl(48, 96%, 53%)' },
  { name: 'High Risk', value: 95000, color: 'hsl(0, 84%, 60%)' }
];

const growthData = [
  { month: 'Jan', invested: 100000, current: 105000 },
  { month: 'Feb', invested: 125000, current: 132000 },
  { month: 'Mar', invested: 150000, current: 162000 },
  { month: 'Apr', invested: 175000, current: 189000 },
  { month: 'May', invested: 200000, current: 220000 },
  { month: 'Jun', invested: 225000, current: 252000 },
  { month: 'Jul', invested: 250000, current: 275500 }
];

const topPerformers = [
  { name: 'TCS Equity', returns: 25.0, category: 'Stocks' },
  { name: 'HDFC Index Fund', returns: 16.0, category: 'Mutual Funds' },
  { name: 'Gold ETF', returns: 8.33, category: 'Gold & Silver' },
  { name: 'ICICI Debt Fund', returns: 7.2, category: 'Debt Funds' },
  { name: 'Bitcoin', returns: 5.5, category: 'Crypto' }
];

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 30;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="hsl(var(--foreground))"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${name} ${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

export const InvestmentAnalytics = () => {
  const totalInvested = 250000;
  const currentValue = 275500;
  const unrealizedGains = currentValue - totalInvested;
  const gainsPercent = ((unrealizedGains / totalInvested) * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Invested</p>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">₹{totalInvested.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Current Value</p>
              <PieChartIcon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">₹{currentValue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Unrealized Gains</p>
              <Target className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">₹{unrealizedGains.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Returns %</p>
              <BarChart3 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">+{gainsPercent}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Investment Allocation</h3>
            </div>
            <p className="text-sm text-muted-foreground">Category-wise breakdown</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={renderCustomLabel}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    strokeWidth={2}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: any) => `₹${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card className="bg-card/50 backdrop-blur border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Risk Distribution</h3>
            </div>
            <p className="text-sm text-muted-foreground">Portfolio risk analysis</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={renderCustomLabel}
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                    strokeWidth={2}
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: any) => `₹${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Investment Growth</h3>
          </div>
          <p className="text-sm text-muted-foreground">Invested vs Current Value over time</p>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: any) => `₹${value.toLocaleString()}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="invested" 
                  stroke="hsl(var(--chart-1))" 
                  strokeWidth={2}
                  name="Total Invested"
                  dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="current" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  name="Current Value"
                  dot={{ fill: "hsl(var(--chart-2))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="bg-card/50 backdrop-blur border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Top Performing Assets</h3>
          </div>
          <p className="text-sm text-muted-foreground">Best returns in your portfolio</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPerformers.map((asset, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-all border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{asset.category}</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-600 text-white">
                  +{asset.returns.toFixed(2)}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
