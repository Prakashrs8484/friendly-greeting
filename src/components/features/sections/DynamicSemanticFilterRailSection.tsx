import { Filter, Tags } from "lucide-react";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toStringArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicSemanticFilterRailSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

export const DynamicSemanticFilterRailSection = ({
  section,
}: DynamicSemanticFilterRailSectionProps) => {
  const options = getSectionOptions(section);
  const groups = toStringArray(options.groups);
  const active = toStringValue(options.activeGroup, groups[0] || "Priority");

  const suggestedGroups =
    groups.length > 0
      ? groups
      : ["Priority", "Risk", "Opportunity", "Backlog", "Blocked"];

  return (
    <DynamicSectionShell section={section}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Filter className="w-3.5 h-3.5" />
          AI-generated semantic filters
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestedGroups.map((group) => {
            const isActive = group === active;
            return (
              <span
                key={group}
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs border ${
                  isActive
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-secondary/40 border-border"
                }`}
              >
                <Tags className="w-3 h-3" />
                {group}
              </span>
            );
          })}
        </div>
      </div>
    </DynamicSectionShell>
  );
};
