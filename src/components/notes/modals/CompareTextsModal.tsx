// src/components/notes/modals/CompareTextsModal.tsx
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
import { Loader2, GitCompare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { compareTextsApi } from "@/lib/noteAiApi";

interface CompareTextsModalProps {
  open: boolean;
  onClose: () => void;
  onCompare: (textA: string, textB: string) => Promise<void>;
  noteContent: string;
  loading: boolean;
}

export function CompareTextsModal({
  open,
  onClose,
  onCompare,
  noteContent,
  loading,
}: CompareTextsModalProps) {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [comparison, setComparison] = useState<string>("");
  const [isComparing, setIsComparing] = useState(false);

  const handleCompare = async () => {
    if (!textA.trim() || !textB.trim()) return;
    setIsComparing(true);
    setComparison("");
    try {
      const result = await compareTextsApi(textA, textB);
      // Ensure result is a string
      setComparison(typeof result === "string" ? result : String(result || ""));
      // Also call parent's onCompare to insert into note if needed
      await onCompare(textA, textB);
    } catch (error) {
      console.error("Comparison failed:", error);
    } finally {
      setIsComparing(false);
    }
  };

  const handleClose = () => {
    setTextA("");
    setTextB("");
    setComparison("");
    onClose();
  };

  const useCurrentNote = () => {
    setTextA(noteContent);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Compare Two Texts
          </DialogTitle>
          <DialogDescription>
            Analyze differences, similarities, and potential improvements.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-4 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="text-a">Text A</Label>
                  {noteContent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={useCurrentNote}
                      className="text-xs h-6"
                    >
                      Use Current Note
                    </Button>
                  )}
                </div>
                <Textarea
                  id="text-a"
                  placeholder="Enter or paste the first text..."
                  value={textA}
                  onChange={(e) => setTextA(e.target.value)}
                  disabled={loading}
                  className="min-h-[150px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text-b">Text B</Label>
                <Textarea
                  id="text-b"
                  placeholder="Enter or paste the second text..."
                  value={textB}
                  onChange={(e) => setTextB(e.target.value)}
                  disabled={loading}
                  className="min-h-[150px]"
                />
              </div>
            </div>

            <Button
              onClick={handleCompare}
              disabled={!textA.trim() || !textB.trim() || isComparing || loading}
              className="w-full"
            >
              {isComparing || loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Comparing...
                </>
              ) : (
                "Compare Texts"
              )}
            </Button>

            {comparison && typeof comparison === "string" && (
              <div className="space-y-4">
                <div className="rounded-md border border-border bg-muted/50 p-4">
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown>
                      {comparison}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
