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
import { CompareResult } from "@/lib/noteAiApi";

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
  const [result, setResult] = useState<CompareResult | null>(null);

  const handleCompare = async () => {
    if (!textA.trim() || !textB.trim()) return;
    try {
      // The parent handles the compare and may store results
      await onCompare(textA, textB);
    } catch (error) {
      console.error("Comparison failed:", error);
    }
  };

  const handleClose = () => {
    setTextA("");
    setTextB("");
    setResult(null);
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
              disabled={!textA.trim() || !textB.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Comparing...
                </>
              ) : (
                "Compare Texts"
              )}
            </Button>

            {result && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-destructive">Differences</Label>
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                    <ul className="text-sm space-y-1">
                      {result.differences.map((diff, idx) => (
                        <li key={idx}>• {diff}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-primary">Similarities</Label>
                  <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
                    <ul className="text-sm space-y-1">
                      {result.similarities.map((sim, idx) => (
                        <li key={idx}>• {sim}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-green-600">Suggested Improvements</Label>
                  <div className="rounded-md border border-green-500/30 bg-green-500/5 p-3">
                    <ul className="text-sm space-y-1">
                      {result.improvements.map((imp, idx) => (
                        <li key={idx}>• {imp}</li>
                      ))}
                    </ul>
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
