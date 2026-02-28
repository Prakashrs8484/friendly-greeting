import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Trash2, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import { updateFeatureData, getFeatureData, getFeatureInsights, type Feature } from "@/lib/agentPageApi";
import { toast } from "@/hooks/use-toast";

interface ResearchTopic {
  id: string;
  title: string;
  status: "active" | "completed" | "on-hold";
  createdAt: Date | string;
}

interface ResearchTrackerFeatureProps {
  feature: Feature;
  onDeleteFeature?: () => void;
}

export const ResearchTrackerFeature = ({ feature, onDeleteFeature }: ResearchTrackerFeatureProps) => {
  const { pageId } = useParams<{ pageId: string }>();
  const [topics, setTopics] = useState<ResearchTopic[]>([]);
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
          setTopics(response.featureData.data);
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
  const saveData = async (newTopics: ResearchTopic[]) => {
    if (!pageId || !feature._id) return;
    
    setSaving(true);
    try {
      await updateFeatureData(pageId, feature._id, newTopics);
      
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
        description: "Your research topics are saved locally but couldn't sync to server.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    if (!input.trim()) return;
    const newTopic: ResearchTopic = {
      id: Date.now().toString(),
      title: input.trim(),
      status: "active",
      createdAt: new Date(),
    };
    const newTopics = [...topics, newTopic];
    setTopics(newTopics);
    setInput("");
    saveData(newTopics);
  };

  const handleStatusChange = (id: string, status: ResearchTopic["status"]) => {
    const newTopics = topics.map(t => t.id === id ? { ...t, status } : t);
    setTopics(newTopics);
    saveData(newTopics);
  };

  const handleDelete = (id: string) => {
    const newTopics = topics.filter(t => t.id !== id);
    setTopics(newTopics);
    saveData(newTopics);
  };

  const getStatusColor = (status: ResearchTopic["status"]) => {
    switch (status) {
      case "active":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "on-hold":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    }
  };

  const activeCount = topics.filter(t => t.status === "active").length;
  const completedCount = topics.filter(t => t.status === "completed").length;

  return (
    <Card className="rounded-2xl bg-card border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
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
        {/* Add Topic Form */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a research topic..."
            className="rounded-xl"
          />
          <Button onClick={handleAdd} size="icon" className="rounded-xl">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Topics List */}
        {topics.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No research topics yet. Add one above to get started!
          </div>
        ) : (
          <div className="space-y-2">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border hover:border-primary/30 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="flex-1 text-sm text-foreground font-medium">{topic.title}</span>
                <Select
                  value={topic.status}
                  onValueChange={(value) => handleStatusChange(topic.id, value as ResearchTopic["status"])}
                >
                  <SelectTrigger className={`w-[120px] h-8 rounded-lg border ${getStatusColor(topic.status)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg flex-shrink-0"
                  onClick={() => handleDelete(topic.id)}
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
        {topics.length > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                {topics.length} topic{topics.length !== 1 ? 's' : ''} total
                {saving && <span className="ml-2 text-xs">Saving...</span>}
              </div>
              <div className="flex gap-3">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                  {activeCount} active
                </Badge>
                <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                  {completedCount} completed
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
