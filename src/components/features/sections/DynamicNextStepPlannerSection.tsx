import { ArrowRightCircle, CalendarClock } from "lucide-react";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicNextStepPlannerSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

export const DynamicNextStepPlannerSection = ({
  section,
}: DynamicNextStepPlannerSectionProps) => {
  const options = getSectionOptions(section);
  const phases = toRecordArray(options.phases);

  const steps =
    phases.length > 0
      ? phases
      : [
          { bucket: "Today", action: "Clarify top 3 outcomes", owner: "You" },
          { bucket: "This Week", action: "Execute highest impact milestone", owner: "Team" },
          { bucket: "Next", action: "Review blockers and re-sequence", owner: "AI Copilot" },
        ];

  return (
    <DynamicSectionShell section={section}>
      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-card/60 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <ArrowRightCircle className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {toStringValue(step.bucket, `Phase ${idx + 1}`)}
                  </p>
                  <p className="text-sm font-medium mt-0.5">{toStringValue(step.action, "Planned action")}</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] border border-border rounded-full px-2 py-1 bg-secondary/40">
                <CalendarClock className="w-3 h-3" />
                {toStringValue(step.owner, "Owner TBD")}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DynamicSectionShell>
  );
};
