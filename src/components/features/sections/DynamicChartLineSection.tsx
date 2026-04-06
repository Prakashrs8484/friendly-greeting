import { DynamicChartBase } from "./DynamicChartBase";
import { DynamicSection } from "./dynamicSectionUtils";

interface DynamicChartLineSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

export const DynamicChartLineSection = ({ section }: DynamicChartLineSectionProps) => {
  return <DynamicChartBase section={section} kind="line" />;
};
