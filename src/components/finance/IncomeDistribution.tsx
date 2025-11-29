import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useState, useEffect } from "react";
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
type ChartType = 'pie' | 'bar' | 'donut';

// Sample data for different time periods
const INCOME_DATA_BY_PERIOD: Record<TimePeriod, CategoryData[]> = {
  weekly: [
    { name: "Job Salary", value: 480, color: "#10B981", percentage: 48.0, emoji: "💼" },
    { name: "Freelance", value: 250, color: "#3B82F6", percentage: 25.0, emoji: "💻" },
    { name: "Classes", value: 120, color: "#8B5CF6", percentage: 12.0, emoji: "📚" },
    { name: "Investments", value: 80, color: "#F59E0B", percentage: 8.0, emoji: "📈" },
    { name: "Business", value: 70, color: "#EF4444", percentage: 7.0, emoji: "🏢" },
  ],
  monthly: [
    { name: "Job Salary", value: 45000, color: "#10B981", percentage: 50.0, emoji: "💼" },
    { name: "Freelance", value: 22500, color: "#3B82F6", percentage: 25.0, emoji: "💻" },
    { name: "Classes", value: 9000, color: "#8B5CF6", percentage: 10.0, emoji: "📚" },
    { name: "Investments", value: 6750, color: "#F59E0B", percentage: 7.5, emoji: "📈" },
    { name: "Business", value: 6750, color: "#EF4444", percentage: 7.5, emoji: "🏢" },
  ],
  quarterly: [
    { name: "Job Salary", value: 135000, color: "#10B981", percentage: 50.0, emoji: "💼" },
    { name: "Freelance", value: 67500, color: "#3B82F6", percentage: 25.0, emoji: "💻" },
    { name: "Classes", value: 27000, color: "#8B5CF6", percentage: 10.0, emoji: "📚" },
    { name: "Investments", value: 20250, color: "#F59E0B", percentage: 7.5, emoji: "📈" },
    { name: "Business", value: 20250, color: "#EF4444", percentage: 7.5, emoji: "🏢" },
  ],
  yearly: [
    { name: "Job Salary", value: 540000, color: "#10B981", percentage: 50.0, emoji: "💼" },
    { name: "Freelance", value: 270000, color: "#3B82F6", percentage: 25.0, emoji: "💻" },
    { name: "Classes", value: 108000, color: "#8B5CF6", percentage: 10.0, emoji: "📚" },
    { name: "Investments", value: 81000, color: "#F59E0B", percentage: 7.5, emoji: "📈" },
    { name: "Business", value: 81000, color: "#EF4444", percentage: 7.5, emoji: "🏢" },
  ],
};

const renderCustomLabel = (props: any, hoveredCategory: string | null, setHoveredCategory: (cat: string | null) => void, isMobile: boolean = false) => {
  const { cx, cy, midAngle, outerRadius, fill, payload, percent, index } = props;
  const isHovered = hoveredCategory === payload.name;
  const RADIAN = Math.PI / 180;
  
  // Dynamic label positioning based on screen size and slice position
  const baseRadius = isMobile ? outerRadius + 30 : outerRadius + 50;
  
  // Adjust label distance for better spacing on mobile
  const labelRadius = baseRadius + (isMobile ? index * 2 : 0);
  const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
  const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);
  
  // Connector line starting point
  const lineStartX = cx + (outerRadius + 2) * Math.cos(-midAngle * RADIAN);
  const lineStartY = cy + (outerRadius + 2) * Math.sin(-midAngle * RADIAN);
  
  // Control points for smooth curves
  const cp1Offset = isMobile ? 10 : 18;
  const bendOffset = isMobile ? 22 : 40;
  
  const controlPointX = cx + (outerRadius + cp1Offset) * Math.cos(-midAngle * RADIAN);
  const controlPointY = cy + (outerRadius + cp1Offset) * Math.sin(-midAngle * RADIAN);
  
  const bendPointX = cx + (outerRadius + bendOffset) * Math.cos(-midAngle * RADIAN);
  const bendPointY = cy + (outerRadius + bendOffset) * Math.sin(-midAngle * RADIAN);
  
  const isRightSide = x > cx;
  const horizontalEndX = isRightSide ? bendPointX + (isMobile ? 8 : 15) : bendPointX - (isMobile ? 8 : 15);
  
  const pathData = `
    M ${lineStartX},${lineStartY}
    Q ${controlPointX},${controlPointY} ${bendPointX},${bendPointY}
    L ${horizontalEndX},${bendPointY}
  `;

  return (
    <g 
      onMouseEnter={() => setHoveredCategory(payload.name)}
      onMouseLeave={() => setHoveredCategory(null)}
      style={{ cursor: 'pointer' }}
    >
      <path
        d={pathData}
        stroke={fill}
        strokeWidth={isHovered ? 2.5 : 2}
        fill="none"
        opacity={isHovered ? 1 : 0.85}
        style={{
          transition: 'all 0.3s ease',
          filter: isHovered ? `drop-shadow(0 0 4px ${fill})` : 'none'
        }}
      />
      
      <g transform={`translate(${x}, ${y})`}>
        <rect
          x={isRightSide ? (isMobile ? 3 : 8) : -(isMobile ? 78 : 98)}
          y={isMobile ? -16 : -20}
          width={isMobile ? 75 : 90}
          height={isMobile ? 32 : 40}
          fill={isHovered ? fill : 'hsl(var(--card))'}
          stroke={fill}
          strokeWidth={isHovered ? 2 : 1.5}
          rx={isMobile ? 6 : 8}
          opacity={isHovered ? 0.95 : 0.92}
          style={{
            transition: 'all 0.3s ease',
            filter: isHovered ? `drop-shadow(0 2px 8px ${fill}40)` : 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))'
          }}
        />
        
        <text
          x={isRightSide ? (isMobile ? 12 : 16) : -(isMobile ? 68 : 88)}
          y={isMobile ? -4 : -5}
          textAnchor="start"
          fill={isHovered ? 'white' : fill}
          className="font-semibold"
          style={{
            fontSize: isMobile ? '11px' : '13px',
            transition: 'fill 0.3s ease'
          }}
        >
          {payload.emoji} {payload.name}
        </text>
        
        <text
          x={isRightSide ? (isMobile ? 12 : 16) : -(isMobile ? 68 : 88)}
          y={isMobile ? 10 : 12}
          textAnchor="start"
          fill={isHovered ? 'white' : 'hsl(var(--muted-foreground))'}
          className="font-bold"
          style={{
            fontSize: isMobile ? '10px' : '12px',
            transition: 'fill 0.3s ease'
          }}
        >
          {(percent * 100).toFixed(1)}%
        </text>
      </g>
    </g>
  );
};

interface IncomeDistributionProps {
  onCategoryClick?: (category: string) => void;
  activeCategory?: string;
}

export const IncomeDistribution = ({ onCategoryClick, activeCategory }: IncomeDistributionProps) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);
  
  // Update isMobile on resize for better responsiveness
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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

  const INCOME_DATA = INCOME_DATA_BY_PERIOD[timePeriod];
  const totalIncome = INCOME_DATA.reduce((sum, item) => sum + item.value, 0);

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
              <span className="text-base sm:text-xl">Income Distribution</span>
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                Total: ₹{totalIncome.toLocaleString()}
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

      <CardContent className="p-3 sm:p-6">
        {/* Chart Container */}
        <div 
          className={`relative w-full transition-opacity duration-500 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ height: isMobile ? '280px' : '360px' }}
        >
          {/* Pie Chart View */}
          <div 
            className={`absolute inset-0 transition-all duration-500 ${
              chartType === 'pie' ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
            }`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={isMobile ? { top: 20, right: 60, bottom: 20, left: 60 } : { top: 30, right: 110, bottom: 30, left: 110 }}>
                <Pie
                  data={INCOME_DATA}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 65 : 95}
                  paddingAngle={2}
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
                  {INCOME_DATA.map((entry, index) => {
                    const isHovered = hoveredCategory === entry.name;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="hsl(var(--background))"
                        strokeWidth={isHovered ? 3 : 2}
                        opacity={hoveredCategory && !isHovered ? 0.4 : 1}
                        className="transition-all duration-200"
                        onMouseEnter={() => setHoveredCategory(entry.name)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        style={{
                          filter: isHovered ? `drop-shadow(0 0 8px ${entry.color}80)` : 'none',
                          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
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
                data={INCOME_DATA}
                margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
              >
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMobile ? 10 : 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Amount']}
                />
                <Bar 
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                  onClick={(data) => handleCategoryClick(data.name)}
                  className="cursor-pointer"
                  isAnimationActive={true}
                  animationDuration={400}
                  animationBegin={0}
                  animationEasing="ease-out"
                >
                  {INCOME_DATA.map((entry, index) => {
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
              <PieChart margin={isMobile ? { top: 20, right: 60, bottom: 20, left: 60 } : { top: 30, right: 110, bottom: 30, left: 110 }}>
                <Pie
                  data={INCOME_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 40 : 60}
                  outerRadius={isMobile ? 65 : 95}
                  paddingAngle={2}
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
                  {INCOME_DATA.map((entry, index) => {
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
                  ₹{totalIncome.toLocaleString()}
                </text>
                <text
                  x="50%"
                  y="55%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm"
                  fill="hsl(var(--muted-foreground))"
                >
                  Total Income
                </text>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Summary Panel */}
        <div className="mt-6 space-y-2 pt-4 border-t border-border/50">
          {INCOME_DATA.map((category, idx) => {
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
