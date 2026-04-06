import { DynamicChartBase } from "./DynamicChartBase";
import { DynamicSection } from "./dynamicSectionUtils";

interface DynamicChartBarSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
}

export const DynamicChartBarSection = ({ section }: DynamicChartBarSectionProps) => {
  return <DynamicChartBase section={section} kind="bar" />;
};
