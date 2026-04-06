import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface DynamicTabsSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

interface TabItem {
  id: string;
  label: string;
  content: string;
  tags: string[];
}

const DEFAULT_TABS: TabItem[] = [
  { id: "overview", label: "Overview", content: "Overview content.", tags: [] },
  { id: "details", label: "Details", content: "Detailed view.", tags: [] },
  { id: "notes", label: "Notes", content: "Notes and context.", tags: [] },
];

const normalizeTabs = (options: Record<string, unknown>): TabItem[] => {
  const tabRecords = toRecordArray(options.tabs);
  if (tabRecords.length === 0) return DEFAULT_TABS;

  return tabRecords.map((tab, index) => ({
    id: toStringValue(tab.id, `tab_${index}`),
    label: toStringValue(tab.label, `Tab ${index + 1}`),
    content: toStringValue(tab.content, toStringValue(tab.description, "")),
    tags: toStringArray(tab.tags),
  }));
};

export const DynamicTabsSection = ({ section }: DynamicTabsSectionProps) => {
  const options = getSectionOptions(section);
  const tabs = normalizeTabs(options);
  const defaultTab = toStringValue(options.defaultTab, tabs[0]?.id || "tab_0");

  return (
    <DynamicSectionShell section={section}>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="rounded border border-border bg-card/60 p-3">
            <p className="text-sm">{toDisplayString(tab.content, "No content configured.")}</p>
            {tab.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-2">
                {tab.tags.map((tag) => (
                  <Badge key={`${tab.id}_${tag}`} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </TabsContent>
        ))}
      </Tabs>
    </DynamicSectionShell>
  );
};
