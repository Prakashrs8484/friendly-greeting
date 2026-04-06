import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  toDisplayString,
  DynamicSection,
  getSectionOptions,
  isRecord,
  toBooleanValue,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicListSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

type Entry = Record<string, unknown> & { _id?: string };

export const DynamicListSection = ({
  section,
  featureId,
  featureName,
}: DynamicListSectionProps) => {
  const sectionOptions = useMemo(() => getSectionOptions(section), [section]);

  const initialEntries = useMemo(() => {
    const fromItems = toRecordArray(sectionOptions.items);
    const fromData = toRecordArray(sectionOptions.data);
    return (fromItems.length ? fromItems : fromData).map((entry, index) => ({
      ...entry,
      _id: toStringValue(entry._id, `entry_${index}`),
    }));
  }, [sectionOptions]);

  const [entries, setEntries] = useState<Entry[]>(initialEntries);

  const showDelete = toBooleanValue(sectionOptions.allowDelete, true);
  const emptyMessage = toStringValue(
    sectionOptions.emptyMessage,
    "No items yet."
  );

  const visibleKeys = useMemo(() => {
    if (Array.isArray(section.fields) && section.fields.length > 0) {
      return section.fields.map((field) => ({
        key: field.name,
        label: field.label || field.name,
      }));
    }

    const firstEntry = entries[0];
    if (!firstEntry || !isRecord(firstEntry)) return [];

    return Object.keys(firstEntry)
      .filter((key) => key !== "_id")
      .map((key) => ({ key, label: key }));
  }, [entries, section.fields]);

  const handleDeleteEntry = (entryId?: string) => {
    if (!entryId) return;
    setEntries((prev) => prev.filter((entry) => entry._id !== entryId));

    console.log("[DynamicListSection] Deleted entry:", {
      featureId,
      featureName,
      sectionId: section.id,
      entryId,
    });
  };

  return (
    <DynamicSectionShell section={section}>
      {entries.length === 0 ? (
        <div className="text-center py-4 text-sm text-muted-foreground">{emptyMessage}</div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, idx) => (
            <div
              key={entry._id || idx}
              className="p-3 rounded border border-border bg-card/60 flex items-start justify-between gap-3 text-sm"
            >
              <div className="flex-1 space-y-1">
                {visibleKeys.map((field) => (
                  <div key={field.key} className="text-xs">
                    <span className="font-medium capitalize">{field.label}:</span>{" "}
                    <span className="text-muted-foreground">
                      {toDisplayString(entry[field.key], "-")}
                    </span>
                  </div>
                ))}
              </div>

              {showDelete ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteEntry(entry._id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 p-1 h-auto w-auto"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </DynamicSectionShell>
  );
};
