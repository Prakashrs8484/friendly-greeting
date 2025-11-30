// src/components/notes/NoteAIActions.tsx
import { Button } from "@/components/ui/button";
import { Wand2, RefreshCw, Volume2, VolumeX, Loader2 } from "lucide-react";

interface NoteAIActionsProps {
  onImprove: () => void;
  onParaphrase: () => void;
  onReadAloud: () => void;
  onStopAudio: () => void;
  improving: boolean;
  paraphrasing: boolean;
  ttsLoading: boolean;
  playing: boolean;
  disabled?: boolean;
}

export function NoteAIActions({
  onImprove,
  onParaphrase,
  onReadAloud,
  onStopAudio,
  improving,
  paraphrasing,
  ttsLoading,
  playing,
  disabled = false,
}: NoteAIActionsProps) {
  const isProcessing = improving || paraphrasing || ttsLoading;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onImprove}
        disabled={disabled || isProcessing}
        className="text-xs gap-1.5"
      >
        {improving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Wand2 className="h-3.5 w-3.5" />
        )}
        {improving ? "Improving..." : "Improve Grammar"}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onParaphrase}
        disabled={disabled || isProcessing}
        className="text-xs gap-1.5"
      >
        {paraphrasing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        {paraphrasing ? "Paraphrasing..." : "Paraphrase"}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={playing ? onStopAudio : onReadAloud}
        disabled={disabled || improving || paraphrasing || ttsLoading}
        className="text-xs gap-1.5"
      >
        {ttsLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : playing ? (
          <VolumeX className="h-3.5 w-3.5" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
        {ttsLoading ? "Loading..." : playing ? "Stop" : "Read Aloud"}
      </Button>
    </div>
  );
}
