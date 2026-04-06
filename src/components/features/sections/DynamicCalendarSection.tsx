import { useMemo, useState } from "react";
import { isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toDisplayString,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicCalendarSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  category?: string;
  description?: string;
}

const parseDate = (value: unknown): Date | null => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
};

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: "event_1",
    title: "Review weekly progress",
    date: new Date(),
    category: "Review",
  },
  {
    id: "event_2",
    title: "Plan next milestone",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    category: "Planning",
  },
];

const normalizeEvents = (options: Record<string, unknown>): CalendarEvent[] => {
  const eventRecords = toRecordArray(options.events).length
    ? toRecordArray(options.events)
    : toRecordArray(options.items);

  if (eventRecords.length === 0) return DEFAULT_EVENTS;

  return eventRecords
    .map((event, index) => {
      const date = parseDate(event.date);
      if (!date) return null;
      return {
        id: toStringValue(event.id, `event_${index}`),
        title: toStringValue(event.title, `Event ${index + 1}`),
        date,
        category: toStringValue(event.category, toStringValue(event.tag, "")),
        description: toStringValue(event.description, ""),
      };
    })
    .filter((event): event is CalendarEvent => Boolean(event));
};

export const DynamicCalendarSection = ({ section }: DynamicCalendarSectionProps) => {
  const options = getSectionOptions(section);
  const events = useMemo(() => normalizeEvents(options), [options]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const eventDates = useMemo(() => events.map((event) => event.date), [events]);
  const dayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter((event) => isSameDay(event.date, selectedDate));
  }, [events, selectedDate]);

  return (
    <DynamicSectionShell section={section}>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(value) => setSelectedDate(value)}
        modifiers={{ hasEvent: eventDates }}
        modifiersClassNames={{ hasEvent: "bg-primary/10 text-primary font-medium" }}
        className="rounded-md border bg-card/70"
      />

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          {selectedDate ? selectedDate.toDateString() : "Select a date"}
        </p>
        {dayEvents.length > 0 ? (
          dayEvents.map((event) => (
            <div key={event.id} className="rounded border border-border bg-card/60 p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{event.title}</p>
                {event.category ? (
                  <Badge variant="outline" className="text-[10px]">
                    {event.category}
                  </Badge>
                ) : null}
              </div>
              {event.description ? (
                <p className="text-xs text-muted-foreground mt-1">
                  {event.description}
                </p>
              ) : null}
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground">
            {toDisplayString(options.emptyMessage, "No events scheduled for this day.")}
          </p>
        )}
      </div>
    </DynamicSectionShell>
  );
};
