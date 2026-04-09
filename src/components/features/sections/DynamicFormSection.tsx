import { useMemo, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DynamicSectionShell } from "./DynamicSectionShell";
import { useSectionData } from "@/hooks/useSectionData";
import {
  DynamicField,
  DynamicSection,
  getSectionOptions,
  toStringValue,
} from "./dynamicSectionUtils";

interface DynamicFormSectionProps {
  section: DynamicSection;
  featureId: string;
  featureName: string;
  pageId: string;
}

const normalizeFieldOptions = (
  field: DynamicField
): Array<{ label: string; value: string }> => {
  if (!Array.isArray(field.options)) return [];
  return field.options
    .map((option) => {
      if (typeof option === "string") {
        return { label: option, value: option };
      }
      if (option && typeof option === "object") {
        const label = toStringValue(option.label, "");
        const value = toStringValue(option.value, label);
        if (value) return { label: label || value, value };
      }
      return null;
    })
    .filter((option): option is { label: string; value: string } => Boolean(option));
};

export const DynamicFormSection = ({
  section,
  featureId,
  featureName,
  pageId,
}: DynamicFormSectionProps) => {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data, addItem, isLoading } = useSectionData(pageId, featureId);

  useEffect(() => {
    // Load data on component mount
    return () => {};
  }, []);

  const fields = Array.isArray(section.fields) ? section.fields : [];
  const sectionOptions = useMemo(() => getSectionOptions(section), [section]);

  const submitLabel = toStringValue(sectionOptions.submitLabel, "Add Entry");
  const submittingLabel = toStringValue(sectionOptions.submittingLabel, "Saving...");

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      for (const field of fields) {
        if (field.required && !formData[field.name]) {
          alert(`${field.label} is required`);
          setIsSubmitting(false);
          return;
        }
      }

      // Persist form payload to backend with useSectionData hook
      await addItem(formData);
      setFormData({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: DynamicField) => {
    const value = formData[field.name];

    if (field.type === "textarea") {
      return (
        <Textarea
          value={toStringValue(value)}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className="text-sm"
          rows={3}
        />
      );
    }

    if (field.type === "select") {
      const options = normalizeFieldOptions(field);
      return (
        <Select value={toStringValue(value)} onValueChange={(nextValue) => handleFieldChange(field.name, nextValue)}>
          <SelectTrigger className="text-sm">
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field.type === "number") {
      return (
        <Input
          type="number"
          value={typeof value === "number" ? value : toStringValue(value)}
          onChange={(e) =>
            handleFieldChange(
              field.name,
              e.target.value === "" ? "" : Number.parseFloat(e.target.value)
            )
          }
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className="text-sm"
        />
      );
    }

    if (field.type === "date" || field.type === "time") {
      return (
        <Input
          type={field.type}
          value={toStringValue(value)}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          className="text-sm"
        />
      );
    }

    return (
      <Input
        type="text"
        value={toStringValue(value)}
        onChange={(e) => handleFieldChange(field.name, e.target.value)}
        placeholder={`Enter ${field.label.toLowerCase()}`}
        className="text-sm"
      />
    );
  };

  return (
    <DynamicSectionShell section={section}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              {field.label}
              {field.required ? <span className="text-destructive ml-1">*</span> : null}
            </label>
            {renderField(field)}
          </div>
        ))}

        <Button type="submit" disabled={isSubmitting} size="sm" className="w-full mt-2">
          <Plus className="w-4 h-4 mr-2" />
          {isSubmitting ? submittingLabel : submitLabel}
        </Button>
      </form>
    </DynamicSectionShell>
  );
};
