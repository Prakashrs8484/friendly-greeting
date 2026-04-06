import { Badge } from "@/components/ui/badge";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toDisplayString,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicTimelineSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  dateLabel: string;
  status?: string;
}

const DEFAULT_ITEMS: TimelineItem[] = [
  {
    id: "timeline_1",
    title: "Kickoff",
    description: "Define scope and success criteria.",
    dateLabel: "Today",
    status: "done",
  },
  {
    id: "timeline_2",
    title: "Implementation",
    description: "Build core workflow.",
    dateLabel: "This Week",
    status: "in-progress",
  },
  {
    id: "timeline_3",
    title: "Review",
    description: "Assess outcomes and iterate.",
    dateLabel: "Next Week",
    status: "planned",
  },
];

const normalizeItems = (options: Record<string, unknown>): TimelineItem[] => {
  const records = toRecordArray(options.items).length
    ? toRecordArray(options.items)
    : toRecordArray(options.events);

  if (records.length === 0) return DEFAULT_ITEMS;

  return records.map((item, index) => ({
    id: toStringValue(item.id, `timeline_${index}`),
    title: toStringValue(item.title, `Step ${index + 1}`),
    description: toStringValue(item.description, ""),
    dateLabel: toStringValue(item.dateLabel, toDisplayString(item.date, "TBD")),
    status: toStringValue(item.status, ""),
  }));
};

const statusVariant = (status?: string): "default" | "secondary" | "outline" => {
  const normalized = (status || "").toLowerCase();
  if (normalized === "done" || normalized === "completed") return "default";
  if (normalized === "in-progress" || normalized === "active") return "secondary";
  return "outline";
};

export const DynamicTimelineSection = ({ section }: DynamicTimelineSectionProps) => {
  const options = getSectionOptions(section);
  const items = normalizeItems(options);

  return (
    <DynamicSectionShell section={section}>
      <div className="space-y-0">
        {items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-[20px_1fr] gap-3">
            <div className="flex flex-col items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
              {index < items.length - 1 ? (
                <span className="flex-1 w-px bg-border my-1" />
              ) : null}
            </div>

            <div className="pb-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{item.title}</p>
                <Badge variant={statusVariant(item.status)} className="text-[10px]">
                  {item.status || "planned"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{item.dateLabel}</p>
              {item.description ? (
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </DynamicSectionShell>
  );
};
