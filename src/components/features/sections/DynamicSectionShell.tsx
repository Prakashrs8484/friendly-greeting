import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  DynamicSection,
  getVariantBodyClass,
  sectionCardClass,
} from "./dynamicSectionUtils";

interface DynamicSectionShellProps {
  section: Pick<DynamicSection, "label" | "description" | "variant">;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const DynamicSectionShell = ({
  section,
  children,
  className,
  bodyClassName,
}: DynamicSectionShellProps) => {
  return (
    <div className={sectionCardClass(section.variant, className)}>
      <div className={cn("mb-3", section.variant === "compact" ? "mb-2" : "mb-3")}>
        <h3 className="font-semibold text-sm">{section.label}</h3>
        {section.description ? (
          <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
        ) : null}
      </div>

      <div className={cn(getVariantBodyClass(section.variant), bodyClassName)}>{children}</div>
    </div>
  );
};
