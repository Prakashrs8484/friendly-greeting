import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toDisplayString,
  toNumberValue,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicTableSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

interface ColumnConfig {
  key: string;
  label: string;
}

const deriveColumns = (
  section: DynamicSection,
  options: Record<string, unknown>,
  rows: Record<string, unknown>[]
): ColumnConfig[] => {
  const columnRecords = toRecordArray(options.columns);
  if (columnRecords.length > 0) {
    return columnRecords
      .map((column, index) => {
        const key = toStringValue(column.key, toStringValue(column.accessor, ""));
        const label = toStringValue(column.label, key || `Column ${index + 1}`);
        return key ? { key, label } : null;
      })
      .filter((column): column is ColumnConfig => Boolean(column));
  }

  if (Array.isArray(section.fields) && section.fields.length > 0) {
    return section.fields.map((field) => ({
      key: field.name,
      label: field.label || field.name,
    }));
  }

  const firstRow = rows[0];
  if (!firstRow) return [];

  return Object.keys(firstRow).map((key) => ({ key, label: key }));
};

export const DynamicTableSection = ({ section }: DynamicTableSectionProps) => {
  const options = getSectionOptions(section);
  const rawRows = toRecordArray(options.rows);
  const dataRows = rawRows.length > 0 ? rawRows : toRecordArray(options.data);
  const rows = dataRows.length > 0 ? dataRows : toRecordArray(options.items);
  const limit = toNumberValue(options.limit, rows.length);
  const visibleRows = rows.slice(0, Math.max(limit, 0));
  const columns = deriveColumns(section, options, visibleRows);
  const emptyLabel = toStringValue(options.emptyMessage, "No rows available.");

  return (
    <DynamicSectionShell section={section}>
      {columns.length === 0 || visibleRows.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center">{emptyLabel}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((row, rowIndex) => (
              <TableRow key={toStringValue(row.id, `row_${rowIndex}`)}>
                {columns.map((column) => (
                  <TableCell key={`${column.key}_${rowIndex}`}>
                    {toDisplayString(row[column.key], "-")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DynamicSectionShell>
  );
};
