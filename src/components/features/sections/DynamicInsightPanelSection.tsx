import { useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicSectionShell } from "./DynamicSectionShell";
import { getFeatureInsights } from "@/lib/agentPageApi";
import {
  DynamicSection,
  getSectionOptions,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicInsightPanelSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
  pageId?: string;
}

export const DynamicInsightPanelSection = ({
  section,
  featureId,
  featureName,
  pageId,
}: DynamicInsightPanelSectionProps) => {
  const [insights, setInsights] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const options = useMemo(() => getSectionOptions(section), [section]);

  const actionLabel = toStringValue(options.actionLabel, "Generate Insights");
  const loadingLabel = toStringValue(options.loadingLabel, "Analyzing...");

  const buildFallbackInsights = () => {
    const configured = Array.isArray(options.insights)
      ? options.insights
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean)
      : [];

    if (configured.length > 0) {
      return configured;
    }

    return [
      `AI copilot is ready for ${featureName}. Add data or click generate to get live recommendations.`,
      "The backend insight engine will summarize trends, patterns, and next steps for this feature.",
    ];
  };

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    try {
      if (!pageId) {
        setInsights(buildFallbackInsights());
      } else {
        const response = await getFeatureInsights(pageId, featureId);
        const liveInsights = Array.isArray(response.insights)
          ? response.insights.map((item) => String(item).trim()).filter(Boolean)
          : [];

        setInsights(liveInsights.length > 0 ? liveInsights : buildFallbackInsights());
      }
      console.log("[InsightPanel] Generate insights", { featureId, sectionId: section.id });
    } catch (error) {
      console.error("[InsightPanel] Failed to load insights:", error);
      setInsights(buildFallbackInsights());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicSectionShell section={section}>
      {insights.length > 0 ? (
        <div className="bg-card/60 rounded p-3 space-y-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm whitespace-pre-line text-foreground space-y-2">
              {insights.map((line, index) => (
                <div key={`${line}-${index}`} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInsights([])}
            className="w-full"
            disabled={isLoading}
          >
            Clear Insights
          </Button>
        </div>
      ) : (
        <Button onClick={handleGenerateInsights} disabled={isLoading} className="w-full" size="sm">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {loadingLabel}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {actionLabel}
            </>
          )}
        </Button>
      )}
    </DynamicSectionShell>
  );
};
