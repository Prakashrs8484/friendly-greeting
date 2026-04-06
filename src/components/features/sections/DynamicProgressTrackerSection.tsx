import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toDisplayString,
  toNumberValue,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicProgressTrackerSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

interface ProgressStep {
  id: string;
  label: string;
  progress: number;
  status: string;
  note?: string;
}

const DEFAULT_STEPS: ProgressStep[] = [
  { id: "step_1", label: "Step 1", progress: 100, status: "done", note: "Completed" },
  { id: "step_2", label: "Step 2", progress: 60, status: "in-progress", note: "Ongoing" },
  { id: "step_3", label: "Step 3", progress: 10, status: "planned", note: "Queued" },
];

const normalizeSteps = (options: Record<string, unknown>): ProgressStep[] => {
  const stepRecords = toRecordArray(options.steps);
  if (stepRecords.length === 0) return DEFAULT_STEPS;

  return stepRecords.map((step, index) => ({
    id: toStringValue(step.id, `step_${index}`),
    label: toStringValue(step.label, `Step ${index + 1}`),
    progress: Math.max(0, Math.min(100, toNumberValue(step.progress, 0))),
    status: toStringValue(step.status, "planned"),
    note: toStringValue(step.note, toStringValue(step.description, "")),
  }));
};

const statusVariant = (status: string): "default" | "secondary" | "outline" => {
  const normalized = status.toLowerCase();
  if (normalized === "done" || normalized === "completed") return "default";
  if (normalized === "in-progress" || normalized === "active") return "secondary";
  return "outline";
};

export const DynamicProgressTrackerSection = ({
  section,
}: DynamicProgressTrackerSectionProps) => {
  const options = getSectionOptions(section);
  const steps = normalizeSteps(options);
  const overallProgress =
    options.overallProgress !== undefined
      ? Math.max(0, Math.min(100, toNumberValue(options.overallProgress, 0)))
      : Math.round(
          steps.reduce((total, step) => total + step.progress, 0) /
            Math.max(steps.length, 1)
        );

  return (
    <DynamicSectionShell section={section}>
      <div className="rounded border border-border bg-card/60 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Overall Progress</p>
          <p className="text-sm font-semibold">{overallProgress}%</p>
        </div>
        <Progress value={overallProgress} className="h-2.5" />
      </div>

      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.id} className="rounded border border-border bg-card/60 p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{step.label}</p>
              <Badge variant={statusVariant(step.status)} className="text-[10px]">
                {step.status}
              </Badge>
            </div>
            <Progress value={step.progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{toDisplayString(step.note, "")}</span>
              <span>{step.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </DynamicSectionShell>
  );
};
