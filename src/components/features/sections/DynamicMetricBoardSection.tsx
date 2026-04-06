import { TrendingDown, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toDisplayString,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicMetricBoardSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

interface BoardMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  note?: string;
}

const DEFAULT_METRICS: BoardMetric[] = [
  { id: "metric_1", label: "Primary Metric", value: "0", trend: "flat", note: "Waiting for data" },
  { id: "metric_2", label: "Secondary", value: "0", trend: "up" },
  { id: "metric_3", label: "Tertiary", value: "0", trend: "down" },
];

const normalizeMetrics = (options: Record<string, unknown>): BoardMetric[] => {
  const records = toRecordArray(options.metrics);
  if (records.length === 0) return DEFAULT_METRICS;

  return records.map((metric, index) => ({
    id: toStringValue(metric.id, `metric_${index}`),
    label: toStringValue(metric.label, `Metric ${index + 1}`),
    value: toDisplayString(metric.value, "0"),
    unit: toStringValue(metric.unit, ""),
    trend: toStringValue(metric.trend, "flat"),
    note: toStringValue(metric.note, toStringValue(metric.description, "")),
  }));
};

const metricTrendIcon = (trend?: string) => {
  const normalized = (trend || "").toLowerCase();
  if (normalized === "up") return <TrendingUp className="w-3.5 h-3.5" />;
  if (normalized === "down") return <TrendingDown className="w-3.5 h-3.5" />;
  return null;
};

const metricTrendVariant = (trend?: string): "default" | "secondary" | "outline" => {
  const normalized = (trend || "").toLowerCase();
  if (normalized === "up") return "default";
  if (normalized === "down") return "secondary";
  return "outline";
};

export const DynamicMetricBoardSection = ({ section }: DynamicMetricBoardSectionProps) => {
  const options = getSectionOptions(section);
  const metrics = normalizeMetrics(options);
  const [primary, ...secondary] = metrics;

  return (
    <DynamicSectionShell section={section}>
      <div className="rounded border border-border bg-card/70 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{primary.label}</p>
          <Badge variant={metricTrendVariant(primary.trend)} className="text-[10px] gap-1">
            {metricTrendIcon(primary.trend)}
            {primary.trend || "flat"}
          </Badge>
        </div>
        <p className="text-3xl font-semibold mt-2">
          {primary.value}
          {primary.unit ? <span className="text-lg text-muted-foreground ml-1">{primary.unit}</span> : null}
        </p>
        {primary.note ? (
          <p className="text-xs text-muted-foreground mt-1">{primary.note}</p>
        ) : null}
      </div>

      {secondary.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {secondary.map((metric) => (
            <div key={metric.id} className="rounded border border-border bg-card/60 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <Badge variant={metricTrendVariant(metric.trend)} className="text-[10px]">
                  {metric.trend || "flat"}
                </Badge>
              </div>
              <p className="text-xl font-semibold mt-2">
                {metric.value}
                {metric.unit ? <span className="text-sm text-muted-foreground ml-1">{metric.unit}</span> : null}
              </p>
              {metric.note ? (
                <p className="text-xs text-muted-foreground mt-1">{metric.note}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </DynamicSectionShell>
  );
};
