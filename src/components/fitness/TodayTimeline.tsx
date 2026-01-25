import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  Coffee, 
  Utensils, 
  Apple, 
  Moon, 
  Dumbbell, 
  Footprints, 
  Droplet,
  Sparkles,
  Edit2,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  type: "breakfast" | "lunch" | "snack" | "dinner" | "workout" | "activity" | "water";
  time: string;
  title: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  caloriesBurned?: number;
  duration?: number;
  isAiEstimated?: boolean;
}

interface TodayTimelineProps {
  items: TimelineItem[];
  waterIntake: number;
  waterTarget: number;
  onEditItem?: (id: string) => void;
  onAddWater?: () => void;
}

const typeIcons = {
  breakfast: Coffee,
  lunch: Utensils,
  snack: Apple,
  dinner: Moon,
  workout: Dumbbell,
  activity: Footprints,
  water: Droplet,
};

const typeColors = {
  breakfast: "from-amber-500 to-orange-500",
  lunch: "from-emerald-500 to-teal-500",
  snack: "from-pink-500 to-rose-500",
  dinner: "from-indigo-500 to-purple-500",
  workout: "from-primary to-emerald-500",
  activity: "from-blue-500 to-cyan-500",
  water: "from-sky-400 to-blue-500",
};

export function TodayTimeline({ items, waterIntake, waterTarget, onEditItem, onAddWater }: TodayTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sortedItems = [...items].sort((a, b) => {
    const timeA = a.time.replace(":", "");
    const timeB = b.time.replace(":", "");
    return timeA.localeCompare(timeB);
  });

  const totalCaloriesIn = items
    .filter((i) => ["breakfast", "lunch", "snack", "dinner"].includes(i.type))
    .reduce((sum, i) => sum + (i.calories || 0), 0);

  const totalCaloriesBurned = items
    .filter((i) => ["workout", "activity"].includes(i.type))
    .reduce((sum, i) => sum + (i.caloriesBurned || 0), 0);

  const totalProtein = items.reduce((sum, i) => sum + (i.protein || 0), 0);

  return (
    <Card className="card-glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Today's Timeline
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {totalCaloriesIn} cal in
            </Badge>
            <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
              {totalCaloriesBurned} cal burned
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Water Quick Add */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium">Water Intake</p>
              <p className="text-xs text-muted-foreground">{waterIntake} / {waterTarget} glasses</p>
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={onAddWater}>
            + Add Glass
          </Button>
        </div>

        {/* Timeline Items */}
        {sortedItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Coffee className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No entries yet today</p>
            <p className="text-xs mt-1">Tell your AI Coach what you ate or did!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedItems.map((item, index) => {
              const Icon = typeIcons[item.type];
              const isExpanded = expandedItems.has(item.id);
              const isMeal = ["breakfast", "lunch", "snack", "dinner"].includes(item.type);

              return (
                <Collapsible key={item.id} open={isExpanded} onOpenChange={() => toggleExpand(item.id)}>
                  <Card 
                    className={cn(
                      "transition-all duration-200 border-l-4 hover:shadow-md",
                      isExpanded && "shadow-md"
                    )}
                    style={{ 
                      borderLeftColor: isMeal ? "hsl(var(--primary))" : "hsl(var(--success))" 
                    }}
                  >
                    <CollapsibleTrigger asChild>
                      <CardContent className="p-3 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                            typeColors[item.type]
                          )}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm text-foreground">{item.title}</h4>
                              {item.isAiEstimated && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/5 border-primary/20">
                                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                                  AI
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {isMeal && item.calories && (
                              <div className="text-right">
                                <p className="text-sm font-semibold text-foreground">{item.calories} cal</p>
                                <p className="text-xs text-muted-foreground">{item.protein}g protein</p>
                              </div>
                            )}
                            {!isMeal && item.caloriesBurned && (
                              <div className="text-right">
                                <p className="text-sm font-semibold text-success">-{item.caloriesBurned} cal</p>
                                <p className="text-xs text-muted-foreground">{item.duration} min</p>
                              </div>
                            )}
                            <ChevronDown className={cn(
                              "w-4 h-4 text-muted-foreground transition-transform",
                              isExpanded && "rotate-180"
                            )} />
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-3 pb-3 pt-0">
                        <div className="border-t border-border pt-3 space-y-2">
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                          {isMeal && (
                            <div className="flex gap-4 text-xs">
                              <span className="text-muted-foreground">
                                Carbs: <span className="font-medium text-foreground">{item.carbs}g</span>
                              </span>
                              <span className="text-muted-foreground">
                                Fats: <span className="font-medium text-foreground">{item.fats}g</span>
                              </span>
                            </div>
                          )}
                          <div className="flex justify-end pt-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 text-xs"
                              onClick={() => onEditItem?.(item.id)}
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        )}

        {/* Summary */}
        {items.length > 0 && (
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/50">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{totalCaloriesIn}</p>
                <p className="text-xs text-muted-foreground">Cal In</p>
              </div>
              <div>
                <p className="text-lg font-bold text-success">{totalCaloriesBurned}</p>
                <p className="text-xs text-muted-foreground">Cal Burned</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{totalProtein}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{totalCaloriesIn - totalCaloriesBurned}</p>
                <p className="text-xs text-muted-foreground">Net Cal</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TodayTimeline;
