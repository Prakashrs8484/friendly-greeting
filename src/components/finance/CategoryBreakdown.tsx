import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, ShoppingBag, Utensils, Car, Film, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryItem {
  name: string;
  icon: any;
  percentage: number;
  amount: number;
  color: string;
}

const CATEGORIES: CategoryItem[] = [
  { name: "Health", icon: Activity, percentage: 26.7, amount: 850, color: "hsl(var(--chart-1))" },
  { name: "Food", icon: Utensils, percentage: 22.6, amount: 720, color: "hsl(var(--chart-2))" },
  { name: "Transport", icon: Car, percentage: 18.2, amount: 580, color: "hsl(var(--chart-3))" },
  { name: "Entertainment", icon: Film, percentage: 14.2, amount: 450, color: "hsl(var(--chart-4))" },
  { name: "Shopping", icon: ShoppingBag, percentage: 11.9, amount: 380, color: "hsl(var(--chart-5))" },
  { name: "Bills", icon: FileText, percentage: 6.4, amount: 200, color: "hsl(var(--accent))" },
];

interface CategoryBreakdownProps {
  onCategoryClick?: (category: string) => void;
  activeCategory?: string;
}

export const CategoryBreakdown = ({ onCategoryClick, activeCategory }: CategoryBreakdownProps) => {
  return (
    <Card className="card-hover card-glass">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {CATEGORIES.map((category, idx) => (
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
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div 
                  className="p-2.5 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${category.color}15` }}
                >
                  <category.icon 
                    className="w-4 h-4" 
                    style={{ color: category.color }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{category.name}</p>
                  <p className="text-sm text-muted-foreground">₹{category.amount.toLocaleString()}</p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className="font-semibold flex-shrink-0 px-2.5 py-1"
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
