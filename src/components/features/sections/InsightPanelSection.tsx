import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Lightbulb } from "lucide-react";

interface InsightPanelSectionProps {
  section: {
    component: "insightPanel";
    label: string;
    description?: string;
    aiEnabled?: boolean;
  };
  featureId: string;
}

export const InsightPanelSection = ({ section, featureId }: InsightPanelSectionProps) => {
  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold">{section.label}</h3>
      </div>

      <Card className="rounded-lg bg-primary/5 border border-primary/20">
        <CardHeader className="pb-3">
          {section.description && (
            <p className="text-xs text-muted-foreground">{section.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-card rounded-lg p-4 border border-border">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold mb-1">AI Suggestions</h4>
                  <p className="text-xs text-muted-foreground">
                    AI-powered recommendations based on your data will appear here. Add entries to unlock insights.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              AI insights are generated as you add and track data
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
