import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface FormSectionProps {
  section: {
    component: "form";
    label: string;
    description?: string;
    fields?: string[];
    editable?: boolean;
    collapsible?: boolean;
  };
  featureId: string;
  onSubmit?: (data: Record<string, string>) => void;
}

export const FormSection = ({ section, featureId, onSubmit }: FormSectionProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isCollapsed, setIsCollapsed] = useState(section.collapsible !== false);

  const fields = section.fields || ["name", "description"];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    setFormData({});
  };

  if (isCollapsed && section.collapsible) {
    return (
      <div className="mt-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="text-sm font-semibold text-primary hover:underline"
        >
          + {section.label}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">{section.label}</h3>
          {section.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {section.description}
            </p>
          )}
        </div>
        {section.collapsible && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {fields.map((field) => (
          <div key={field}>
            <Label className="text-xs mb-1.5 block capitalize">{field}</Label>
            {field === "notes" || field === "description" ? (
              <Textarea
                value={formData[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={`Enter ${field}...`}
                className="rounded-lg text-sm resize-none min-h-[80px]"
              />
            ) : (
              <Input
                type={field === "date" ? "date" : "text"}
                value={formData[field] || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={`Enter ${field}...`}
                className="rounded-lg text-sm"
              />
            )}
          </div>
        ))}

        <Button type="submit" className="w-full rounded-lg gap-2">
          <Plus className="w-4 h-4" />
          Add {fields[0]}
        </Button>
      </form>
    </div>
  );
};
