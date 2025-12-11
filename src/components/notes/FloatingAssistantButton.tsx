// src/components/notes/FloatingAssistantButton.tsx
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface FloatingAssistantButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
}

export function FloatingAssistantButton({ onClick, hasUnread }: FloatingAssistantButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-14 h-14 rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-lg shadow-primary/25",
        "flex items-center justify-center",
        "transition-all duration-300 ease-out",
        "hover:scale-110 hover:shadow-xl hover:shadow-primary/30",
        "active:scale-95",
        "animate-float"
      )}
      aria-label="Open AI Assistant"
    >
      <Bot className="w-6 h-6" />
      {hasUnread && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full animate-pulse" />
      )}
    </button>
  );
}
