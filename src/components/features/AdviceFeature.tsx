import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, Sparkles, Trash2 } from "lucide-react";
import type { Feature } from "@/lib/agentPageApi";

interface AdviceMessage {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

interface AdviceFeatureProps {
  feature: Feature;
  onDeleteFeature?: () => void;
}

export const AdviceFeature = ({ feature, onDeleteFeature }: AdviceFeatureProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AdviceMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!input.trim() || loading) return;
    
    const question = input.trim();
    setInput("");
    setLoading(true);

    // Simulate AI response (in real implementation, this would call the agent)
    setTimeout(() => {
      const answer = `Based on your question about "${question}", here's some helpful advice: This is a placeholder response. In the full implementation, this would call the ${feature.agentIds[0]?.name || 'Advisor'} agent to provide personalized advice.`;
      
      const newMessage: AdviceMessage = {
        id: Date.now().toString(),
        question,
        answer,
        timestamp: new Date(),
      };
      
      setMessages([...messages, newMessage]);
      setLoading(false);
    }, 1000);
  };

  return (
    <Card className="rounded-2xl bg-card border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{feature.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {feature.agentIds.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {feature.agentIds[0]?.name || 'Advisor'}
              </Badge>
            )}
            {onDeleteFeature && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                onClick={() => {
                  if (!confirm(`Delete feature "${feature.name}"?`)) return;
                  onDeleteFeature();
                }}
                aria-label="Delete feature"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        {feature.description && (
          <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <ScrollArea className="h-[300px] rounded-xl border border-border p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Ask a question below to get personalized advice
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-xl bg-primary text-primary-foreground px-4 py-2">
                      <p className="text-sm">{msg.question}</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-xl bg-secondary border border-border px-4 py-2">
                      <p className="text-sm whitespace-pre-wrap">{msg.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-xl bg-secondary border border-border px-4 py-2">
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="Ask for advice..."
            className="rounded-xl resize-none min-h-[60px]"
            rows={2}
          />
          <Button
            onClick={handleAsk}
            disabled={!input.trim() || loading}
            size="icon"
            className="rounded-xl h-[60px] w-[60px] shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
