import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "coach";
  content: string;
  timestamp: Date;
  parsed?: {
    type: "meal" | "workout" | "activity" | "feeling" | "general";
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
    caloriesBurned?: number;
    duration?: number;
  };
}

interface FitnessCoachChatProps {
  goal: "fat_loss" | "muscle_gain" | "maintenance";
  onLogMeal?: (data: { calories: number; protein: number; carbs: number; fats: number; description: string }) => void;
  onLogWorkout?: (data: { caloriesBurned: number; duration: number; type: string }) => void;
  onLogActivity?: (data: { caloriesBurned: number; duration: number; type: string }) => void;
}

const examplePrompts = [
  "Breakfast: 2 idlis with sambar and coconut chutney",
  "Did 30 min HIIT workout",
  "Lunch: dal rice with chicken curry",
  "Walked 20 minutes after dinner",
  "Feeling tired today, need recovery advice",
];

// Simulated AI parsing for meals (Indian food aware)
function parseMealInput(input: string): { calories: number; protein: number; carbs: number; fats: number } {
  const lowerInput = input.toLowerCase();
  
  // Indian food estimates
  if (lowerInput.includes("idli") || lowerInput.includes("idly")) {
    const count = parseInt(input.match(/(\d+)/)?.[1] || "2");
    return { calories: count * 60, protein: count * 2, carbs: count * 12, fats: count * 0.5 };
  }
  if (lowerInput.includes("dosa")) {
    const count = parseInt(input.match(/(\d+)/)?.[1] || "1");
    return { calories: count * 150, protein: count * 4, carbs: count * 25, fats: count * 6 };
  }
  if (lowerInput.includes("dal") && lowerInput.includes("rice")) {
    return { calories: 450, protein: 15, carbs: 65, fats: 12 };
  }
  if (lowerInput.includes("chicken curry")) {
    return { calories: 300, protein: 28, carbs: 8, fats: 18 };
  }
  if (lowerInput.includes("roti") || lowerInput.includes("chapati")) {
    const count = parseInt(input.match(/(\d+)/)?.[1] || "2");
    return { calories: count * 80, protein: count * 3, carbs: count * 15, fats: count * 1 };
  }
  if (lowerInput.includes("paneer")) {
    return { calories: 250, protein: 18, carbs: 6, fats: 18 };
  }
  if (lowerInput.includes("biryani")) {
    return { calories: 550, protein: 22, carbs: 70, fats: 18 };
  }
  if (lowerInput.includes("sambar")) {
    return { calories: 120, protein: 6, carbs: 18, fats: 3 };
  }
  if (lowerInput.includes("eggs") || lowerInput.includes("egg")) {
    const count = parseInt(input.match(/(\d+)/)?.[1] || "2");
    return { calories: count * 75, protein: count * 6, carbs: 0, fats: count * 5 };
  }
  if (lowerInput.includes("curd") || lowerInput.includes("yogurt")) {
    return { calories: 100, protein: 8, carbs: 6, fats: 5 };
  }
  
  // Default estimate
  return { calories: 350, protein: 12, carbs: 45, fats: 10 };
}

// Simulated workout parsing
function parseWorkoutInput(input: string): { caloriesBurned: number; duration: number; type: string } {
  const lowerInput = input.toLowerCase();
  const durationMatch = input.match(/(\d+)\s*min/);
  const duration = durationMatch ? parseInt(durationMatch[1]) : 45;
  
  if (lowerInput.includes("hiit") || lowerInput.includes("high intensity")) {
    return { caloriesBurned: duration * 12, duration, type: "HIIT" };
  }
  if (lowerInput.includes("strength") || lowerInput.includes("weight")) {
    return { caloriesBurned: duration * 8, duration, type: "Strength Training" };
  }
  if (lowerInput.includes("chest") || lowerInput.includes("triceps") || lowerInput.includes("biceps")) {
    return { caloriesBurned: duration * 7, duration, type: "Upper Body" };
  }
  if (lowerInput.includes("legs") || lowerInput.includes("squats")) {
    return { caloriesBurned: duration * 9, duration, type: "Lower Body" };
  }
  if (lowerInput.includes("cardio") || lowerInput.includes("running") || lowerInput.includes("run")) {
    return { caloriesBurned: duration * 10, duration, type: "Cardio" };
  }
  if (lowerInput.includes("walk")) {
    return { caloriesBurned: duration * 4, duration, type: "Walking" };
  }
  if (lowerInput.includes("yoga")) {
    return { caloriesBurned: duration * 3, duration, type: "Yoga" };
  }
  
  return { caloriesBurned: duration * 6, duration, type: "Workout" };
}

function generateCoachResponse(input: string, goal: string): { content: string; parsed: Message["parsed"] } {
  const lowerInput = input.toLowerCase();
  
  // Meal detection
  if (lowerInput.includes("breakfast") || lowerInput.includes("lunch") || lowerInput.includes("dinner") || 
      lowerInput.includes("snack") || lowerInput.includes("ate") || lowerInput.includes("had")) {
    const mealData = parseMealInput(input);
    const feedback = [];
    
    if (mealData.protein >= 20) {
      feedback.push("Great protein content! 💪");
    } else {
      feedback.push("Consider adding more protein — maybe some eggs, curd, or dal.");
    }
    
    if (goal === "fat_loss" && mealData.calories > 500) {
      feedback.push("This is a bit calorie-dense for fat loss. Try reducing portion size next time.");
    } else if (goal === "muscle_gain" && mealData.protein < 25) {
      feedback.push("For muscle gain, aim for 25g+ protein per meal.");
    }
    
    return {
      content: `✅ **Logged:** ~${mealData.calories} cal | ${mealData.protein}g protein | ${mealData.carbs}g carbs | ${mealData.fats}g fats

${feedback.join(" ")}

Your daily totals are being updated.`,
      parsed: {
        type: "meal",
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fats: mealData.fats,
      },
    };
  }
  
  // Workout detection
  if (lowerInput.includes("workout") || lowerInput.includes("gym") || lowerInput.includes("exercise") ||
      lowerInput.includes("did") && (lowerInput.includes("chest") || lowerInput.includes("legs") || 
      lowerInput.includes("back") || lowerInput.includes("arms") || lowerInput.includes("hiit"))) {
    const workoutData = parseWorkoutInput(input);
    
    return {
      content: `🏋️ **${workoutData.type} Logged!**

Duration: ${workoutData.duration} minutes
Calories burned: ~${workoutData.caloriesBurned} cal

Great effort! ${goal === "muscle_gain" ? "Make sure to have protein within 30 minutes for optimal recovery." : "This will help maintain your calorie deficit."} 

How was the intensity? Any muscle soreness?`,
      parsed: {
        type: "workout",
        caloriesBurned: workoutData.caloriesBurned,
        duration: workoutData.duration,
      },
    };
  }
  
  // Activity detection
  if (lowerInput.includes("walk") || lowerInput.includes("cycle") || lowerInput.includes("swim") ||
      lowerInput.includes("played") || lowerInput.includes("stairs")) {
    const activityData = parseWorkoutInput(input);
    
    return {
      content: `🚶 **Activity Logged:** ${activityData.type}

Duration: ${activityData.duration} minutes
Calories burned: ~${activityData.caloriesBurned} cal

Every bit of movement counts! ${activityData.type === "Walking" ? "Walking after meals is excellent for digestion and blood sugar control." : "Great active choice!"}`,
      parsed: {
        type: "activity",
        caloriesBurned: activityData.caloriesBurned,
        duration: activityData.duration,
      },
    };
  }
  
  // Feeling/recovery detection
  if (lowerInput.includes("tired") || lowerInput.includes("sore") || lowerInput.includes("exhausted") ||
      lowerInput.includes("pain") || lowerInput.includes("recovery") || lowerInput.includes("rest")) {
    return {
      content: `💤 I hear you. Recovery is just as important as training.

**My recommendations:**
• Prioritize 7-8 hours of sleep tonight
• Stay hydrated (aim for 3L today)
• Consider light stretching or yoga
• Have magnesium-rich foods (bananas, dark chocolate)
• Tomorrow can be a lighter training day

How has your sleep been this week?`,
      parsed: { type: "feeling" },
    };
  }
  
  // General coaching response
  return {
    content: `I'm here to help! You can tell me:

• **Meals:** "Breakfast: 2 parathas with curd"
• **Workouts:** "Did chest and triceps today"
• **Activity:** "Walked 30 minutes"
• **How you feel:** "Feeling tired today"

I'll automatically track everything and give you personalized feedback based on your ${goal.replace("_", " ")} goal!`,
    parsed: { type: "general" },
  };
}

export function FitnessCoachChat({ goal, onLogMeal, onLogWorkout, onLogActivity }: FitnessCoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "coach",
      content: `Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}! 👋

I'm your AI Fitness Coach. Just tell me what you ate or did today in natural language — I'll handle all the tracking.

Try saying something like: "Had 2 dosas for breakfast" or "Did 30 min workout"`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateCoachResponse(input, goal);
      
      const coachMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "coach",
        content: response.content,
        timestamp: new Date(),
        parsed: response.parsed,
      };

      setMessages((prev) => [...prev, coachMessage]);
      setIsTyping(false);

      // Trigger callbacks based on parsed type
      if (response.parsed?.type === "meal" && onLogMeal && response.parsed.calories) {
        onLogMeal({
          calories: response.parsed.calories,
          protein: response.parsed.protein || 0,
          carbs: response.parsed.carbs || 0,
          fats: response.parsed.fats || 0,
          description: input,
        });
      } else if (response.parsed?.type === "workout" && onLogWorkout && response.parsed.caloriesBurned) {
        onLogWorkout({
          caloriesBurned: response.parsed.caloriesBurned,
          duration: response.parsed.duration || 0,
          type: input,
        });
      } else if (response.parsed?.type === "activity" && onLogActivity && response.parsed.caloriesBurned) {
        onLogActivity({
          caloriesBurned: response.parsed.caloriesBurned,
          duration: response.parsed.duration || 0,
          type: input,
        });
      }
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-card" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg text-foreground">Your AI Fitness Coach</h2>
            <p className="text-xs text-muted-foreground">Always here • Tracking everything</p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
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
              <Avatar className={cn(
                "w-8 h-8 flex items-center justify-center flex-shrink-0",
                message.role === "coach" ? "bg-primary/10" : "bg-accent/10"
              )}>
                {message.role === "coach" ? (
                  <Bot className="w-4 h-4 text-primary" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-accent" />
                )}
              </Avatar>
              <div
                className={cn(
                  "max-w-[80%] p-3 rounded-2xl",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-secondary/50 text-foreground rounded-tl-sm"
                )}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <span className="text-xs opacity-60 mt-2 block">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex items-center justify-center bg-primary/10">
                <Bot className="w-4 h-4 text-primary" />
              </Avatar>
              <div className="bg-secondary/50 p-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Example Prompts */}
      <div className="px-4 py-2 border-t border-border/50 bg-secondary/20">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {examplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setInput(prompt)}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-background border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Tell me what you ate or did today..."
            className="flex-1 min-h-[44px] max-h-[120px] resize-none rounded-xl"
            rows={1}
          />
          <Button
            onClick={() => setIsListening(!isListening)}
            size="icon"
            variant="outline"
            className={cn(
              "rounded-xl flex-shrink-0",
              isListening && "bg-destructive/10 border-destructive/50 text-destructive"
            )}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button 
            onClick={handleSend} 
            size="icon" 
            disabled={!input.trim()}
            className="rounded-xl flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FitnessCoachChat;
