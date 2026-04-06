import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface DynamicComparisonTableSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

interface ComparisonOption {
  id: string;
  name: string;
  values: Record<string, unknown>;
}

const DEFAULT_OPTIONS: ComparisonOption[] = [
  {
    id: "option_1",
    name: "Option A",
    values: { cost: "Low", impact: "Medium", risk: "Low" },
  },
  {
    id: "option_2",
    name: "Option B",
    values: { cost: "Medium", impact: "High", risk: "Medium" },
  },
];

const normalizeOptions = (options: Record<string, unknown>): ComparisonOption[] => {
  const records = toRecordArray(options.options);
  if (records.length === 0) return DEFAULT_OPTIONS;

  return records.map((option, index) => {
    const values = toRecordArray(option.values).length
      ? toRecordArray(option.values)[0]
      : option;

    const filteredValues: Record<string, unknown> = {};
    Object.entries(values).forEach(([key, value]) => {
      if (!["id", "name", "title"].includes(key)) {
        filteredValues[key] = value;
      }
    });

    return {
      id: toStringValue(option.id, `option_${index}`),
      name: toStringValue(option.name, toStringValue(option.title, `Option ${index + 1}`)),
      values: filteredValues,
    };
  });
};

export const DynamicComparisonTableSection = ({
  section,
}: DynamicComparisonTableSectionProps) => {
  const options = getSectionOptions(section);
  const rows = normalizeOptions(options);
  const criteria = toStringArray(options.criteria);

  const derivedCriteria =
    criteria.length > 0
      ? criteria
      : Array.from(
          new Set(
            rows.flatMap((row) => Object.keys(row.values))
          )
        );

  const recommended = toStringValue(options.recommended, "");

  return (
    <DynamicSectionShell section={section}>
      {recommended ? (
        <div className="rounded border border-border bg-card/60 p-2.5 text-xs flex items-center justify-between">
          <span className="text-muted-foreground">Recommended Option</span>
          <Badge variant="default">{recommended}</Badge>
        </div>
      ) : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Option</TableHead>
            {derivedCriteria.map((criterion) => (
              <TableHead key={criterion} className="capitalize">
                {criterion}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.name}</TableCell>
              {derivedCriteria.map((criterion) => (
                <TableCell key={`${row.id}_${criterion}`}>
                  {toDisplayString(row.values[criterion], "-")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DynamicSectionShell>
  );
};
