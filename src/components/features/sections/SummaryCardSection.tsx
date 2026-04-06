import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface SummaryCardSectionProps {
  section: {
    component: "summaryCard";
    label: string;
    description?: string;
    aiEnabled?: boolean;
  };
  featureId: string;
}

export const SummaryCardSection = ({ section, featureId }: SummaryCardSectionProps) => {
  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2">
        {section.aiEnabled && <Sparkles className="w-4 h-4 text-primary" />}
        <h3 className="text-sm font-semibold">{section.label}</h3>
      </div>

      <Card className="rounded-lg bg-card border border-primary/20">
        <CardHeader className="pb-3">
          {section.description && (
            <p className="text-xs text-muted-foreground">{section.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground text-sm">
            {section.aiEnabled ? (
              <div className="space-y-2">
                <Sparkles className="w-6 h-6 text-primary mx-auto opacity-50" />
                <p>AI-powered insights will appear here</p>
              </div>
            ) : (
              <p>Summary will be generated from your data</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
