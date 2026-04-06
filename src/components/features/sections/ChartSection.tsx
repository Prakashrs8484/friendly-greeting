import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ChartSectionProps {
  section: {
    component: "chart";
    label: string;
    description?: string;
    chartType?: "line" | "bar" | "pie";
    timeRange?: "day" | "week" | "month";
  };
  featureId: string;
}

export const ChartSection = ({ section, featureId }: ChartSectionProps) => {
  return (
    <div className="mt-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold mb-2">{section.label}</h3>
        {section.description && (
          <p className="text-xs text-muted-foreground mb-3">{section.description}</p>
        )}
      </div>

      <div className="rounded-lg bg-secondary border border-border p-6 flex items-center justify-center min-h-[200px]">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 rounded-lg bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium">Chart Coming Soon</p>
            <p className="text-xs text-muted-foreground">
              Data visualization for your {section.chartType || "chart"} will appear here
            </p>
          </div>
          {section.timeRange && (
            <p className="text-xs text-muted-foreground">
              Showing data for this {section.timeRange}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
