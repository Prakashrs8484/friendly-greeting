// src/pages/notes/AcademicNotes.tsx
import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AgentChat from "@/components/AgentChat";
import { NoteViewModal } from "@/components/notes/NoteViewModal";
import { NotesSearchBar } from "@/components/notes/NotesSearchBar";
import { NoteCardSkeleton } from "@/components/notes/NoteCardSkeleton";

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
  GraduationCap,
  Plus,
  Calendar,
  FileText,
  Tag,
  AlertCircle,
  Mic,
  MicOff,
  ListTree,
  List,
  CheckSquare,
  Shield,
  GitCompare,
  Loader2,
  BookOpen,
  FlaskConical,
  Languages,
  Briefcase,
} from "lucide-react";

import { useDictation } from "@/hooks/useDictation";
import { RecordingIndicator } from "@/components/notes/RecordingIndicator";
import { useNotes, NoteDTO } from "@/hooks/useNotes";
import { useAdvancedNoteAI } from "@/hooks/useAdvancedNoteAI";
import { CompareTextsModal } from "@/components/notes/modals/CompareTextsModal";

const AcademicNotes = () => {
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

  const { isRecording, isProcessing, isSupported, toggleRecording } = useDictation({
    onTranscription: (text) => {
      setNoteContent((prev) => {
        const newContent = prev.trim() ? `${prev.trim()} ${text.trim()}` : text.trim();
        return newContent;
      });
      toast({ title: "Transcription added" });
    },
    onError: (error) => {
      toast({ title: "Dictation Error", description: error, variant: "destructive" });
    },
  });

  const advancedAI = useAdvancedNoteAI();
  const isLoading = advancedAI.loading !== null;

  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const [selectedNote, setSelectedNote] = useState<NoteDTO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const categories = [
    { id: "all", label: "All", icon: FileText },
    { id: "academic", label: "Academic", icon: GraduationCap },
    { id: "research", label: "Research", icon: FlaskConical },
    { id: "vocabulary", label: "Vocabulary", icon: Languages },
    { id: "interview", label: "Interview Prep", icon: Briefcase },
  ];

  // Handlers
  const handleStructure = async () => {
    if (!noteContent.trim()) {
      toast({ title: "No content", description: "Write something first.", variant: "destructive" });
      return;
    }
    try {
      const result = await advancedAI.structureDocument(noteContent);
      setNoteContent(result);
      toast({ title: "Structured!", description: "Document organized with headings." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleExtractBullets = async () => {
    if (!noteContent.trim()) {
      toast({ title: "No content", description: "Write something first.", variant: "destructive" });
      return;
    }
    try {
      const bullets = await advancedAI.extractBullets(noteContent);
      setNoteContent(bullets.map((b) => `• ${b}`).join("\n"));
      toast({ title: "Bullets extracted!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleExtractActions = async () => {
    if (!noteContent.trim()) {
      toast({ title: "No content", description: "Write something first.", variant: "destructive" });
      return;
    }
    try {
      const actions = await advancedAI.extractActions(noteContent);
      const formatted = actions
        .map((a) => `☐ ${a.action}${a.owner ? ` (@${a.owner})` : ""}${a.deadline ? ` [${a.deadline}]` : ""}`)
        .join("\n");
      setNoteContent(formatted);
      toast({ title: "Action items extracted!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleImproveAcademic = async () => {
    if (!noteContent.trim()) {
      toast({ title: "No content", description: "Write something first.", variant: "destructive" });
      return;
    }
    try {
      const result = await advancedAI.improveAcademic(noteContent);
      setNoteContent(result);
      toast({ title: "Improved!", description: "Academic writing enhanced." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleStrengthen = async () => {
    if (!noteContent.trim()) {
      toast({ title: "No content", description: "Write something first.", variant: "destructive" });
      return;
    }
    try {
      const result = await advancedAI.strengthenArgument(noteContent);
      setNoteContent(result);
      toast({ title: "Strengthened!", description: "Argument has been reinforced." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleCompare = async (textA: string, textB: string) => {
    try {
      const result = await advancedAI.compareTexts(textA, textB);
      const formatted = [
        "## Comparison Results\n",
        "### Differences",
        ...result.differences.map((d) => `- ${d}`),
        "\n### Similarities",
        ...result.similarities.map((s) => `- ${s}`),
        "\n### Suggested Improvements",
        ...result.improvements.map((i) => `- ${i}`),
      ].join("\n");
      setNoteContent(formatted);
      toast({ title: "Comparison complete!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    setSaving(true);
    try {
      await createNote({
        title: noteTitle,
        content: noteContent.trim(),
        category: selectedCategory === "all" ? "academic" : selectedCategory,
        tags: ["academic"],
      });
      setNoteTitle("");
      setNoteContent("");
      toast({ title: "Note saved" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save note.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
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
      ? displayNotes.filter((n) => ["academic", "research", "vocabulary", "interview"].includes(n.category || "") || n.tags?.includes("academic"))
      : displayNotes.filter((note) => note.category === selectedCategory);

  return (
    <DashboardLayout>
      <div className="page-container animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div className="min-w-0 flex-1">
            <h1 className="page-title flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              Academic Hub
            </h1>
            <p className="page-subtitle">
              Research notes, study materials, and interview prep with AI productivity tools
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <BookOpen className="w-4 h-4 mr-1.5" />
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

            {/* Editor */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  New Academic Note
                </CardTitle>
                <CardDescription>Write research notes, study materials, or interview prep</CardDescription>
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
                  placeholder="Write your academic notes, research findings, or study materials..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[250px] resize-none"
                />

                {/* Academic AI Tools */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={handleStructure} disabled={!noteContent.trim() || isLoading} className="text-xs gap-1.5">
                    {advancedAI.loading === "structure" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ListTree className="h-3.5 w-3.5" />}
                    Structure Document
                  </Button>

                  <Button variant="outline" size="sm" onClick={handleExtractBullets} disabled={!noteContent.trim() || isLoading} className="text-xs gap-1.5">
                    {advancedAI.loading === "bullets" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <List className="h-3.5 w-3.5" />}
                    Extract Bullets
                  </Button>

                  <Button variant="outline" size="sm" onClick={handleExtractActions} disabled={!noteContent.trim() || isLoading} className="text-xs gap-1.5">
                    {advancedAI.loading === "actions" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckSquare className="h-3.5 w-3.5" />}
                    Extract Actions
                  </Button>

                  <Button variant="outline" size="sm" onClick={handleImproveAcademic} disabled={!noteContent.trim() || isLoading} className="text-xs gap-1.5">
                    {advancedAI.loading === "academic" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GraduationCap className="h-3.5 w-3.5" />}
                    Academic Improve
                  </Button>

                  <Button variant="outline" size="sm" onClick={handleStrengthen} disabled={!noteContent.trim() || isLoading} className="text-xs gap-1.5">
                    {advancedAI.loading === "strengthen" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
                    Strengthen Argument
                  </Button>

                  <Button variant="outline" size="sm" onClick={() => setCompareModalOpen(true)} disabled={isLoading} className="text-xs gap-1.5">
                    <GitCompare className="h-3.5 w-3.5" />
                    Compare Texts
                  </Button>
                </div>

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
                <CardTitle>Your Academic Notes</CardTitle>
                <CardDescription>Research, study, and prep materials</CardDescription>
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
                    {loading ? (
                      <div className="space-y-3">
                        <NoteCardSkeleton />
                        <NoteCardSkeleton />
                      </div>
                    ) : filteredNotes.length === 0 ? (
                      <div className="text-center py-12">
                        <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No academic notes yet</p>
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
                                      {categories.find((c) => c.id === note.category)?.label || "Academic"}
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

          {/* AI Chat */}
          <div className="workspace-chat-column">
            <div className="sticky top-20">
              <Card className="card-glass h-[calc(100vh-6rem)]">
                <AgentChat
                  agentName="Academic AI"
                  agentIcon={GraduationCap}
                  placeholder="Ask me about research, study tips, or interview prep..."
                  initialMessages={[
                    {
                      role: "agent",
                      content: "Hello! I'm your Academic AI assistant. I can help with research summaries, study strategies, essay improvements, and interview preparation. How can I assist?",
                      timestamp: new Date(),
                    },
                  ]}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CompareTextsModal
        open={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        onCompare={handleCompare}
        noteContent={noteContent}
        loading={advancedAI.loading === "compare"}
      />
      <NoteViewModal
        note={selectedNote}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedNote(null); }}
        onUpdate={handleUpdateNote}
        onDelete={handleDeleteNote}
        categories={categories}
      />
    </DashboardLayout>
  );
};

export default AcademicNotes;
