import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toDisplayString,
  toNumberValue,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

type ChartKind = "bar" | "line" | "pie";

interface DynamicChartBaseProps {
  section: DynamicSection;
  kind: ChartKind;
}

const DEFAULT_DATA: Record<ChartKind, Array<Record<string, unknown>>> = {
  bar: [
    { name: "Mon", value: 24 },
    { name: "Tue", value: 18 },
    { name: "Wed", value: 30 },
    { name: "Thu", value: 22 },
    { name: "Fri", value: 28 },
  ],
  line: [
    { name: "Week 1", value: 12 },
    { name: "Week 2", value: 19 },
    { name: "Week 3", value: 15 },
    { name: "Week 4", value: 24 },
  ],
  pie: [
    { name: "Category A", value: 45 },
    { name: "Category B", value: 30 },
    { name: "Category C", value: 25 },
  ],
};

const DEFAULT_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed"];

export const DynamicChartBase = ({ section, kind }: DynamicChartBaseProps) => {
  const options = getSectionOptions(section);
  const chartData = toRecordArray(options.data);
  const data = chartData.length > 0 ? chartData : DEFAULT_DATA[kind];

  const xKey = toStringValue(options.xKey, "name");
  const yKey = toStringValue(options.yKey, "value");
  const valueKey = toStringValue(options.valueKey, yKey);
  const nameKey = toStringValue(options.nameKey, xKey);
  const colors = Array.isArray(options.colors)
    ? options.colors.map((value) => toStringValue(value)).filter(Boolean)
    : DEFAULT_COLORS;

  return (
    <DynamicSectionShell section={section}>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {kind === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => toDisplayString(value, "0")} />
              <Bar dataKey={yKey} fill={colors[0] || DEFAULT_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : null}

          {kind === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => toDisplayString(value, "0")} />
              <Line
                type="monotone"
                dataKey={yKey}
                stroke={colors[0] || DEFAULT_COLORS[0]}
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          ) : null}

          {kind === "pie" ? (
            <PieChart>
              <Pie data={data} dataKey={valueKey} nameKey={nameKey} cx="50%" cy="50%" outerRadius={78} label>
                {data.map((entry, index) => (
                  <Cell
                    key={`${toDisplayString(entry[nameKey], `slice-${index}`)}-${index}`}
                    fill={colors[index % colors.length] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => toDisplayString(value, "0")} />
              <Legend />
            </PieChart>
          ) : null}
        </ResponsiveContainer>
      </div>

      {toStringValue(options.caption) ? (
        <p className="text-xs text-muted-foreground">{toStringValue(options.caption)}</p>
      ) : null}
      {toNumberValue(options.goal, -1) >= 0 ? (
        <p className="text-xs text-muted-foreground">
          Goal: {toDisplayString(options.goal, "0")}
        </p>
      ) : null}
    </DynamicSectionShell>
  );
};
