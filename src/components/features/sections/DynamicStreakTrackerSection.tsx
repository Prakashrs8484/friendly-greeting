import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toBooleanValue,
  toNumberValue,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicStreakTrackerSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

interface DayEntry {
  label: string;
  complete: boolean;
}

const DEFAULT_WEEK: DayEntry[] = [
  { label: "Mon", complete: true },
  { label: "Tue", complete: true },
  { label: "Wed", complete: false },
  { label: "Thu", complete: true },
  { label: "Fri", complete: true },
  { label: "Sat", complete: false },
  { label: "Sun", complete: false },
];

const normalizeWeek = (options: Record<string, unknown>): DayEntry[] => {
  if (Array.isArray(options.week) && options.week.every((day) => typeof day === "boolean")) {
    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return (options.week as boolean[]).slice(0, 7).map((complete, index) => ({
      label: labels[index] || `D${index + 1}`,
      complete,
    }));
  }

  const records = toRecordArray(options.week);
  if (records.length === 0) return DEFAULT_WEEK;

  return records.map((day, index) => ({
    label: toStringValue(day.label, `D${index + 1}`),
    complete: toBooleanValue(day.complete, false),
  }));
};

export const DynamicStreakTrackerSection = ({
  section,
}: DynamicStreakTrackerSectionProps) => {
  const options = getSectionOptions(section);
  const currentStreak = Math.max(0, toNumberValue(options.currentStreak, 0));
  const bestStreak = Math.max(currentStreak, toNumberValue(options.bestStreak, currentStreak));
  const goal = Math.max(1, toNumberValue(options.goal, 7));
  const week = normalizeWeek(options);
  const completion = Math.round((week.filter((day) => day.complete).length / week.length) * 100);
  const goalProgress = Math.min(100, Math.round((currentStreak / goal) * 100));

  return (
    <DynamicSectionShell section={section}>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded border border-border bg-card/60 p-3">
          <p className="text-xs text-muted-foreground">Current Streak</p>
          <div className="flex items-center gap-2 mt-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <p className="text-2xl font-semibold">{currentStreak}</p>
          </div>
        </div>
        <div className="rounded border border-border bg-card/60 p-3">
          <p className="text-xs text-muted-foreground">Best Streak</p>
          <p className="text-2xl font-semibold mt-1">{bestStreak}</p>
        </div>
      </div>

      <div className="rounded border border-border bg-card/60 p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Goal Progress ({goal} days)</span>
          <Badge variant="outline">{goalProgress}%</Badge>
        </div>
        <Progress value={goalProgress} className="h-2.5" />
      </div>

      <div className="flex items-center justify-between rounded border border-border bg-card/60 p-3">
        <div className="flex gap-2">
          {week.map((day) => (
            <div key={day.label} className="text-center space-y-1">
              <div
                className={`w-7 h-7 rounded-full border text-[10px] flex items-center justify-center ${
                  day.complete
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {day.label[0]}
              </div>
              <p className="text-[10px] text-muted-foreground">{day.label}</p>
            </div>
          ))}
        </div>
        <Badge variant="secondary">{completion}% week</Badge>
      </div>
    </DynamicSectionShell>
  );
};
