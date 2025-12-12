// src/components/notes/AgentChatDrawer.tsx
import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Loader2, Mic, MicOff, Copy, ArrowDownToLine, Replace } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { agentQueryApi } from "@/lib/agentApi";
import { useDictation } from "@/hooks/useDictation";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

interface AgentChatDrawerProps {
  open: boolean;
  onClose: () => void;
  onInsertToNote?: (text: string) => void;
  onReplaceNote?: (text: string) => void;
}

export function AgentChatDrawer({ open, onClose, onInsertToNote, onReplaceNote }: AgentChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      content: "Hello! I'm your NeuraNotes AI assistant. I can help you with your writing, answer questions about your notes, and remember your style. What would you like to work on?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice input
  const { isRecording, isProcessing, isSupported, toggleRecording } = useDictation({
    onTranscription: (text) => {
      setInput((prev) => (prev ? `${prev} ${text}` : text));
      toast({ title: "Voice input added" });
    },
    onError: (error) => {
      toast({ title: "Voice Error", description: error, variant: "destructive" });
    },
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when drawer opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSend = async () => {
    const query = input.trim();
    if (!query || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await agentQueryApi(query, 5);
      
      const agentMessage: Message = {
        id: `agent-${Date.now()}`,
        role: "agent",
        content: response.reply || "I couldn't process that request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "agent",
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleInsert = (text: string) => {
    if (onInsertToNote) {
      onInsertToNote(text);
      toast({ title: "Inserted into note" });
    }
  };

  const handleReplace = (text: string) => {
    if (onReplaceNote) {
      onReplaceNote(text);
      toast({ title: "Note content replaced" });
    }
  };

  return (
    <>

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[400px] z-50",
          "bg-card border-l border-border",
          "shadow-2xl shadow-black/10",
          "transform transition-transform duration-300 ease-out",
          "flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">NeuraNotes AI</h3>
              <p className="text-xs text-muted-foreground">Your writing assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    message.role === "agent"
                      ? "bg-primary/10"
                      : "bg-secondary"
                  )}
                >
                  {message.role === "agent" ? (
                    <Bot className="w-4 h-4 text-primary" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-primary" />
                  )}
                </div>
                <div className="max-w-[80%] space-y-1">
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary/50 text-foreground rounded-bl-md"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-[10px] opacity-60 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  
                  {/* Action buttons for agent messages */}
                  {message.role === "agent" && message.id !== "welcome" && (
                    <div className="flex gap-1 pl-1 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => handleCopy(message.content)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                      {onInsertToNote && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-primary"
                          onClick={() => handleInsert(message.content)}
                        >
                          <ArrowDownToLine className="w-3 h-3 mr-1" />
                          Insert
                        </Button>
                      )}
                      {onReplaceNote && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => handleReplace(message.content)}
                        >
                          <Replace className="w-3 h-3 mr-1" />
                          Replace
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary/50 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                    <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border bg-background/50">
          <div className="flex gap-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={toggleRecording}
              disabled={!isSupported || isProcessing || isTyping}
              className="shrink-0"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isRecording ? "Listening..." : "Ask anything..."}
              className="flex-1 bg-background"
              disabled={isTyping || isRecording}
            />
            <Button
              onClick={handleSend}
              size="icon"
              disabled={!input.trim() || isTyping}
              className="shrink-0"
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          {isRecording && (
            <p className="text-xs text-destructive mt-2 text-center animate-pulse">
              🔴 Recording... Tap mic to stop
            </p>
          )}
          {!isRecording && (
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              AI remembers your writing style • Use mic for voice input
            </p>
          )}
        </div>
      </div>
    </>
  );
}
