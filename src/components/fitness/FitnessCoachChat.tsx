import { useMemo, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { FitnessChatEvent } from "@/lib/fitnessApi";

export interface FitnessChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  events?: FitnessChatEvent[];
}

interface FitnessCoachChatProps {
  messages: FitnessChatMessage[];
  isSubmitting?: boolean;
  onSendMessage: (text: string) => Promise<void>;
}

const examplePrompts = [
  "I ate 3 eggs",
  "I had one scoop whey",
  "I walked 30 minutes",
  "What should I eat post-workout?",
  "How is my deficit today?",
];

function summarizeEvents(events: FitnessChatEvent[] = []) {
  if (!events.length) return null;
  return events.map((event, index) => {
    if (event.type === "meal_log") {
      return (
        <Badge key={`meal-${index}`} variant="outline" className="text-[10px]">
          +{event.calories} cal • {event.protein}g protein
        </Badge>
      );
    }

    return (
      <Badge key={`activity-${index}`} variant="outline" className="text-[10px]">
        -{event.caloriesBurned} cal • {event.durationMinutes} min
      </Badge>
    );
  });
}

export function FitnessCoachChat({
  messages,
  isSubmitting = false,
  onSendMessage,
}: FitnessCoachChatProps) {
  const [input, setInput] = useState("");

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ),
    [messages]
  );

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSubmitting) return;

    setInput("");
    await onSendMessage(text);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
      <div className="border-b border-border bg-gradient-to-r from-primary/10 to-accent/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">AI Fitness Coach</h2>
            <p className="text-xs text-muted-foreground">
              Natural chat + automatic structured tracking
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="mr-1 h-3 w-3" />
            JSON Parser
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {sortedMessages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
            Start chatting. Example: <span className="font-medium">"I ate 3 eggs"</span>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedMessages.map((message) => {
              const isAssistant = message.role === "assistant";
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    !isAssistant && "justify-end"
                  )}
                >
                  <div
                    className={cn(
                      "mt-1 flex h-7 w-7 items-center justify-center rounded-full border",
                      isAssistant ? "border-primary/30 bg-primary/10 text-primary" : "border-accent/30 bg-accent/10 text-accent"
                    )}
                  >
                    {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl border p-3",
                      isAssistant
                        ? "border-primary/20 bg-primary/5 rounded-tl-sm"
                        : "border-accent/20 bg-accent/5 rounded-tr-sm"
                    )}
                  >
                    <p className="text-sm text-foreground">{message.content}</p>
                    {isAssistant && message.events && message.events.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {summarizeEvents(message.events)}
                      </div>
                    )}
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-border/50 bg-secondary/20 px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {examplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              className="flex-shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-foreground"
              type="button"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-background p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            placeholder='e.g. "I ate one bowl of rice" or "I walked 30 minutes"'
            className="min-h-[44px] max-h-[120px] flex-1 resize-none rounded-xl"
            rows={1}
          />
          <Button
            onClick={() => void handleSend()}
            size="icon"
            disabled={!input.trim() || isSubmitting}
            className="flex-shrink-0 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FitnessCoachChat;
