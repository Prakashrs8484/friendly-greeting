import { BarChart3 } from "lucide-react";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toDisplayString,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicSummaryCardSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

export const DynamicSummaryCardSection = ({
  section,
}: DynamicSummaryCardSectionProps) => {
  const options = getSectionOptions(section);
  const metrics = toRecordArray(options.metrics);

  const summaryStats =
    metrics.length > 0
      ? metrics
      : [
          { label: "Total Entries", value: "0", trend: "No data yet" },
          { label: "Last Updated", value: "Never", trend: "Waiting for updates" },
        ];

  return (
    <DynamicSectionShell section={section}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {summaryStats.map((stat, idx) => (
          <div key={idx} className="p-3 rounded border border-border bg-card/50">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-3 h-3 text-primary" />
              <p className="text-xs text-muted-foreground">
                {toStringValue(stat.label, `Metric ${idx + 1}`)}
              </p>
            </div>
            <p className="text-lg font-semibold">
              {toDisplayString(stat.value, "0")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {toDisplayString(stat.trend, "")}
            </p>
          </div>
        ))}
      </div>
    </DynamicSectionShell>
  );
};
