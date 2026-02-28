import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ListChecks, CalendarRange, Trash2 } from "lucide-react";
import type { Feature, FeaturePlan } from "@/lib/agentPageApi";

interface PlannerFeatureProps {
  feature: Feature;
  onDeleteFeature?: () => void;
}

const getPlan = (feature: Feature): FeaturePlan | null => {
  if (feature.featurePlan) return feature.featurePlan;
  const configPlan = (feature.config as { featurePlan?: FeaturePlan } | undefined)?.featurePlan;
  return configPlan || null;
};

export const PlannerFeature = ({ feature, onDeleteFeature }: PlannerFeatureProps) => {
  const plan = getPlan(feature);
  const ui = plan?.ui || [];

  const renderBlock = (block: { component: string }, idx: number) => {
    switch (block.component) {
      case "GoalList":
        return (
          <div key={`goal-list-${idx}`} className="rounded-xl border border-border p-4 bg-secondary">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Goals</span>
              </div>
              <Button size="sm" variant="outline" className="rounded-lg h-7 text-xs">
                Add Goal
              </Button>
            </div>
            <div className="space-y-2">
              {["Ship weekly report", "Finish 3 focus blocks", "Review backlog"].map((g) => (
                <div key={g} className="flex items-center gap-2 text-sm bg-card border border-border rounded-lg p-2">
                  <span className="w-2 h-2 rounded-full bg-primary/60" />
                  <span className="flex-1">{g}</span>
                  <Badge variant="outline" className="text-xs">In progress</Badge>
                </div>
              ))}
            </div>
          </div>
        );
      case "WeeklySummaryCard":
        return (
          <div key={`weekly-summary-${idx}`} className="rounded-xl border border-border p-4 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <CalendarRange className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Weekly Summary</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-secondary p-2 text-center">
                <div className="text-muted-foreground text-xs">Goals</div>
                <div className="font-semibold">6</div>
              </div>
              <div className="rounded-lg bg-secondary p-2 text-center">
                <div className="text-muted-foreground text-xs">Completed</div>
                <div className="font-semibold">3</div>
              </div>
              <div className="rounded-lg bg-secondary p-2 text-center">
                <div className="text-muted-foreground text-xs">Focus hrs</div>
                <div className="font-semibold">12</div>
              </div>
            </div>
          </div>
        );
      case "InsightsPanel":
        return (
          <div key={`insights-${idx}`} className="rounded-xl border border-border p-4 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI Insights</span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              {(plan?.aiCapabilities || ["suggest next best goal", "summarize progress", "detect overload"]).map((cap, i) => (
                <div key={`cap-${i}`} className="bg-card border border-border rounded-lg p-2">
                  {cap}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div key={`unknown-${idx}`} className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            UI block "{block.component}" is not implemented yet.
          </div>
        );
    }
  };

  return (
    <Card className="rounded-2xl bg-card border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{feature.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {feature.agentIds && feature.agentIds.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {feature.agentIds.length} agent{feature.agentIds.length > 1 ? "s" : ""}
              </Badge>
            )}
            {onDeleteFeature && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                onClick={() => {
                  if (!confirm(`Delete feature "${feature.name}"?`)) return;
                  onDeleteFeature();
                }}
                aria-label="Delete feature"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        {feature.description && (
          <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {ui.length > 0 ? ui.map(renderBlock) : (
          <div className="text-sm text-muted-foreground text-center py-6">
            No UI blocks defined for this plan yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
