import { BarChart3 } from "lucide-react";
import { DynamicSectionShell } from "./DynamicSectionShell";
import { DynamicSection } from "./dynamicSectionUtils";

interface DynamicChartSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

export const DynamicChartSection = ({
  section,
}: DynamicChartSectionProps) => {
  return (
    <DynamicSectionShell section={section}>
      <div className="w-full h-40 bg-card/50 rounded border border-border/50 flex items-center justify-center">
        <div className="text-center text-xs text-muted-foreground">
          <BarChart3 className="w-4 h-4 text-primary mx-auto mb-1" />
          <p>Use `chart-bar`, `chart-line`, or `chart-pie` for richer chart sections.</p>
        </div>
      </div>
    </DynamicSectionShell>
  );
};
