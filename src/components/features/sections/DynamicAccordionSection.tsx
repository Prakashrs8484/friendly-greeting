import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DynamicSectionShell } from "./DynamicSectionShell";
import {
  DynamicSection,
  getSectionOptions,
  toDisplayString,
  toRecordArray,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicAccordionSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

interface AccordionEntry {
  id: string;
  title: string;
  content: string;
}

const DEFAULT_ITEMS: AccordionEntry[] = [
  { id: "item_1", title: "What is this section for?", content: "Use this section to organize expandable details." },
  { id: "item_2", title: "How is it configured?", content: "Pass `items` in `section.props` with title/content pairs." },
];

const normalizeItems = (options: Record<string, unknown>): AccordionEntry[] => {
  const records = toRecordArray(options.items);
  if (records.length === 0) return DEFAULT_ITEMS;

  return records.map((item, index) => ({
    id: toStringValue(item.id, `item_${index}`),
    title: toStringValue(item.title, `Item ${index + 1}`),
    content: toDisplayString(item.content, toDisplayString(item.description, "")),
  }));
};

export const DynamicAccordionSection = ({ section }: DynamicAccordionSectionProps) => {
  const options = getSectionOptions(section);
  const items = normalizeItems(options);
  const defaultValue = toStringValue(options.defaultItem, items[0]?.id || "item_0");

  return (
    <DynamicSectionShell section={section}>
      <Accordion type="single" collapsible defaultValue={defaultValue} className="w-full">
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id}>
            <AccordionTrigger className="text-sm py-3">{item.title}</AccordionTrigger>
            <AccordionContent className="text-xs text-muted-foreground pb-3">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </DynamicSectionShell>
  );
};
