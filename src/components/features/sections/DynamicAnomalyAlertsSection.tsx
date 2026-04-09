import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toNumberValue,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicAnomalyAlertsSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

export const DynamicAnomalyAlertsSection = ({
  section,
}: DynamicAnomalyAlertsSectionProps) => {
  const options = getSectionOptions(section);
  const alerts = toRecordArray(options.alerts);

  const items =
    alerts.length > 0
      ? alerts
      : [
          { metric: "Completion Rate", delta: -18, severity: "high", reason: "Drop after scope change" },
          { metric: "Cycle Time", delta: 11, severity: "medium", reason: "Review queue backlog" },
        ];

  return (
    <DynamicSectionShell section={section}>
      <div className="space-y-3">
        {items.map((alert, idx) => {
          const delta = toNumberValue(alert.delta, 0);
          const severity = toStringValue(alert.severity, "medium").toLowerCase();
          const severityClass =
            severity === "high"
              ? "border-red-500/30 bg-red-500/10"
              : severity === "low"
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-amber-500/30 bg-amber-500/10";

          return (
            <div key={idx} className={`rounded-lg border p-3 ${severityClass}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{toStringValue(alert.metric, `Metric ${idx + 1}`)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{toStringValue(alert.reason, "AI detected an unusual movement")}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-medium">
                  {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {delta > 0 ? "+" : ""}{Math.round(delta)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DynamicSectionShell>
  );
};
