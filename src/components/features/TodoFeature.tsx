import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Trash2, Edit2, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import { updateFeatureData, getFeatureData, getFeatureInsights, type Feature } from "@/lib/agentPageApi";
import { toast } from "@/hooks/use-toast";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date | string;
}

interface TodoFeatureProps {
  feature: Feature;
  onDeleteFeature?: () => void;
}

export const TodoFeature = ({ feature, onDeleteFeature }: TodoFeatureProps) => {
  const { pageId } = useParams<{ pageId: string }>();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [input, setInput] = useState("");
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load feature data on mount
  useEffect(() => {
    if (!pageId || !feature._id) return;
    
    const loadData = async () => {
      try {
        const response = await getFeatureData(pageId, feature._id);
        if (response.featureData?.data && Array.isArray(response.featureData.data)) {
          setTodos(response.featureData.data);
        }
        
        // Load AI insights
        try {
          const insightsResponse = await getFeatureInsights(pageId, feature._id);
          if (insightsResponse.insights) {
            setInsights(Array.isArray(insightsResponse.insights) ? insightsResponse.insights : []);
          }
        } catch (err) {
          // Insights are optional
        }
      } catch (err) {
        console.error("Failed to load feature data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [pageId, feature._id]);

  // Save data to backend
  const saveData = async (newTodos: TodoItem[]) => {
    if (!pageId || !feature._id) return;
    
    setSaving(true);
    try {
      await updateFeatureData(pageId, feature._id, newTodos);
      
      // Refresh insights after saving
      try {
        const insightsResponse = await getFeatureInsights(pageId, feature._id);
        if (insightsResponse.insights) {
          setInsights(Array.isArray(insightsResponse.insights) ? insightsResponse.insights : []);
        }
      } catch (err) {
        // Insights are optional
      }
    } catch (err: any) {
      console.error("Failed to save feature data:", err);
      toast({
        title: "Failed to save",
        description: "Your todos are saved locally but couldn't sync to server.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    if (!input.trim()) return;
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text: input.trim(),
      completed: false,
      createdAt: new Date(),
    };
    const newTodos = [...todos, newTodo];
    setTodos(newTodos);
    setInput("");
    saveData(newTodos);
  };

  const handleToggle = (id: string) => {
    const newTodos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTodos(newTodos);
    saveData(newTodos);
  };

  const handleDelete = (id: string) => {
    const newTodos = todos.filter(t => t.id !== id);
    setTodos(newTodos);
    saveData(newTodos);
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  return (
    <Card className="rounded-2xl bg-card border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{feature.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {feature.agentIds.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {feature.agentIds.length} agent{feature.agentIds.length > 1 ? 's' : ''}
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
        {/* Add Todo Form */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a new task..."
            className="rounded-xl"
          />
          <Button onClick={handleAdd} size="icon" className="rounded-xl">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Todo List */}
        {todos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tasks yet. Add one above to get started!
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border hover:border-primary/30 transition-colors"
              >
                <button
                  onClick={() => handleToggle(todo.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? "bg-primary border-primary"
                      : "border-muted-foreground/50"
                  }`}
                >
                  {todo.completed && <CheckSquare className="w-3 h-3 text-primary-foreground" />}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    todo.completed
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                >
                  {todo.text}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => handleDelete(todo.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats and Insights */}
        {totalCount > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">
                {completedCount} of {totalCount} completed
              </div>
              {feature.uiConfig.actions.includes('insights') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInsights(!showInsights)}
                  className="rounded-lg gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Insights
                </Button>
              )}
            </div>
            {showInsights && (
              <div className="mt-3 space-y-2">
                {insights.length > 0 ? (
                  insights.map((insight, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="text-sm text-muted-foreground">
                        💡 {insight}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      💡 Productivity tip: You're making great progress! Keep up the momentum.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
