import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Code, BookOpen, TrendingUp, Building } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryItem {
  name: string;
  icon: any;
  percentage: number;
  amount: number;
  color: string;
}

const INCOME_CATEGORIES: CategoryItem[] = [
  { name: "Job Salary", icon: Briefcase, percentage: 50.0, amount: 45000, color: "hsl(var(--chart-1))" },
  { name: "Freelance", icon: Code, percentage: 25.0, amount: 22500, color: "hsl(var(--chart-2))" },
  { name: "Classes", icon: BookOpen, percentage: 10.0, amount: 9000, color: "hsl(var(--chart-3))" },
  { name: "Investments", icon: TrendingUp, percentage: 7.5, amount: 6750, color: "hsl(var(--chart-4))" },
  { name: "Business", icon: Building, percentage: 7.5, amount: 6750, color: "hsl(var(--chart-5))" },
];

interface IncomeBreakdownProps {
  onCategoryClick?: (category: string) => void;
  activeCategory?: string;
}

export const IncomeBreakdown = ({ onCategoryClick, activeCategory }: IncomeBreakdownProps) => {
  return (
    <Card className="card-hover card-glass">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Income Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {INCOME_CATEGORIES.map((category, idx) => (
          <div
            key={idx}
            onClick={() => onCategoryClick?.(category.name)}
            className={cn(
              "p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md",
              activeCategory === category.name 
                ? "border-primary bg-primary/5 shadow-sm" 
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2.5 rounded-lg"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <category.icon 
                    className="w-4 h-4" 
                    style={{ color: category.color }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{category.name}</p>
                  <p className="text-sm text-muted-foreground">₹{category.amount.toLocaleString()}</p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className="font-semibold"
                style={{ 
                  borderColor: category.color,
                  color: category.color,
                  backgroundColor: `${category.color}10`
                }}
              >
                {category.percentage}%
              </Badge>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
                style={{
                  width: `${category.percentage}%`,
                  backgroundColor: category.color,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
