import { ComponentType as ReactComponentType, ReactNode, useMemo, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import type { Feature } from "@/lib/agentPageApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clamp, DynamicSection } from "./sections/dynamicSectionUtils";

import { DynamicAccordionSection } from "./sections/DynamicAccordionSection";
import { DynamicCalendarSection } from "./sections/DynamicCalendarSection";
import { DynamicChartBarSection } from "./sections/DynamicChartBarSection";
import { DynamicChartLineSection } from "./sections/DynamicChartLineSection";
import { DynamicChartPieSection } from "./sections/DynamicChartPieSection";
import { DynamicChartSection } from "./sections/DynamicChartSection";
import { DynamicComparisonTableSection } from "./sections/DynamicComparisonTableSection";
import { DynamicFilterBarSection } from "./sections/DynamicFilterBarSection";
import { DynamicFormSection } from "./sections/DynamicFormSection";
import { DynamicInsightPanelSection } from "./sections/DynamicInsightPanelSection";
import { DynamicKanbanSection } from "./sections/DynamicKanbanSection";
import { DynamicKpiGridSection } from "./sections/DynamicKpiGridSection";
import { DynamicListSection } from "./sections/DynamicListSection";
import { DynamicMetricBoardSection } from "./sections/DynamicMetricBoardSection";
import { DynamicProgressTrackerSection } from "./sections/DynamicProgressTrackerSection";
import { DynamicStreakTrackerSection } from "./sections/DynamicStreakTrackerSection";
import { DynamicSummaryCardSection } from "./sections/DynamicSummaryCardSection";
import { DynamicTableSection } from "./sections/DynamicTableSection";
import { DynamicTabsSection } from "./sections/DynamicTabsSection";
import { DynamicTagSelectorSection } from "./sections/DynamicTagSelectorSection";
import { DynamicTimelineSection } from "./sections/DynamicTimelineSection";

interface DynamicFeatureRendererProps {
  feature: Feature;
  onDeleteFeature?: () => void;
}

type LayoutType = "vertical" | "grid" | "dashboard" | "sidebar";

interface LayoutConfig {
  type: LayoutType;
  columns?: number;
}

type SupportedComponentType =
  | "form"
  | "list"
  | "table"
  | "kanban"
  | "calendar"
  | "timeline"
  | "chart-bar"
  | "chart-line"
  | "chart-pie"
  | "kpi-grid"
  | "tabs"
  | "accordion"
  | "progressTracker"
  | "comparisonTable"
  | "filterBar"
  | "tagSelector"
  | "streakTracker"
  | "metricBoard"
  | "insightPanel";

type LegacyComponentType = "chart" | "summaryCard";
type ComponentType = SupportedComponentType | LegacyComponentType;

interface Section extends DynamicSection {
  component: ComponentType | string;
}

interface PageBlueprint {
  featureName?: string;
  description?: string;
  layout?: LayoutConfig | LayoutType | string;
  sections?: Section[];
  dataModel?: string[];
  aiCapabilities?: string[];
}

type DynamicSectionComponent = ReactComponentType<{
  section: DynamicSection;
  featureId: string;
  featureName: string;
}>;

const SECTION_COMPONENTS: Record<ComponentType, DynamicSectionComponent> = {
  form: DynamicFormSection,
  list: DynamicListSection,
  table: DynamicTableSection,
  kanban: DynamicKanbanSection,
  calendar: DynamicCalendarSection,
  timeline: DynamicTimelineSection,
  "chart-bar": DynamicChartBarSection,
  "chart-line": DynamicChartLineSection,
  "chart-pie": DynamicChartPieSection,
  "kpi-grid": DynamicKpiGridSection,
  tabs: DynamicTabsSection,
  accordion: DynamicAccordionSection,
  progressTracker: DynamicProgressTrackerSection,
  comparisonTable: DynamicComparisonTableSection,
  filterBar: DynamicFilterBarSection,
  tagSelector: DynamicTagSelectorSection,
  streakTracker: DynamicStreakTrackerSection,
  metricBoard: DynamicMetricBoardSection,
  insightPanel: DynamicInsightPanelSection,
  chart: DynamicChartSection,
  summaryCard: DynamicSummaryCardSection,
};

const UnsupportedSection = ({ section }: { section: Section }) => (
  <div className="p-4 rounded-lg bg-secondary border border-border">
    <p className="text-sm text-muted-foreground">
      Section type <strong>{section.component}</strong> is not supported.
    </p>
  </div>
);

const normalizeLayout = (layout: LayoutConfig | string | undefined): LayoutConfig => {
  if (!layout) {
    return { type: "vertical" };
  }

  if (typeof layout === "string") {
    return { type: (layout as LayoutType) || "vertical" };
  }

  return layout;
};

const getLayoutClassName = (layout: LayoutConfig): string => {
  const type = layout.type || "vertical";
  const columns = clamp(layout.columns || 2, 1, 4);

  const gridColumnMap: Record<number, string> = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  const dashboardColumnMap: Record<number, string> = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  if (type === "grid") {
    return `grid grid-cols-1 ${gridColumnMap[columns]} gap-4`;
  }

  if (type === "dashboard") {
    return `grid grid-cols-1 ${dashboardColumnMap[columns]} gap-4`;
  }

  if (type === "sidebar") {
    return "grid grid-cols-1 lg:grid-cols-3 gap-4";
  }

  return "space-y-4";
};

const LayoutContainer = ({
  layout,
  children,
}: {
  layout: LayoutConfig | string | undefined;
  children: ReactNode;
}) => {
  const normalizedLayout = normalizeLayout(layout);
  const className = getLayoutClassName(normalizedLayout);
  return <div className={className}>{children}</div>;
};

export const DynamicFeatureRenderer = ({
  feature,
  onDeleteFeature,
}: DynamicFeatureRendererProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const pageBlueprint = useMemo(
    () => (feature?.pageBlueprint || {}) as PageBlueprint,
    [feature]
  );

  const sections = pageBlueprint.sections || [];
  const layout = pageBlueprint.layout;

  const handleDelete = async () => {
    if (!confirm(`Delete feature "${feature.name}"?`)) return;
    setIsDeleting(true);
    try {
      onDeleteFeature?.();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="rounded-2xl bg-card border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{feature.name}</CardTitle>
          </div>
          {onDeleteFeature ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors disabled:opacity-50"
              aria-label="Delete feature"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : null}
        </div>
        {feature.description ? (
          <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
        ) : null}
      </CardHeader>

      <CardContent>
        {sections.length > 0 ? (
          <LayoutContainer layout={layout}>
            {sections.map((section, index) => {
              const componentKey = section.component as ComponentType;
              const SectionComponent = SECTION_COMPONENTS[componentKey];

              if (!SectionComponent) {
                return (
                  <UnsupportedSection
                    key={section.id || `unsupported_${index}`}
                    section={section}
                  />
                );
              }

              return (
                <SectionComponent
                  key={section.id || `${section.component}_${index}`}
                  section={section}
                  featureId={feature._id}
                  featureName={feature.name}
                />
              );
            })}
          </LayoutContainer>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No sections defined for this feature
          </div>
        )}
      </CardContent>
    </Card>
  );
};
