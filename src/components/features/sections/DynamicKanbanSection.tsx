import { Badge } from "@/components/ui/badge";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toDisplayString,
  toRecordArray,
  toStringArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicKanbanSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

interface KanbanCard {
  id: string;
  title: string;
  subtitle?: string;
  tags?: string[];
}

interface KanbanColumn {
  id: string;
  label: string;
  cards: KanbanCard[];
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  {
    id: "todo",
    label: "To Do",
    cards: [{ id: "todo_1", title: "Define first milestone", subtitle: "Plan scope" }],
  },
  {
    id: "in_progress",
    label: "In Progress",
    cards: [{ id: "progress_1", title: "Build core flow", subtitle: "Current sprint" }],
  },
  {
    id: "done",
    label: "Done",
    cards: [{ id: "done_1", title: "Capture requirements", subtitle: "Completed" }],
  },
];

const normalizeColumns = (options: Record<string, unknown>): KanbanColumn[] => {
  const source = toRecordArray(options.columns).length
    ? toRecordArray(options.columns)
    : toRecordArray(options.lanes);

  if (source.length === 0) return DEFAULT_COLUMNS;

  return source.map((column, columnIndex) => {
    const cardsSource = toRecordArray(column.cards).length
      ? toRecordArray(column.cards)
      : toRecordArray(column.items);

    const cards = cardsSource.map((card, cardIndex) => ({
      id: toStringValue(card.id, `card_${columnIndex}_${cardIndex}`),
      title: toStringValue(card.title, `Card ${cardIndex + 1}`),
      subtitle: toStringValue(card.subtitle, toStringValue(card.description, "")),
      tags: toStringArray(card.tags),
    }));

    return {
      id: toStringValue(column.id, `column_${columnIndex}`),
      label: toStringValue(column.label, toStringValue(column.title, `Column ${columnIndex + 1}`)),
      cards,
    };
  });
};

export const DynamicKanbanSection = ({ section }: DynamicKanbanSectionProps) => {
  const options = getSectionOptions(section);
  const columns = normalizeColumns(options);

  return (
    <DynamicSectionShell section={section}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {columns.map((column) => (
          <div key={column.id} className="rounded border border-border bg-card/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {column.label}
              </h4>
              <Badge variant="outline" className="text-[10px]">
                {column.cards.length}
              </Badge>
            </div>

            {column.cards.length > 0 ? (
              column.cards.map((card) => (
                <div key={card.id} className="rounded border border-border bg-background p-2.5 space-y-1">
                  <p className="text-sm font-medium">{card.title}</p>
                  {card.subtitle ? (
                    <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                  ) : null}
                  {card.tags && card.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {card.tags.map((tag) => (
                        <Badge key={`${card.id}_${tag}`} variant="secondary" className="text-[10px]">
                          {toDisplayString(tag)}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground text-center py-3 border border-dashed border-border rounded">
                No cards
              </div>
            )}
          </div>
        ))}
      </div>
    </DynamicSectionShell>
  );
};
