import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CounterSectionProps {
  section: {
    component: "counter";
    label: string;
    description?: string;
    metric?: string;
  };
  featureId: string;
}

export const CounterSection = ({ section, featureId }: CounterSectionProps) => {
  const [count, setCount] = useState(0);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`feature-${featureId}-counter`);
    if (saved) {
      try {
        setCount(parseInt(saved, 10));
      } catch (err) {
        console.error("Failed to load counter:", err);
      }
    }
  }, [featureId]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`feature-${featureId}-counter`, String(count));
  }, [count, featureId]);

  const handleIncrement = () => setCount((prev) => prev + 1);
  const handleDecrement = () => setCount((prev) => Math.max(0, prev - 1));
  const handleReset = () => setCount(0);

  return (
    <div className="mt-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">{section.label}</h3>
        {section.description && (
          <p className="text-xs text-muted-foreground">{section.description}</p>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-secondary border border-border">
        <div className="text-5xl font-bold text-primary">{count}</div>
        <p className="text-sm text-muted-foreground">{section.metric || "Total"}</p>

        <div className="flex gap-2">
          <Button
            onClick={handleDecrement}
            variant="outline"
            className="rounded-lg"
          >
            −
          </Button>
          <Button
            onClick={handleIncrement}
            className="rounded-lg bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="rounded-lg"
          >
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
