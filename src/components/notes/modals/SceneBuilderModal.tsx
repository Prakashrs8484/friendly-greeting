// src/components/notes/modals/SceneBuilderModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MapPin, Plus, Replace } from "lucide-react";

interface SceneBuilderModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (location: string, mood: string) => Promise<string>;
  onInsert: (text: string) => void;
  onReplace: (text: string) => void;
  loading: boolean;
}

export function SceneBuilderModal({
  open,
  onClose,
  onGenerate,
  onInsert,
  onReplace,
  loading,
}: SceneBuilderModalProps) {
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState("");
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    if (!location.trim() || !mood.trim()) return;
    try {
      const scene = await onGenerate(location, mood);
      setResult(scene);
    } catch (error) {
      console.error("Scene generation failed:", error);
    }
  };

  const handleClose = () => {
    setLocation("");
    setMood("");
    setResult("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Scene Builder
          </DialogTitle>
          <DialogDescription>
            Generate a vivid scene description for your writing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Abandoned lighthouse on a cliff"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mood">Mood / Atmosphere</Label>
            <Input
              id="mood"
              placeholder="e.g., Eerie, melancholic, mysterious"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!location.trim() || !mood.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Scene"
            )}
          </Button>

          {result && (
            <div className="space-y-2">
              <Label>Generated Scene</Label>
              <Textarea
                value={result}
                readOnly
                className="min-h-[150px] bg-muted/50"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onInsert(result);
                    handleClose();
                  }}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Insert into Note
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onReplace(result);
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
