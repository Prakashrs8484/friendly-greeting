import { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";

interface Message {
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

interface AgentChatProps {
  agentName: string;
  agentIcon: React.ElementType;
  placeholder?: string;
  onSendMessage?: (message: string) => void;
  initialMessages?: Message[];
  financialContext?: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    totalInvested: number;
    currentInvestmentValue: number;
    unrealizedGains: number;
    netWorth: number;
    emergencyFund?: {
      current: number;
      required: number;
      progress: number;
    };
    allocation?: {
      recommended: {
        emergencyFund: number;
        veryShortTerm: number;
        shortMediumTerm: number;
        longTermInvestments: number;
      };
      actual: {
        emergencyFund: number;
        veryShortTerm: number;
        shortMediumTerm: number;
        longTermInvestments: number;
      };
    };
    goals?: {
      veryShortTerm: Array<{ name: string; amount: number; deadline: string }>;
      shortMediumTerm: Array<{ name: string; amount: number; deadline: string }>;
      longTerm: Array<{ name: string; amount: number; deadline: string }>;
    };
  };
}

const AgentChat = ({
  agentName,
  agentIcon: Icon,
  placeholder = "Ask me anything...",
  onSendMessage,
  initialMessages = [],
  financialContext,
}: AgentChatProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Generate contextual AI response
    setTimeout(() => {
      let responseContent = generateContextualResponse(input, financialContext);
      
      const agentResponse: Message = {
        role: "agent",
        content: responseContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, agentResponse]);
      setIsTyping(false);
      onSendMessage?.(input);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-border bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{agentName}</h3>
            <p className="text-xs text-muted-foreground">AI Agent • Always Active</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground">
                Start a conversation with your {agentName}
              </p>
            </div>
          )}

          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="w-8 h-8 flex items-center justify-center bg-primary/10">
                {message.role === "agent" ? (
                  <Icon className="w-4 h-4 text-primary" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-accent" />
                )}
              </Avatar>
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/50 text-foreground"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex items-center justify-center bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </Avatar>
              <div className="bg-secondary/50 p-3 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-100" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder={placeholder}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon" disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate contextual responses
const generateContextualResponse = (
  query: string, 
  context?: AgentChatProps['financialContext']
): string => {
  const lowerQuery = query.toLowerCase();
  
  if (!context) {
    return `I've received your request: "${query}". I'm processing this and will update your workspace with personalized insights shortly.`;
  }
  
  // Net worth queries
  if (lowerQuery.includes('net worth') || lowerQuery.includes('total wealth')) {
    return `Your total net worth is ₹${(context.netWorth / 1000).toFixed(1)}K, which includes ₹${(context.netSavings / 1000).toFixed(1)}K in savings and ₹${(context.currentInvestmentValue / 1000).toFixed(1)}K in investments. ${context.unrealizedGains > 0 ? `Your investments have gained ₹${(context.unrealizedGains / 1000).toFixed(1)}K in unrealized returns.` : ''}`;
  }
  
  // Investment queries
  if (lowerQuery.includes('investment') || lowerQuery.includes('portfolio')) {
    const returnPercent = ((context.unrealizedGains / context.totalInvested) * 100).toFixed(2);
    return `Your investment portfolio stands at ₹${(context.currentInvestmentValue / 1000).toFixed(1)}K with a total invested amount of ₹${(context.totalInvested / 1000).toFixed(1)}K. You've earned ₹${(context.unrealizedGains / 1000).toFixed(1)}K in unrealized gains (${returnPercent}% returns). Keep tracking your investments for optimal growth!`;
  }
  
  // Spending vs investing balance
  if (lowerQuery.includes('spending') && lowerQuery.includes('invest')) {
    const investmentRatio = (context.totalInvested / context.totalIncome) * 100;
    const expenseRatio = (context.totalExpenses / context.totalIncome) * 100;
    return `Your monthly expenses are ₹${(context.totalExpenses / 1000).toFixed(1)}K (${expenseRatio.toFixed(1)}% of income) while your total investments are ₹${(context.totalInvested / 1000).toFixed(1)}K. You're saving ₹${(context.netSavings / 1000).toFixed(1)}K per month. ${context.netSavings > context.totalExpenses * 0.3 ? 'Great job maintaining a healthy savings rate!' : 'Consider increasing your savings rate for better financial health.'}`;
  }
  
  // Savings queries
  if (lowerQuery.includes('saving') || lowerQuery.includes('save')) {
    const savingsRate = (context.netSavings / context.totalIncome) * 100;
    return `You're saving ₹${(context.netSavings / 1000).toFixed(1)}K per month, which is ${savingsRate.toFixed(1)}% of your income. Your total income is ₹${(context.totalIncome / 1000).toFixed(1)}K and expenses are ₹${(context.totalExpenses / 1000).toFixed(1)}K. ${savingsRate > 30 ? 'Excellent savings rate!' : 'Try to increase your savings rate to 30% or more for better financial security.'}`;
  }
  
  // Expense queries
  if (lowerQuery.includes('expense') || lowerQuery.includes('spending')) {
    return `Your total monthly expenses are ₹${(context.totalExpenses / 1000).toFixed(1)}K out of ₹${(context.totalIncome / 1000).toFixed(1)}K income, leaving you with ₹${(context.netSavings / 1000).toFixed(1)}K in savings. Check the expense breakdown to identify areas where you can optimize spending.`;
  }
  
  // Asset allocation
  if (lowerQuery.includes('allocation') || lowerQuery.includes('diversi')) {
    return `Your investment portfolio is allocated across multiple asset classes with a current value of ₹${(context.currentInvestmentValue / 1000).toFixed(1)}K. Review your portfolio distribution in the Investment Analytics section to ensure proper diversification based on your risk profile.`;
  }
  
  // Financial health
  if (lowerQuery.includes('health') || lowerQuery.includes('status')) {
    const healthScore = context.netSavings > 0 && context.unrealizedGains > 0 ? 'excellent' : context.netSavings > 0 ? 'good' : 'needs improvement';
    return `Your financial health is ${healthScore}. Income: ₹${(context.totalIncome / 1000).toFixed(1)}K, Expenses: ₹${(context.totalExpenses / 1000).toFixed(1)}K, Savings: ₹${(context.netSavings / 1000).toFixed(1)}K, Investments: ₹${(context.currentInvestmentValue / 1000).toFixed(1)}K. Net Worth: ₹${(context.netWorth / 1000).toFixed(1)}K. ${context.unrealizedGains > 0 ? 'Your investments are performing well!' : ''}`;
  }
  
  // Default response
  return `Based on your current financial data: Income ₹${(context.totalIncome / 1000).toFixed(1)}K, Expenses ₹${(context.totalExpenses / 1000).toFixed(1)}K, Savings ₹${(context.netSavings / 1000).toFixed(1)}K, Investments ₹${(context.currentInvestmentValue / 1000).toFixed(1)}K. Ask me about your net worth, investment performance, savings rate, or spending patterns!`;
};

export default AgentChat;
