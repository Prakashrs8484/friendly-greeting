import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Trash2, Sparkles } from "lucide-react";
import { useParams } from "react-router-dom";
import { updateFeatureData, getFeatureData, getFeatureInsights, type Feature } from "@/lib/agentPageApi";
import { toast } from "@/hooks/use-toast";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date | string;
}

interface NotesFeatureProps {
  feature: Feature;
  onDeleteFeature?: () => void;
}

export const NotesFeature = ({ feature, onDeleteFeature }: NotesFeatureProps) => {
  const { pageId } = useParams<{ pageId: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
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
          setNotes(response.featureData.data);
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
  const saveData = async (newNotes: Note[]) => {
    if (!pageId || !feature._id) return;
    
    setSaving(true);
    try {
      await updateFeatureData(pageId, feature._id, newNotes);
      
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
        description: "Your notes are saved locally but couldn't sync to server.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    const newNote: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date(),
    };
    const newNotes = [...notes, newNote];
    setNotes(newNotes);
    setTitle("");
    setContent("");
    setSelectedNote(newNote);
    setIsEditing(false);
    saveData(newNotes);
  };

  const handleSelect = (note: Note) => {
    setSelectedNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsEditing(true);
  };

  const handleUpdate = () => {
    if (!selectedNote || !title.trim()) return;
    const newNotes = notes.map(n => n.id === selectedNote.id ? { ...n, title: title.trim(), content: content.trim() } : n);
    setNotes(newNotes);
    setIsEditing(false);
    saveData(newNotes);
  };

  const handleDelete = (id: string) => {
    const newNotes = notes.filter(n => n.id !== id);
    setNotes(newNotes);
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setTitle("");
      setContent("");
      setIsEditing(false);
    }
    saveData(newNotes);
  };

  const handleNew = () => {
    setSelectedNote(null);
    setTitle("");
    setContent("");
    setIsEditing(false);
  };

  return (
    <Card className="rounded-2xl bg-card border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
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
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-4">
          {/* Notes List */}
          <div className="space-y-2">
            <Button onClick={handleNew} className="w-full rounded-xl gap-2" variant="outline">
              <Plus className="w-4 h-4" />
              New Note
            </Button>
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {notes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No notes yet
                </div>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleSelect(note)}
                    className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                      selectedNote?.id === note.id
                        ? "bg-primary/10 border-primary/30"
                        : "bg-secondary border-border hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{note.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {note.content || "No content"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-lg flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(note.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="rounded-xl"
              />
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                className="rounded-xl min-h-[200px] resize-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleUpdate} className="rounded-xl">
                      Save
                    </Button>
                    <Button onClick={handleNew} variant="outline" className="rounded-xl">
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleCreate} className="rounded-xl gap-2">
                    <Plus className="w-4 h-4" />
                    Create Note
                  </Button>
                )}
              </div>
              {feature.uiConfig.actions.includes('summarize') && notes.length > 0 && (
                <Button variant="outline" size="sm" className="rounded-lg gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Summarize
                </Button>
              )}
              {saving && (
                <span className="text-xs text-muted-foreground">Saving...</span>
              )}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {insights.length > 0 && (
          <div className="pt-4 border-t border-border mt-4">
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
      </CardContent>
    </Card>
  );
};
