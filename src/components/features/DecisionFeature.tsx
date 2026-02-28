import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ListChecks, HelpCircle, Trash2 } from "lucide-react";
import type { Feature, FeaturePlan } from "@/lib/agentPageApi";

interface DecisionFeatureProps {
  feature: Feature;
  onDeleteFeature?: () => void;
}

const getPlan = (feature: Feature): FeaturePlan | null => {
  if (feature.featurePlan) return feature.featurePlan;
  const configPlan = (feature.config as { featurePlan?: FeaturePlan } | undefined)?.featurePlan;
  return configPlan || null;
};

export const DecisionFeature = ({ feature, onDeleteFeature }: DecisionFeatureProps) => {
  const plan = getPlan(feature);
  const ui = plan?.ui || [];

  const renderBlock = (block: { component: string }, idx: number) => {
    switch (block.component) {
      case "DecisionPrompt":
        return (
          <div key={`prompt-${idx}`} className="rounded-xl border border-border p-4 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Decision</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {plan?.description || "Define the decision you are trying to make and the constraints that matter."}
            </p>
          </div>
        );
      case "OptionsList":
        return (
          <div key={`options-${idx}`} className="rounded-xl border border-border p-4 bg-secondary">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Options</span>
              </div>
              <Button size="sm" variant="outline" className="rounded-lg h-7 text-xs">
                Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {["Option A: Ship now", "Option B: Add refinements", "Option C: Hold for feedback"].map((opt) => (
                <div key={opt} className="rounded-lg bg-card border border-border p-2 text-sm">
                  {opt}
                </div>
              ))}
            </div>
          </div>
        );
      case "RecommendationPanel":
        return (
          <div key={`recommend-${idx}`} className="rounded-xl border border-border p-4 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Recommendation</span>
            </div>
            <div className="text-sm text-muted-foreground bg-card border border-border rounded-lg p-3">
              Based on your constraints, prioritize the option with the highest impact and lowest risk.
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
            <HelpCircle className="w-5 h-5 text-primary" />
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
