import { Badge } from "@/components/ui/badge";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  clamp,
  DynamicSection,
  getSectionOptions,
  toDisplayString,
  toNumberValue,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicKpiGridSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

interface KpiMetric {
  id: string;
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "flat";
}

const DEFAULT_METRICS: KpiMetric[] = [
  { id: "kpi_1", label: "Total", value: "0", change: "No change", trend: "flat" },
  { id: "kpi_2", label: "This Week", value: "0", change: "No data", trend: "flat" },
  { id: "kpi_3", label: "Goal", value: "0", change: "Pending", trend: "flat" },
];

const trendVariant = (trend?: string): "default" | "secondary" | "outline" => {
  if (trend === "up") return "default";
  if (trend === "down") return "secondary";
  return "outline";
};

const normalizeMetrics = (options: Record<string, unknown>): KpiMetric[] => {
  const records = toRecordArray(options.metrics);
  if (records.length === 0) return DEFAULT_METRICS;

  return records.map((metric, index) => ({
    id: toStringValue(metric.id, `kpi_${index}`),
    label: toStringValue(metric.label, `KPI ${index + 1}`),
    value: toDisplayString(metric.value, "0"),
    change: toStringValue(metric.change, ""),
    trend: toStringValue(metric.trend, "flat") as KpiMetric["trend"],
  }));
};

export const DynamicKpiGridSection = ({ section }: DynamicKpiGridSectionProps) => {
  const options = getSectionOptions(section);
  const metrics = normalizeMetrics(options);
  const columns = clamp(toNumberValue(options.columns, 3), 1, 4);

  const gridClassByColumns: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  return (
    <DynamicSectionShell section={section}>
      <div className={`grid grid-cols-1 ${gridClassByColumns[columns]} gap-3`}>
        {metrics.map((metric) => (
          <div key={metric.id} className="rounded border border-border bg-card/70 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">{metric.label}</p>
              <Badge variant={trendVariant(metric.trend)} className="text-[10px]">
                {metric.trend || "flat"}
              </Badge>
            </div>
            <p className="text-2xl font-semibold mt-2">{metric.value}</p>
            {metric.change ? (
              <p className="text-xs text-muted-foreground mt-1">{metric.change}</p>
            ) : null}
          </div>
        ))}
      </div>
    </DynamicSectionShell>
  );
};
