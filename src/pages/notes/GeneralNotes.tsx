// src/pages/notes/GeneralNotes.tsx
import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { NoteViewModal } from "@/components/notes/NoteViewModal";
import { NotesSearchBar } from "@/components/notes/NotesSearchBar";
import { NoteCardSkeleton } from "@/components/notes/NoteCardSkeleton";
import { NoteAIActions } from "@/components/notes/NoteAIActions";
import { FloatingAssistantButton } from "@/components/notes/FloatingAssistantButton";
import { AgentChatDrawer } from "@/components/notes/AgentChatDrawer";
import { useLiveDraftSync } from "@/hooks/useLiveDraftSync";
import { useAdvancedNoteAI } from "@/hooks/useAdvancedNoteAI";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

import {
  BookOpen,
  Lock,
  Unlock,
  Plus,
  TrendingUp,
  Calendar,
  Lightbulb,
  FileText,
  Tag,
  AlertCircle,
  Mic,
  MicOff,
  StickyNote,
} from "lucide-react";

import { useDictation } from "@/hooks/useDictation";
import { RecordingIndicator } from "@/components/notes/RecordingIndicator";
import { useNotes, NoteDTO } from "@/hooks/useNotes";
import { useNoteAI } from "@/hooks/useNoteAI";

const GeneralNotes = () => {
  const [diaryLocked, setDiaryLocked] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    removeNote,
    searchNotes,
    searchResults,
    searching,
    clearSearch,
  } = useNotes();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Live draft sync to agent memory
  useLiveDraftSync(noteContent, { enabled: noteContent.length > 10 });

  const { isRecording, isProcessing, isSupported, toggleRecording } = useDictation({
    onTranscription: (text) => {
      setNoteContent((prev) => {
        const newContent = prev.trim() ? `${prev.trim()} ${text.trim()}` : text.trim();
        return newContent;
      });
      toast({ title: "Transcription added", description: "Speech converted to text." });
    },
    onError: (error) => {
      toast({ title: "Dictation Error", description: error, variant: "destructive" });
    },
  });

  const {
    improving,
    paraphrasing,
    ttsLoading,
    playing,
    improveGrammar,
    paraphrase,
    readAloud,
    stopAudio,
  } = useNoteAI();

  const advancedAI = useAdvancedNoteAI();

  const handleImproveGrammar = async () => {
    if (!noteContent.trim()) {
      toast({ title: "No content", description: "Write something first.", variant: "destructive" });
      return;
    }
    try {
      const improved = await improveGrammar(noteContent);
      setNoteContent(improved);
      toast({ title: "Grammar improved!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleParaphrase = async () => {
    if (!noteContent.trim()) {
      toast({ title: "No content", description: "Write something first.", variant: "destructive" });
      return;
    }
    try {
      const result = await paraphrase(noteContent);
      setNoteContent(result);
      toast({ title: "Note paraphrased!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleReadAloud = async () => {
    if (!noteContent.trim()) {
      toast({ title: "No content", description: "Write something first.", variant: "destructive" });
      return;
    }
    try {
      toast({ title: "Playing audio…" });
      await readAloud(noteContent);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const [selectedNote, setSelectedNote] = useState<NoteDTO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const categories = [
    { id: "all", label: "All Notes", icon: FileText },
    { id: "diary", label: "Personal Diary", icon: Lock },
    { id: "daily-learnings", label: "Daily Learnings", icon: Calendar },
    { id: "ideas", label: "Ideas", icon: Lightbulb },
    { id: "general", label: "General", icon: StickyNote },
  ];

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;
    setSaving(true);
    try {
      // Auto-generate title if empty
      let finalTitle = noteTitle.trim();
      if (!finalTitle) {
        try {
          finalTitle = await advancedAI.generateTitle(noteContent);
        } catch {
          finalTitle = `Note ${new Date().toLocaleDateString()}`;
        }
      }

      // Auto-generate tags
      let finalTags: string[] = [];
      try {
        finalTags = await advancedAI.generateTags(noteContent);
      } catch {
        finalTags = [];
      }

      await createNote({
        title: finalTitle,
        content: noteContent.trim(),
        category: selectedCategory === "all" ? "general" : selectedCategory,
        tags: finalTags,
      });
      setNoteTitle("");
      setNoteContent("");
      toast({ title: "Note saved", description: finalTags.length ? `Tags: ${finalTags.join(", ")}` : undefined });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save note.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleInsertFromChat = (text: string) => {
    setNoteContent((prev) => (prev.trim() ? `${prev.trim()}\n\n${text}` : text));
  };

  const handleReplaceFromChat = (text: string) => {
    setNoteContent(text);
  };

  const handleNoteClick = (note: NoteDTO) => {
    setSelectedNote(note);
    setModalOpen(true);
  };

  const handleUpdateNote = async (id: string, payload: Partial<{ title: string; content: string }>) => {
    const updated = await updateNote(id, payload);
    setSelectedNote((prev) => (prev ? { ...prev, ...updated, id: updated._id || updated.id } : null));
    toast({ title: "Note updated" });
    return updated;
  };

  const handleDeleteNote = async (id: string) => {
    await removeNote(id);
    toast({ title: "Note deleted" });
  };

  const displayNotes = searchResults !== null ? searchResults : notes;
  const filteredNotes =
    selectedCategory === "all"
      ? displayNotes.filter((n) => !["creative", "story", "poetry", "script", "academic", "research", "vocabulary", "interview"].includes(n.category || ""))
      : displayNotes.filter((note) => note.category === selectedCategory);

  return (
    <DashboardLayout>
      <div className="page-container animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div className="min-w-0 flex-1">
            <h1 className="page-title flex items-center gap-3">
              <StickyNote className="w-8 h-8 text-primary" />
              General Notes
            </h1>
            <p className="page-subtitle">
              Quick notes, daily learnings, and personal diary
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Calendar className="w-4 h-4 mr-1.5" />
            {filteredNotes.length} Notes
          </Badge>
        </div>

        <div className="workspace-grid">
          <div className="workspace-content-column">
            {/* Search */}
            <NotesSearchBar
              onSearch={searchNotes}
              onClear={clearSearch}
              searching={searching}
              hasResults={searchResults !== null}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="card-hover card-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{notes.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Across all categories</p>
                </CardContent>
              </Card>
              <Card className="card-hover card-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Writing Streak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7 days</div>
                  <p className="text-xs text-muted-foreground mt-1">Keep it up!</p>
                </CardContent>
              </Card>
              <Card className="card-hover card-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground mt-1">New entries</p>
                </CardContent>
              </Card>
            </div>

            {/* Editor */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Quick Note
                </CardTitle>
                <CardDescription>Jot down your thoughts, ideas, or reflections</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Note title..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="text-lg font-semibold flex-1"
                  />
                  <Button
                    type="button"
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    onClick={toggleRecording}
                    disabled={!isSupported || isProcessing}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>

                <RecordingIndicator isRecording={isRecording} isProcessing={isProcessing} />

                <Textarea
                  ref={textareaRef}
                  placeholder="Start writing..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                />

                {/* Basic AI Actions */}
                <NoteAIActions
                  onImprove={handleImproveGrammar}
                  onParaphrase={handleParaphrase}
                  onReadAloud={handleReadAloud}
                  onStopAudio={stopAudio}
                  improving={improving}
                  paraphrasing={paraphrasing}
                  ttsLoading={ttsLoading}
                  playing={playing}
                  disabled={!noteContent.trim() || isRecording || isProcessing}
                />

                <div className="flex items-center gap-2">
                  <Button onClick={handleSaveNote} disabled={!noteTitle.trim() || !noteContent.trim() || saving || isRecording} className="action-button">
                    {saving ? "Saving..." : "Save Note"}
                  </Button>
                  <Button variant="outline" onClick={() => { setNoteTitle(""); setNoteContent(""); }} className="action-button">
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Error */}
            {error && (
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="flex items-center gap-3 py-4">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <p className="text-sm text-destructive">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Notes List */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle>Your Notes</CardTitle>
                <CardDescription>Organized by category</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                  <ScrollArea className="w-full">
                    <TabsList className="inline-flex w-full min-w-max">
                      {categories.map((cat) => (
                        <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                          <cat.icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{cat.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </ScrollArea>

                  <TabsContent value={selectedCategory} className="mt-4 space-y-3">
                    {selectedCategory === "diary" && diaryLocked ? (
                      <div className="text-center py-12">
                        <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Private Diary Locked</h3>
                        <Button onClick={() => setDiaryLocked(false)} variant="outline">
                          <Unlock className="w-4 h-4 mr-2" />
                          Unlock Diary
                        </Button>
                      </div>
                    ) : loading ? (
                      <div className="space-y-3">
                        <NoteCardSkeleton />
                        <NoteCardSkeleton />
                      </div>
                    ) : filteredNotes.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No notes yet</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-3 pr-4">
                          {filteredNotes.map((note) => {
                            const created = note.createdAt ? new Date(note.createdAt) : new Date();
                            return (
                              <Card key={note.id} className="card-hover cursor-pointer" onClick={() => handleNoteClick(note)}>
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-base">{note.title}</CardTitle>
                                    <Badge variant="outline" className="text-xs">
                                      {categories.find((c) => c.id === note.category)?.label || "General"}
                                    </Badge>
                                  </div>
                                  <CardDescription className="text-xs">
                                    {created.toLocaleDateString()} {created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-foreground/80 line-clamp-3">{note.content}</p>
                                  {note.tags?.length > 0 && (
                                    <div className="flex gap-1 mt-3">
                                      {note.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          <Tag className="w-3 h-3 mr-1" />
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      <NoteViewModal
        note={selectedNote}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedNote(null); }}
        onUpdate={handleUpdateNote}
        onDelete={handleDeleteNote}
        categories={categories}
      />

      {/* Floating AI Assistant */}
      <FloatingAssistantButton onClick={() => setChatOpen(true)} />
      <AgentChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} onInsertToNote={handleInsertFromChat} onReplaceNote={handleReplaceFromChat} />
    </DashboardLayout>
  );
};

export default GeneralNotes;
