import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, Trash2, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import { updateFeatureData, getFeatureData, getFeatureInsights, type Feature } from "@/lib/agentPageApi";
import { toast } from "@/hooks/use-toast";

interface Idea {
  id: string;
  text: string;
  createdAt: Date | string;
}

interface IdeasFeatureProps {
  feature: Feature;
  onDeleteFeature?: () => void;
}

export const IdeasFeature = ({ feature, onDeleteFeature }: IdeasFeatureProps) => {
  const { pageId } = useParams<{ pageId: string }>();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [input, setInput] = useState("");
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
          setIdeas(response.featureData.data);
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
  const saveData = async (newIdeas: Idea[]) => {
    if (!pageId || !feature._id) return;
    
    setSaving(true);
    try {
      await updateFeatureData(pageId, feature._id, newIdeas);
      
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
        description: "Your ideas are saved locally but couldn't sync to server.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    if (!input.trim()) return;
    const newIdea: Idea = {
      id: Date.now().toString(),
      text: input.trim(),
      createdAt: new Date(),
    };
    const newIdeas = [...ideas, newIdea];
    setIdeas(newIdeas);
    setInput("");
    saveData(newIdeas);
  };

  const handleDelete = (id: string) => {
    const newIdeas = ideas.filter(i => i.id !== id);
    setIdeas(newIdeas);
    saveData(newIdeas);
  };

  return (
    <Card className="rounded-2xl bg-card border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{feature.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {feature.agentIds && feature.agentIds.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {feature.agentIds.length} helper{feature.agentIds.length > 1 ? 's' : ''}
              </Badge>
            )}
            {onDeleteFeature && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                onClick={() => {
                  if (!confirm(`Delete feature \"${feature.name}\"?`)) return;
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
        {/* Add Idea Form */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a new idea..."
            className="rounded-xl"
          />
          <Button onClick={handleAdd} size="icon" className="rounded-xl">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Ideas List */}
        {ideas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No ideas yet. Add one above to get started!
          </div>
        ) : (
          <div className="space-y-2">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border hover:border-primary/30 transition-colors"
              >
                <Lightbulb className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="flex-1 text-sm text-foreground">{idea.text}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(idea.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg flex-shrink-0"
                  onClick={() => handleDelete(idea.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* AI Insights */}
        {insights.length > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI Insights</span>
            </div>
            <div className="space-y-1">
              {insights.map((insight, idx) => (
                <div key={idx} className="text-sm text-muted-foreground bg-primary/5 rounded-lg p-2">
                  {insight}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        {ideas.length > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {ideas.length} idea{ideas.length !== 1 ? 's' : ''} captured
              {saving && <span className="ml-2 text-xs">Saving...</span>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
