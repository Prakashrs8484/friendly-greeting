import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { Feature } from "@/lib/agentPageApi";

interface ListItem {
  id: string;
  [key: string]: any;
}

interface ListSectionProps {
  section: {
    component: "list";
    label: string;
    description?: string;
    fields?: string[];
    editable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
  };
  featureId: string;
}

export const ListSection = ({ section, featureId }: ListSectionProps) => {
  const [items, setItems] = useState<ListItem[]>([]);
  const [newItemName, setNewItemName] = useState("");

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`feature-${featureId}-list`);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to load list items:", err);
      }
    }
  }, [featureId]);

  // Save to localStorage
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(`feature-${featureId}-list`, JSON.stringify(items));
    }
  }, [items, featureId]);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    const newItem: ListItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      createdAt: new Date().toISOString(),
    };

    setItems([newItem, ...items]);
    setNewItemName("");
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="mt-4 space-y-3">
      <div>
        <h3 className="text-sm font-semibold mb-2">{section.label}</h3>
        {section.description && (
          <p className="text-xs text-muted-foreground mb-3">{section.description}</p>
        )}
      </div>

      {section.editable && (
        <div className="flex gap-2">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddItem();
            }}
            placeholder="Add new item..."
            className="rounded-lg text-sm flex-1"
          />
          <Button
            onClick={handleAddItem}
            disabled={!newItemName.trim()}
            size="sm"
            className="rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}

      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 p-3 rounded-lg bg-secondary border border-border hover:border-primary/20 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                {item.createdAt && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              {section.editable && (
                <Button
                  onClick={() => handleDeleteItem(item.id)}
                  variant="ghost"
                  size="sm"
                  className="rounded-lg h-8 w-8 p-0 hover:text-destructive hover:bg-secondary"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No items yet. {section.editable && "Add one to get started!"}
        </div>
      )}
    </div>
  );
};
