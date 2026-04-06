import { useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toRecordArray,
  toStringArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicInsightPanelSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

export const DynamicInsightPanelSection = ({
  section,
  featureId,
  featureName,
}: DynamicInsightPanelSectionProps) => {
  const [insights, setInsights] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const options = useMemo(() => getSectionOptions(section), [section]);
  const configuredInsights = toStringArray(options.insights);
  const insightList = configuredInsights.length
    ? configuredInsights
    : toRecordArray(options.items).map((item) => toStringValue(item.text, ""));

  const actionLabel = toStringValue(options.actionLabel, "Generate Insights");
  const loadingLabel = toStringValue(options.loadingLabel, "Analyzing...");

  const handleGenerateInsights = async () => {
    setIsLoading(true);
    try {
      // TODO: Connect with /features/:id/insights endpoint for live AI output.
      if (insightList.length > 0) {
        setInsights(insightList.map((line) => `- ${line}`).join("\n"));
      } else {
        setInsights(
          [
            `Feature "${featureName}" has no configured insight examples yet.`,
            "Add entries and invoke AI insights to generate meaningful recommendations.",
          ].join("\n")
        );
      }
      console.log("[InsightPanel] Generate insights", { featureId, sectionId: section.id });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DynamicSectionShell section={section}>
      {insights ? (
        <div className="bg-card/60 rounded p-3 space-y-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm whitespace-pre-line text-foreground">{insights}</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInsights("")}
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
