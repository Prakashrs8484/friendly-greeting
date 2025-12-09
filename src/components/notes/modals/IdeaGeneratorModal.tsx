// src/components/notes/modals/IdeaGeneratorModal.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Lightbulb, Plus, Replace } from "lucide-react";
import { IdeaMode } from "@/lib/noteAiApi";

interface IdeaGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (mode: IdeaMode, topic?: string) => Promise<string[]>;
  onInsert: (text: string) => void;
  onReplace: (text: string) => void;
  loading: boolean;
}

const IDEA_MODES: { value: IdeaMode; label: string }[] = [
  { value: "story", label: "Story Ideas" },
  { value: "poem", label: "Poem Ideas" },
  { value: "article", label: "Article Topics" },
  { value: "youtube", label: "YouTube Video Ideas" },
  { value: "motivational", label: "Motivational Content" },
  { value: "romantic", label: "Romantic Writing" },
];

export function IdeaGeneratorModal({
  open,
  onClose,
  onGenerate,
  onInsert,
  onReplace,
  loading,
}: IdeaGeneratorModalProps) {
  const [mode, setMode] = useState<IdeaMode>("story");
  const [topic, setTopic] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);

  const handleGenerate = async () => {
    try {
      const result = await onGenerate(mode, topic || undefined);
      setIdeas(result);
    } catch (error) {
      console.error("Idea generation failed:", error);
    }
  };

  const handleClose = () => {
    setMode("story");
    setTopic("");
    setIdeas([]);
    onClose();
  };

  const formatIdeas = (): string => {
    return ideas.map((idea, idx) => `${idx + 1}. ${idea}`).join("\n");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Idea Generator
          </DialogTitle>
          <DialogDescription>
            Generate creative ideas for your writing projects.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="idea-mode">Content Type</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as IdeaMode)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                {IDEA_MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic (Optional)</Label>
            <Input
              id="topic"
              placeholder="e.g., Time travel, Love in the digital age..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Ideas"
            )}
          </Button>

          {ideas.length > 0 && (
            <div className="space-y-2">
              <Label>Generated Ideas</Label>
              <ScrollArea className="h-[180px] rounded-md border bg-muted/50 p-3">
                <ul className="space-y-2">
                  {ideas.map((idea, idx) => (
                    <li key={idx} className="text-sm flex gap-2">
                      <span className="text-primary font-medium">{idx + 1}.</span>
                      <span>{idea}</span>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onInsert(formatIdeas());
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
                    onReplace(formatIdeas());
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
