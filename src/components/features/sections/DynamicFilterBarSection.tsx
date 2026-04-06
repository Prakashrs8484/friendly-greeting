import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toRecordArray,
  toStringArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicFilterBarSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: string[];
}

const normalizeFilters = (options: Record<string, unknown>): FilterConfig[] => {
  const filterRecords = toRecordArray(options.filters);

  return filterRecords
    .map((filter, index) => {
      const key = toStringValue(filter.key, `filter_${index}`);
      const values = toStringArray(filter.options);
      return {
        key,
        label: toStringValue(filter.label, key),
        options: values,
      };
    })
    .filter((filter) => filter.options.length > 0);
};

export const DynamicFilterBarSection = ({ section }: DynamicFilterBarSectionProps) => {
  const options = getSectionOptions(section);
  const [query, setQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const filters = useMemo(() => normalizeFilters(options), [options]);

  const searchPlaceholder = toStringValue(options.searchPlaceholder, "Search...");

  const resetFilters = () => {
    setQuery("");
    setSelectedFilters({});
  };

  return (
    <DynamicSectionShell section={section}>
      <div className="rounded border border-border bg-card/60 p-3 space-y-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-8 text-sm"
          />
        </div>

        {filters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {filters.map((filter) => (
              <Select
                key={filter.key}
                value={selectedFilters[filter.key] || "__all__"}
                onValueChange={(value) =>
                  setSelectedFilters((prev) => ({
                    ...prev,
                    [filter.key]: value === "__all__" ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {filter.options.map((value) => (
                    <SelectItem key={`${filter.key}_${value}`} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {query ? (
            <Badge variant="secondary" className="gap-1">
              Query: {query}
            </Badge>
          ) : null}
          {Object.entries(selectedFilters)
            .filter(([, value]) => value)
            .map(([key, value]) => (
              <Badge key={`${key}_${value}`} variant="outline">
                {key}: {value}
              </Badge>
            ))}
          {(query || Object.values(selectedFilters).some(Boolean)) ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={resetFilters}
            >
              <X className="w-3 h-3 mr-1" />
              Reset
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">No active filters</p>
          )}
        </div>
      </div>
    </DynamicSectionShell>
  );
};
