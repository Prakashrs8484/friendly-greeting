import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface RecordingIndicatorProps {
  isRecording: boolean;
  isProcessing: boolean;
  className?: string;
}

export function RecordingIndicator({
  isRecording,
  isProcessing,
  className,
}: RecordingIndicatorProps) {
  if (!isRecording && !isProcessing) return null;

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {isRecording && (
        <>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive" />
          </span>
          <span className="text-destructive font-medium">Recording...</span>
        </>
      )}
      {isProcessing && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-muted-foreground">Transcribing...</span>
        </>
      )}
    </div>
  );
}
