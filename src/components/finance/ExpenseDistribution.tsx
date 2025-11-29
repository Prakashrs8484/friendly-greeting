import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useState } from "react";
import { PieChart as PieChartIcon, BarChart3, Donut, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CategoryData {
  name: string;
  value: number;
  color: string;
  percentage: number;
  emoji: string;
}

type TimePeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Sample data for different time periods
const EXPENSE_DATA_BY_PERIOD: Record<TimePeriod, CategoryData[]> = {
  weekly: [
    { name: "Health", value: 210, color: "#FF6B6B", percentage: 28.0, emoji: "🏥" },
    { name: "Food", value: 180, color: "#FF8E53", percentage: 24.0, emoji: "🍔" },
    { name: "Transport", value: 145, color: "#4ECDC4", percentage: 19.3, emoji: "🚗" },
    { name: "Entertainment", value: 105, color: "#FFE66D", percentage: 14.0, emoji: "🎬" },
    { name: "Shopping", value: 85, color: "#A78BFA", percentage: 11.3, emoji: "🛍️" },
    { name: "Social Life", value: 25, color: "#95E1D3", percentage: 3.4, emoji: "🎪" },
  ],
  monthly: [
    { name: "Health", value: 850, color: "#FF6B6B", percentage: 26.7, emoji: "🏥" },
    { name: "Food", value: 720, color: "#FF8E53", percentage: 22.6, emoji: "🍔" },
    { name: "Transport", value: 580, color: "#4ECDC4", percentage: 18.2, emoji: "🚗" },
    { name: "Entertainment", value: 450, color: "#FFE66D", percentage: 14.2, emoji: "🎬" },
    { name: "Shopping", value: 380, color: "#A78BFA", percentage: 11.9, emoji: "🛍️" },
    { name: "Social Life", value: 200, color: "#95E1D3", percentage: 6.4, emoji: "🎪" },
  ],
  quarterly: [
    { name: "Health", value: 2550, color: "#FF6B6B", percentage: 27.2, emoji: "🏥" },
    { name: "Food", value: 2160, color: "#FF8E53", percentage: 23.0, emoji: "🍔" },
    { name: "Transport", value: 1740, color: "#4ECDC4", percentage: 18.5, emoji: "🚗" },
    { name: "Entertainment", value: 1350, color: "#FFE66D", percentage: 14.4, emoji: "🎬" },
    { name: "Shopping", value: 1140, color: "#A78BFA", percentage: 12.1, emoji: "🛍️" },
    { name: "Social Life", value: 450, color: "#95E1D3", percentage: 4.8, emoji: "🎪" },
  ],
  yearly: [
    { name: "Health", value: 10200, color: "#FF6B6B", percentage: 26.5, emoji: "🏥" },
    { name: "Food", value: 8640, color: "#FF8E53", percentage: 22.4, emoji: "🍔" },
    { name: "Transport", value: 6960, color: "#4ECDC4", percentage: 18.1, emoji: "🚗" },
    { name: "Entertainment", value: 5400, color: "#FFE66D", percentage: 14.0, emoji: "🎬" },
    { name: "Shopping", value: 4560, color: "#A78BFA", percentage: 11.8, emoji: "🛍️" },
    { name: "Social Life", value: 2760, color: "#95E1D3", percentage: 7.2, emoji: "🎪" },
  ],
};


const renderCustomLabel = (props: any, hoveredCategory: string | null, setHoveredCategory: (cat: string | null) => void, isMobile: boolean = false) => {
  const { cx, cy, midAngle, outerRadius, fill, payload, percent } = props;
  const isHovered = hoveredCategory === payload.name;
  const RADIAN = Math.PI / 180;
  
  // Tighter label positioning for compact layout
  const labelRadius = isMobile ? outerRadius + 25 : outerRadius + 45;
  const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);
  
  // Shorter connector line starting point
  const lineStartX = cx + (outerRadius + 2) * Math.cos(-midAngle * RADIAN);
  const lineStartY = cy + (outerRadius + 2) * Math.sin(-midAngle * RADIAN);
  
  // Simplified control points for smoother, tighter curves
  const cp1Offset = isMobile ? 8 : 15;
  const bendOffset = isMobile ? 20 : 35;
  
  const controlPointX = cx + (outerRadius + cp1Offset) * Math.cos(-midAngle * RADIAN);
  const controlPointY = cy + (outerRadius + cp1Offset) * Math.sin(-midAngle * RADIAN);
  
  // End point before short horizontal line
  const bendPointX = cx + (outerRadius + bendOffset) * Math.cos(-midAngle * RADIAN);
  const bendPointY = cy + (outerRadius + bendOffset) * Math.sin(-midAngle * RADIAN);
  
  const isRightSide = x > cx;
  const textAnchor = isRightSide ? 'start' : 'end';
  
  // Short horizontal line end point
  const lineEndX = isRightSide ? bendPointX + 8 : bendPointX - 8;
  
  return (
    <g 
      onMouseEnter={() => setHoveredCategory(payload.name)}
      onMouseLeave={() => setHoveredCategory(null)}
      style={{ cursor: 'pointer' }}
      className="transition-all duration-200"
    >
      {/* Thinner, smoother connector line */}
      <path
        d={`M ${lineStartX} ${lineStartY} Q ${controlPointX} ${controlPointY}, ${bendPointX} ${bendPointY} L ${lineEndX} ${bendPointY}`}
        stroke={fill}
        strokeWidth={isHovered ? 1.5 : 1}
        fill="none"
        opacity={isHovered ? 0.9 : 0.6}
        strokeLinecap="round"
        className="transition-all duration-200"
      />
      
      {/* Compact emoji icon */}
      <text
        x={lineEndX}
        y={bendPointY - 6}
        textAnchor={textAnchor}
        fontSize={isHovered ? 16 : 14}
        dominantBaseline="middle"
        className="transition-all duration-200"
      >
        {payload.emoji}
      </text>
      
      {/* Category name - more compact */}
      <text
        x={lineEndX}
        y={bendPointY + 6}
        textAnchor={textAnchor}
        fill="hsl(var(--foreground))"
        fontSize={isHovered ? 12 : 11}
        fontWeight={isHovered ? 600 : 500}
        className="transition-all duration-200"
      >
        {payload.name}
      </text>
      
      {/* Percentage - compact */}
      <text
        x={lineEndX}
        y={bendPointY + 18}
        textAnchor={textAnchor}
        fill={fill}
        fontSize={isHovered ? 11 : 10}
        fontWeight={600}
        className="transition-all duration-200"
      >
        {(percent * 100).toFixed(1)}%
      </text>
    </g>
  );
};

interface ExpenseDistributionProps {
  onCategoryClick?: (category: string) => void;
  activeCategory?: string;
}

type ChartType = 'pie' | 'bar' | 'donut';

export const ExpenseDistribution = ({ onCategoryClick, activeCategory }: ExpenseDistributionProps) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  const handleCategoryClick = (category: string) => {
    onCategoryClick?.(category);
  };

  const handlePeriodChange = (newPeriod: TimePeriod) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setTimePeriod(newPeriod);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const EXPENSE_DATA = EXPENSE_DATA_BY_PERIOD[timePeriod];
  const totalExpenses = EXPENSE_DATA.reduce((sum, item) => sum + item.value, 0);

  const chartTypes = [
    { type: 'pie' as ChartType, icon: PieChartIcon, label: 'Pie Chart' },
    { type: 'bar' as ChartType, icon: BarChart3, label: 'Bar Chart' },
    { type: 'donut' as ChartType, icon: Donut, label: 'Donut Chart' },
  ];

  const periodLabels: Record<TimePeriod, string> = {
    weekly: 'Week',
    monthly: 'Month',
    quarterly: 'Quarter',
    yearly: 'Year',
  };

  return (
    <Card className="card-hover card-glass bg-gradient-to-br from-card to-card/50 w-full overflow-hidden">
      <CardHeader className="p-3 sm:p-6">
        <div className="flex flex-col gap-3 sm:gap-4 w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 w-full">
            <CardTitle className="text-sm sm:text-xl font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between flex-1 gap-1 sm:gap-0 w-full">
              <span className="text-base sm:text-xl">Expense Distribution</span>
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                Total: ₹{totalExpenses.toLocaleString()}
              </span>
            </CardTitle>
            
            {/* Chart Type Switcher */}
            <div className="flex items-center gap-0.5 sm:gap-1 sm:ml-4 p-0.5 sm:p-1 bg-muted/30 rounded-lg shrink-0">
              {chartTypes.map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => setChartType(type)}
                  className={`h-7 w-7 sm:h-9 sm:w-9 p-0 transition-all duration-300 ${
                    chartType === type
                      ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground'
                      : 'hover:bg-muted/50'
                  }`}
                  title={label}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Time Period Selector */}
          <Tabs value={timePeriod} onValueChange={(value) => handlePeriodChange(value as TimePeriod)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/30 h-auto">
              <TabsTrigger 
                value="weekly" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 text-xs sm:text-sm py-1.5 sm:py-2 px-1 sm:px-3"
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Week</span>
                <span className="xs:hidden">W</span>
              </TabsTrigger>
              <TabsTrigger 
                value="monthly"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 text-xs sm:text-sm py-1.5 sm:py-2 px-1 sm:px-3"
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Month</span>
                <span className="xs:hidden">M</span>
              </TabsTrigger>
              <TabsTrigger 
                value="quarterly"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 text-xs sm:text-sm py-1.5 sm:py-2 px-1 sm:px-3"
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Quarter</span>
                <span className="xs:hidden">Q</span>
              </TabsTrigger>
              <TabsTrigger 
                value="yearly"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 text-xs sm:text-sm py-1.5 sm:py-2 px-1 sm:px-3"
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline">Year</span>
                <span className="xs:hidden">Y</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`min-h-[450px] w-full relative transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {/* Pie Chart View */}
          <div 
            className={`absolute inset-0 transition-all duration-500 ${
              chartType === 'pie' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={isMobile ? { top: 10, right: 50, bottom: 10, left: 50 } : { top: 20, right: 100, bottom: 20, left: 100 }}>
              <Pie
                data={EXPENSE_DATA}
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 70 : 100}
                paddingAngle={1}
                dataKey="value"
                onClick={(data) => handleCategoryClick(data.name)}
                className="cursor-pointer"
                label={(props) => renderCustomLabel(props, hoveredCategory, setHoveredCategory, isMobile)}
                labelLine={false}
                isAnimationActive={true}
                animationDuration={400}
                animationBegin={0}
                animationEasing="ease-out"
              >
                {EXPENSE_DATA.map((entry, index) => {
                  const isHovered = hoveredCategory === entry.name;
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="hsl(var(--background))"
                      strokeWidth={isHovered ? 2.5 : 1.5}
                      opacity={hoveredCategory && !isHovered ? 0.4 : 1}
                      className="transition-all duration-200"
                      onMouseEnter={() => setHoveredCategory(entry.name)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      style={{
                        filter: isHovered ? `drop-shadow(0 0 6px ${entry.color}80)` : 'none',
                        transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                        transformOrigin: 'center',
                      }}
                    />
                  );
                })}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          </div>

          {/* Bar Chart View */}
          <div 
            className={`absolute inset-0 transition-all duration-500 ${
              chartType === 'bar' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={EXPENSE_DATA}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                  label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                  onMouseEnter={(data) => setHoveredCategory(data.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={(data) => handleCategoryClick(data.name)}
                  className="cursor-pointer"
                  isAnimationActive={true}
                  animationDuration={400}
                  animationEasing="ease-out"
                >
                  {EXPENSE_DATA.map((entry, index) => {
                    const isHovered = hoveredCategory === entry.name;
                    return (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={hoveredCategory && !isHovered ? 0.4 : 1}
                        style={{
                          filter: isHovered ? `drop-shadow(0 4px 8px ${entry.color}80)` : 'none',
                        }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut Chart View */}
          <div 
            className={`absolute inset-0 transition-all duration-500 ${
              chartType === 'donut' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={isMobile ? { top: 10, right: 50, bottom: 10, left: 50 } : { top: 20, right: 100, bottom: 20, left: 100 }}>
                <Pie
                  data={EXPENSE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 45 : 65}
                  outerRadius={isMobile ? 70 : 100}
                  paddingAngle={1}
                  dataKey="value"
                  onClick={(data) => handleCategoryClick(data.name)}
                  className="cursor-pointer"
                  label={(props) => renderCustomLabel(props, hoveredCategory, setHoveredCategory, isMobile)}
                  labelLine={false}
                  isAnimationActive={true}
                  animationDuration={400}
                  animationBegin={0}
                  animationEasing="ease-out"
                >
                  {EXPENSE_DATA.map((entry, index) => {
                    const isHovered = hoveredCategory === entry.name;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="hsl(var(--background))"
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        opacity={hoveredCategory && !isHovered ? 0.4 : 1}
                        className="transition-all duration-200"
                        onMouseEnter={() => setHoveredCategory(entry.name)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        style={{
                          filter: isHovered ? `drop-shadow(0 0 6px ${entry.color}80)` : 'none',
                          transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                          transformOrigin: 'center',
                        }}
                      />
                    );
                  })}
                </Pie>
                {/* Center Label for Donut */}
                <text
                  x="50%"
                  y="48%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-2xl font-bold"
                  fill="hsl(var(--foreground))"
                >
                  ₹{totalExpenses.toLocaleString()}
                </text>
                <text
                  x="50%"
                  y="55%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm"
                  fill="hsl(var(--muted-foreground))"
                >
                  Total Expenses
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Summary Panel */}
        <div className="mt-6 space-y-2 pt-4 border-t border-border/50">
          {EXPENSE_DATA.map((category, idx) => {
            const isHovered = hoveredCategory === category.name;
            return (
              <div
                key={idx}
                onClick={() => handleCategoryClick(category.name)}
                onMouseEnter={() => setHoveredCategory(category.name)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-accent/10 group"
                style={{
                  backgroundColor: isHovered ? `${category.color}15` : 'transparent',
                  transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full transition-all duration-200"
                    style={{ 
                      backgroundColor: category.color,
                      transform: isHovered ? 'scale(1.5)' : 'scale(1)',
                      boxShadow: isHovered ? `0 0 8px ${category.color}` : 'none',
                    }}
                  />
                  <span className="text-lg transition-transform duration-200" style={{ transform: isHovered ? 'scale(1.2)' : 'scale(1)' }}>
                    {category.emoji}
                  </span>
                  <span className="text-sm font-medium text-foreground transition-all duration-200" style={{ fontWeight: isHovered ? 600 : 500 }}>
                    {category.name}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-foreground">
                    ₹{category.value.toLocaleString()}
                  </span>
                  <span 
                    className="text-xs font-bold px-2.5 py-1 rounded-md transition-all duration-200"
                    style={{ 
                      backgroundColor: isHovered ? `${category.color}30` : `${category.color}20`,
                      color: category.color,
                      transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {category.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
