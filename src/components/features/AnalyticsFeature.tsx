import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, BarChart3, TrendingUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Feature, FeaturePlan } from "@/lib/agentPageApi";

interface AnalyticsFeatureProps {
  feature: Feature;
  onDeleteFeature?: () => void;
}

const getPlan = (feature: Feature): FeaturePlan | null => {
  if (feature.featurePlan) return feature.featurePlan;
  const configPlan = (feature.config as { featurePlan?: FeaturePlan } | undefined)?.featurePlan;
  return configPlan || null;
};

export const AnalyticsFeature = ({ feature, onDeleteFeature }: AnalyticsFeatureProps) => {
  const plan = getPlan(feature);
  const ui = plan?.ui || [];

  const renderBlock = (block: { component: string }, idx: number) => {
    switch (block.component) {
      case "SummaryCards":
        return (
          <div key={`summary-${idx}`} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {["Output", "Focus", "Quality"].map((label) => (
              <div key={label} className="rounded-xl border border-border p-3 bg-secondary">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-lg font-semibold mt-1">{label === "Output" ? "72%" : label === "Focus" ? "18h" : "A-"}</div>
              </div>
            ))}
          </div>
        );
      case "TrendChart":
        return (
          <div key={`trend-${idx}`} className="rounded-xl border border-border p-4 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Trend</span>
            </div>
            <div className="h-28 rounded-lg bg-secondary flex items-center justify-center text-xs text-muted-foreground">
              Placeholder line chart
            </div>
          </div>
        );
      case "BreakdownChart":
        return (
          <div key={`breakdown-${idx}`} className="rounded-xl border border-border p-4 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Breakdown</span>
            </div>
            <div className="h-28 rounded-lg bg-secondary flex items-center justify-center text-xs text-muted-foreground">
              Placeholder bar chart
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
              {(plan?.aiCapabilities || ["surface key metrics", "explain anomalies", "suggest next questions"]).map((cap, i) => (
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
            <BarChart3 className="w-5 h-5 text-primary" />
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
