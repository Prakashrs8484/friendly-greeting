import { Lightbulb, TrendingUp } from "lucide-react";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toDisplayString,
  toNumberValue,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicRecommendationCardsSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

export const DynamicRecommendationCardsSection = ({
  section,
}: DynamicRecommendationCardsSectionProps) => {
  const options = getSectionOptions(section);
  const cards = toRecordArray(options.cards);

  const recommendations =
    cards.length > 0
      ? cards
      : [
          {
            title: "Prioritize highest-impact tasks",
            rationale: "Focus on tasks with strongest outcome potential.",
            impact: 82,
            effort: 35,
            confidence: 74,
          },
          {
            title: "Batch low-value admin work",
            rationale: "Reduce context switching and protect focus blocks.",
            impact: 58,
            effort: 22,
            confidence: 68,
          },
        ];

  return (
    <DynamicSectionShell section={section}>
      <div className="space-y-3">
        {recommendations.map((item, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-card/60 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">
                    {toStringValue(item.title, `Recommendation ${idx + 1}`)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {toDisplayString(item.rationale, "No rationale provided")}
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                {Math.round(toNumberValue(item.confidence, 60))}% confidence
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-[11px]">
              <div className="rounded border border-border p-2 bg-secondary/40">
                <p className="text-muted-foreground">Impact</p>
                <p className="font-medium">{Math.round(toNumberValue(item.impact, 60))}/100</p>
              </div>
              <div className="rounded border border-border p-2 bg-secondary/40">
                <p className="text-muted-foreground">Effort</p>
                <p className="font-medium">{Math.round(toNumberValue(item.effort, 40))}/100</p>
              </div>
              <div className="rounded border border-border p-2 bg-secondary/40">
                <p className="text-muted-foreground">Priority</p>
                <p className="font-medium">
                  {toNumberValue(item.impact, 0) - toNumberValue(item.effort, 0) >= 30 ? "High" : "Medium"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </DynamicSectionShell>
  );
};
