import { DynamicChartBase } from "./DynamicChartBase";
import { DynamicSection } from "./dynamicSectionUtils";

interface DynamicChartPieSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

export const DynamicChartPieSection = ({ section }: DynamicChartPieSectionProps) => {
  return <DynamicChartBase section={section} kind="pie" />;
};
