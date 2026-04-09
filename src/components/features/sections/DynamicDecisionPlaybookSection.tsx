import { GitBranch, Scale } from "lucide-react";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicDecisionPlaybookSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

export const DynamicDecisionPlaybookSection = ({
  section,
}: DynamicDecisionPlaybookSectionProps) => {
  const options = getSectionOptions(section);
  const branches = toRecordArray(options.branches);

  const playbook =
    branches.length > 0
      ? branches
      : [
          {
            condition: "If budget variance exceeds 10%",
            recommendation: "Delay low-impact initiatives and reallocate resources",
            tradeoff: "Slight roadmap delay",
          },
          {
            condition: "If team velocity is stable for 2 sprints",
            recommendation: "Increase strategic scope by one milestone",
            tradeoff: "Higher coordination overhead",
          },
        ];

  return (
    <DynamicSectionShell section={section}>
      <div className="space-y-3">
        {playbook.map((item, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-card/60 p-3">
            <div className="flex items-start gap-2 mb-2">
              <GitBranch className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Condition</p>
                <p className="text-sm font-medium">{toStringValue(item.condition, `Decision Branch ${idx + 1}`)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Recommendation</p>
            <p className="text-sm mt-0.5">{toStringValue(item.recommendation, "No recommendation available")}</p>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] border border-border rounded-full px-2 py-1 bg-secondary/40">
              <Scale className="w-3 h-3" />
              Tradeoff: {toStringValue(item.tradeoff, "Not specified")}
            </div>
          </div>
        ))}
      </div>
    </DynamicSectionShell>
  );
};
