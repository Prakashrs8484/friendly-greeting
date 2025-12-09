// src/components/notes/modals/CharacterBuilderModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, User, Plus, Replace } from "lucide-react";

interface CharacterBuilderModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (description: string) => Promise<object>;
  onInsert: (text: string) => void;
  onReplace: (text: string) => void;
  loading: boolean;
}

export function CharacterBuilderModal({
  open,
  onClose,
  onGenerate,
  onInsert,
  onReplace,
  loading,
}: CharacterBuilderModalProps) {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<object | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    try {
      const character = await onGenerate(description);
      setResult(character);
    } catch (error) {
      console.error("Character generation failed:", error);
    }
  };

  const handleClose = () => {
    setDescription("");
    setResult(null);
    onClose();
  };

  const formatResult = (obj: object): string => {
    return JSON.stringify(obj, null, 2);
  };

  const formatAsMarkdown = (obj: object): string => {
    const lines: string[] = ["## Character Profile\n"];
    const flattenObject = (o: any, prefix = ""): void => {
      for (const [key, value] of Object.entries(o)) {
        const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
        if (typeof value === "object" && value !== null && !Array.isArray(value)) {
          lines.push(`### ${label}`);
          flattenObject(value, prefix + "  ");
        } else if (Array.isArray(value)) {
          lines.push(`**${label}:** ${value.join(", ")}`);
        } else {
          lines.push(`**${label}:** ${value}`);
        }
      }
    };
    flattenObject(obj);
    return lines.join("\n");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Character Builder
          </DialogTitle>
          <DialogDescription>
            Create a detailed character profile from a description.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="char-description">Character Description</Label>
            <Textarea
              id="char-description"
              placeholder="e.g., A retired detective in her 60s who now runs a bookshop in a small coastal town..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="min-h-[100px]"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!description.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Build Character"
            )}
          </Button>

          {result && (
            <div className="space-y-2">
              <Label>Character Profile</Label>
              <ScrollArea className="h-[200px] rounded-md border bg-muted/50 p-3">
                <pre className="text-xs whitespace-pre-wrap">
                  {formatResult(result)}
                </pre>
              </ScrollArea>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onInsert(formatAsMarkdown(result));
                    handleClose();
                  }}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Insert as Markdown
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onReplace(formatAsMarkdown(result));
                    handleClose();
                  }}
                  className="flex-1"
                >
                  <Replace className="h-4 w-4 mr-1" />
                  Replace Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
