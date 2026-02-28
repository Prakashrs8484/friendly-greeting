import { TodoFeature } from "./TodoFeature";
import { NotesFeature } from "./NotesFeature";
import { AdviceFeature } from "./AdviceFeature";
import { IdeasFeature } from "./IdeasFeature";
import { ResearchTrackerFeature } from "./ResearchTrackerFeature";
import { PlannerFeature } from "./PlannerFeature";
import { AnalyticsFeature } from "./AnalyticsFeature";
import { DecisionFeature } from "./DecisionFeature";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trash2 } from "lucide-react";
import type { Feature, FeaturePlan } from "@/lib/agentPageApi";
import type { ComponentType } from "react";

interface FeatureRendererProps {
  feature: Feature;
  onDeleteFeature?: () => void;
}

interface FeatureComponentProps {
  feature: Feature;
  onDeleteFeature?: () => void;
}

/**
 * Feature Registry
 * Maps feature.type to the corresponding React component
 * NO FALLBACKS - unsupported types render placeholder
 */
const FEATURE_REGISTRY: Record<string, ComponentType<FeatureComponentProps>> = {
  "todo": TodoFeature,
  "notes": NotesFeature,
  "advice": AdviceFeature,
  "ideas": IdeasFeature,
  "research-tracker": ResearchTrackerFeature,
  "planner": PlannerFeature,
  "analytics": AnalyticsFeature,
  "decision": DecisionFeature,
  // Add more feature types here as components are created
};

/**
 * Placeholder component for unsupported feature types
 */
const UnsupportedFeaturePlaceholder = ({ feature, onDeleteFeature }: FeatureComponentProps) => {
  return (
    <Card className="rounded-2xl bg-card border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{feature.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {feature.agentIds && feature.agentIds.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {feature.agentIds.length} agent{feature.agentIds.length > 1 ? 's' : ''}
              </Badge>
            )}
            {onDeleteFeature && (
              <button
                type="button"
                onClick={() => {
                  if (!confirm(`Delete feature "${feature.name}"?`)) return;
                  onDeleteFeature();
                }}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
                aria-label="Delete feature"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        {feature.description && (
          <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground text-sm">
          Feature type "{feature.type}" is not yet supported. UI generation for this type is under development.
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * FeatureRenderer - Dynamically renders features based on feature.type
 * Uses registry pattern - NO fallbacks to IdeasFeature
 */
export const FeatureRenderer = ({ feature, onDeleteFeature }: FeatureRendererProps) => {
  const configPlan = (feature.config as { featurePlan?: FeaturePlan } | undefined)?.featurePlan;
  const renderType = feature.featurePlan?.type || configPlan?.type || feature.type;

  // Get component from registry based on feature.type or featurePlan.type
  const FeatureComponent = FEATURE_REGISTRY[renderType];

  // If feature type is not in registry, render placeholder
  if (!FeatureComponent) {
    return <UnsupportedFeaturePlaceholder feature={feature} onDeleteFeature={onDeleteFeature} />;
  }

  // Render the registered component
  return <FeatureComponent feature={feature} onDeleteFeature={onDeleteFeature} />;
};
