import { cn } from "@/lib/utils";

export type SectionVariant = "compact" | "detailed" | "minimal";

export type FieldType = "text" | "number" | "date" | "time" | "select" | "textarea";

export interface DynamicField {
  name: string;
  type: FieldType;
  label: string;
  required?: boolean;
  options?: Array<string | { label: string; value: string }>;
}

export interface DynamicSection {
  id: string;
  component: string;
  variant?: SectionVariant;
  label: string;
  description?: string;
  fields?: DynamicField[];
  props?: Record<string, unknown>;
  [key: string]: unknown;
}

const RESERVED_SECTION_KEYS = new Set([
  "id",
  "component",
  "variant",
  "label",
  "description",
  "fields",
  "props",
]);

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const toStringValue = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

export const toDisplayString = (value: unknown, fallback = "-"): string => {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toLocaleDateString();

  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
};

export const toNumberValue = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

export const toBooleanValue = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
};

export const toStringArray = (value: unknown, fallback: string[] = []): string[] => {
  if (!Array.isArray(value)) return fallback;
  return value.map((item) => toStringValue(item)).filter(Boolean);
};

export const toRecordArray = (value: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord);
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const getVariantContainerClass = (variant?: SectionVariant): string => {
  switch (variant) {
    case "compact":
      return "p-3";
    case "detailed":
      return "p-5";
    case "minimal":
      return "p-2.5 bg-card/50";
    default:
      return "p-4";
  }
};

export const getVariantBodyClass = (variant?: SectionVariant): string => {
  switch (variant) {
    case "compact":
      return "space-y-2";
    case "minimal":
      return "space-y-2";
    default:
      return "space-y-3";
  }
};

export const sectionCardClass = (variant?: SectionVariant, extra?: string): string =>
  cn(
    "rounded-lg border border-border bg-secondary/50",
    getVariantContainerClass(variant),
    extra
  );

export const getSectionOptions = (section: DynamicSection): Record<string, unknown> => {
  const inlineOptions: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(section)) {
    if (!RESERVED_SECTION_KEYS.has(key)) {
      inlineOptions[key] = value;
    }
  }

  if (isRecord(section.props)) {
    return {
      ...inlineOptions,
      ...section.props,
    };
  }

  return inlineOptions;
};
