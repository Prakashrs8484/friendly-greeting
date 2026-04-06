import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toBooleanValue,
  toRecordArray,
  toStringArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicTagSelectorSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

interface TagOption {
  value: string;
  label: string;
}

const DEFAULT_TAGS: TagOption[] = [
  { value: "priority", label: "Priority" },
  { value: "urgent", label: "Urgent" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
];

const normalizeTags = (options: Record<string, unknown>): TagOption[] => {
  if (Array.isArray(options.tags) && options.tags.every((value) => typeof value === "string")) {
    return toStringArray(options.tags).map((value) => ({ value, label: value }));
  }

  const records = toRecordArray(options.tags);
  if (records.length === 0) return DEFAULT_TAGS;

  return records.map((tag, index) => {
    const value = toStringValue(tag.value, `tag_${index}`);
    return {
      value,
      label: toStringValue(tag.label, value),
    };
  });
};

export const DynamicTagSelectorSection = ({
  section,
}: DynamicTagSelectorSectionProps) => {
  const options = getSectionOptions(section);
  const tags = useMemo(() => normalizeTags(options), [options]);
  const allowMultiSelect = toBooleanValue(options.multiSelect, true);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    toStringArray(options.defaultSelected)
  );

  const toggleTag = (value: string) => {
    setSelectedTags((prev) => {
      const exists = prev.includes(value);
      if (allowMultiSelect) {
        return exists ? prev.filter((tag) => tag !== value) : [...prev, value];
      }
      return exists ? [] : [value];
    });
  };

  return (
    <DynamicSectionShell section={section}>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = selectedTags.includes(tag.value);
          return (
            <Button
              key={tag.value}
              type="button"
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => toggleTag(tag.value)}
            >
              {tag.label}
            </Button>
          );
        })}
      </div>

      <div className="rounded border border-border bg-card/60 p-2.5 min-h-[42px]">
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px]">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No tags selected</p>
        )}
      </div>
    </DynamicSectionShell>
  );
};
