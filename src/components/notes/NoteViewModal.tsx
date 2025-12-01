import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, X, Save, Tag } from "lucide-react";
import { NoteDTO } from "@/hooks/useNotes";
import { useNoteAI } from "@/hooks/useNoteAI";
import { NoteAIActions } from "@/components/notes/NoteAIActions";
import { useToast } from "@/hooks/use-toast";

interface NoteViewModalProps {
  note: NoteDTO | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, payload: Partial<{ title: string; content: string }>) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
  categories: { id: string; label: string }[];
}

export function NoteViewModal({ note, open, onClose, onUpdate, onDelete, categories }: NoteViewModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();
  const { improving, paraphrasing, ttsLoading, playing, improveGrammar, paraphrase, readAloud, stopAudio } = useNoteAI();

  const startEditing = () => {
    if (note) {
      setEditTitle(note.title);
      setEditContent(note.content);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditTitle("");
    setEditContent("");
  };

  const handleSave = async () => {
    if (!note?.id) return;
    setSaving(true);
    try {
      await onUpdate(note.id, { title: editTitle, content: editContent });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update note:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note?.id) return;
    setDeleting(true);
    try {
      await onDelete(note.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete note:", err);
    } finally {
      setDeleting(false);
    }
  };

  const handleImprove = async () => {
    if (!editContent.trim()) {
      toast({ title: "No content", description: "Write something first.", variant: "destructive" });
      return;
    }
    try {
      const improved = await improveGrammar(editContent);
      setEditContent(improved);
      toast({ title: "Grammar improved!", description: "Your text has been enhanced." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to improve grammar.", variant: "destructive" });
    }
  };

  const handleParaphrase = async () => {
    if (!editContent.trim()) {
      toast({ title: "No content", description: "Write something first.", variant: "destructive" });
      return;
    }
    try {
      const paraphrased = await paraphrase(editContent);
      setEditContent(paraphrased);
      toast({ title: "Note paraphrased!", description: "Your text has been rewritten." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to paraphrase.", variant: "destructive" });
    }
  };

  const handleReadAloud = async () => {
    if (!editContent.trim()) {
      toast({ title: "No content", description: "Write something first.", variant: "destructive" });
      return;
    }
    try {
      await readAloud(editContent);
      toast({ title: "Playing audio", description: "Reading your note aloud..." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to play audio.", variant: "destructive" });
    }
  };

  if (!note) return null;

  const created = note.createdAt ? new Date(note.createdAt) : new Date();
  const categoryLabel = categories.find((c) => c.id === note.category)?.label || "General";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-xl font-semibold"
              placeholder="Note title..."
            />
          ) : (
            <DialogTitle className="text-xl">{note.title}</DialogTitle>
          )}
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{categoryLabel}</Badge>
            <span className="text-xs text-muted-foreground">
              {created.toLocaleDateString()} {created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Content */}
          {isEditing ? (
            <>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[200px]"
                placeholder="Note content..."
              />
              <NoteAIActions
                onImprove={handleImprove}
                onParaphrase={handleParaphrase}
                onReadAloud={handleReadAloud}
                onStopAudio={stopAudio}
                improving={improving}
                paraphrasing={paraphrasing}
                ttsLoading={ttsLoading}
                playing={playing}
                disabled={!editContent.trim()}
              />
            </>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-foreground/90">{note.content}</p>
            </div>
          )}

          {/* AI Summary */}
          {note.summary && !isEditing && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs font-medium text-primary mb-1">AI Summary</p>
              <p className="text-sm text-foreground/80">{note.summary}</p>
            </div>
          )}

          {/* Emotion */}
          {note.emotion?.label && !isEditing && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Detected Emotion:</span>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {note.emotion.label} • {(note.emotion.score * 100).toFixed(0)}%
              </Badge>
            </div>
          )}

          {/* Tags */}
          {note.tags?.length > 0 && !isEditing && (
            <div className="flex gap-1 flex-wrap">
              {note.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={saving || !editTitle.trim() || !editContent.trim()}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={cancelEditing}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={startEditing}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Note
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {deleting ? "Deleting..." : "Delete Note"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
