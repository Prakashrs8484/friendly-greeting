import { cn } from "@/lib/utils";

interface RecordingIndicatorProps {
  className?: string;
}

export function RecordingIndicator({ className }: RecordingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
      </span>
      <span className="text-sm text-destructive font-medium">Recording…</span>
    </div>
  );
}
