// src/pages/notes/WriterNotes.tsx
import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { NoteViewModal } from "@/components/notes/NoteViewModal";
import { NotesSearchBar } from "@/components/notes/NotesSearchBar";
import { NoteCardSkeleton } from "@/components/notes/NoteCardSkeleton";
import { FloatingAssistantButton } from "@/components/notes/FloatingAssistantButton";
import { AgentChatDrawer } from "@/components/notes/AgentChatDrawer";
import { useLiveDraftSync } from "@/hooks/useLiveDraftSync";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

import {
  PenTool,
  Plus,
  Calendar,
  FileText,
  Tag,
  AlertCircle,
  Mic,
  MicOff,
  Sparkles,
  Expand,
  MapPin,
  User,
  MessageSquare,
  Lightbulb,
  Loader2,
  ChevronDown,
  Feather,
} from "lucide-react";

import { useDictation } from "@/hooks/useDictation";
import { RecordingIndicator } from "@/components/notes/RecordingIndicator";
import { useNotes, NoteDTO } from "@/hooks/useNotes";
import { useAdvancedNoteAI } from "@/hooks/useAdvancedNoteAI";
import { RewriteMode, DialogueStyle, IdeaMode } from "@/lib/noteAiApi";

import { SceneBuilderModal } from "@/components/notes/modals/SceneBuilderModal";
import { CharacterBuilderModal } from "@/components/notes/modals/CharacterBuilderModal";
import { IdeaGeneratorModal } from "@/components/notes/modals/IdeaGeneratorModal";

const REWRITE_MODES: { value: RewriteMode; label: string }[] = [
  { value: "poetic", label: "Poetic" },
  { value: "cinematic", label: "Cinematic" },
  { value: "professional", label: "Professional" },
  { value: "humorous", label: "Humorous" },
  { value: "emotional", label: "Emotional" },
  { value: "minimalist", label: "Minimalist" },
  { value: "dramatic", label: "Dramatic" },
  { value: "shakespearean", label: "Shakespearean" },
  { value: "simple", label: "Simple" },
  { value: "expanded", label: "Expanded" },
];

const DIALOGUE_STYLES: { value: DialogueStyle; label: string }[] = [
  { value: "natural", label: "Natural" },
  { value: "emotional", label: "Emotional" },
  { value: "romantic", label: "Romantic" },
  { value: "dramatic", label: "Dramatic" },
  { value: "comedic", label: "Comedic" },
  { value: "formal", label: "Formal" },
  { value: "aggressive", label: "Aggressive" },
  { value: "mysterious", label: "Mysterious" },
];

const WriterNotes = () => {
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
      toast({ title: "Transcription added", description: "Your speech has been converted to text." });
    },
    onError: (error) => {
      toast({ title: "Dictation Error", description: error, variant: "destructive" });
    },
  });

  const advancedAI = useAdvancedNoteAI();
  const isLoading = advancedAI.loading !== null;

  // Modals
  const [sceneModalOpen, setSceneModalOpen] = useState(false);
  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);

  // Modal state
  const [selectedNote, setSelectedNote] = useState<NoteDTO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const categories = [
    { id: "story", label: "Stories", icon: Feather },
    { id: "poetry", label: "Poetry", icon: PenTool },
    { id: "script", label: "Scripts", icon: FileText },
    { id: "creative", label: "Creative", icon: Sparkles },
  ];

  // Handlers
  const handleRewrite = async (mode: RewriteMode) => {
    if (!noteContent.trim()) {
      toast({ title: "No content", description: "Write something first.", variant: "destructive" });
      return;
    }
    try {
      const result = await advancedAI.rewriteNote(noteContent, mode);
      setNoteContent(result);
      toast({ title: "Rewritten!", description: `Text rewritten in ${mode} style.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleExpand = async () => {
    if (!noteContent.trim()) {
      toast({ title: "No content", description: "Write something first.", variant: "destructive" });
      return;
    }
    try {
      const result = await advancedAI.expandThought(noteContent);
      setNoteContent(result);
      toast({ title: "Expanded!", description: "Your thought has been expanded." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleEnhanceDialogue = async (style: DialogueStyle) => {
    if (!noteContent.trim()) {
      toast({ title: "No content", description: "Write something first.", variant: "destructive" });
      return;
    }
    try {
      const result = await advancedAI.enhanceDialogue(noteContent, style);
      setNoteContent(result);
      toast({ title: "Enhanced!", description: `Dialogue enhanced with ${style} style.` });
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
        category: "creative",
        tags: ["writer"],
      });
      setNoteTitle("");
      setNoteContent("");
      toast({ title: "Note saved", description: "Your creative work has been saved." });
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
  const filteredNotes = displayNotes.filter(
    (note) => note.category === "creative" || note.category === "story" || note.category === "poetry" || note.category === "script" || note.tags?.includes("writer")
  );

  return (
    <DashboardLayout>
      <div className="page-container animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div className="min-w-0 flex-1">
            <h1 className="page-title flex items-center gap-3">
              <PenTool className="w-8 h-8 text-primary" />
              Writer's Studio
            </h1>
            <p className="page-subtitle">
              Craft stories, poems, and scripts with AI-powered creative tools
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Feather className="w-4 h-4 mr-1.5" />
            {filteredNotes.length} Works
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
                  New Creative Work
                </CardTitle>
                <CardDescription>Write your story, poem, or script</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Title your work..."
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
                  placeholder="Let your creativity flow..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[250px] resize-none"
                />

                {/* Writer AI Tools */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Creative Rewrite */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={!noteContent.trim() || isLoading} className="text-xs gap-1.5">
                        {advancedAI.loading === "rewrite" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        Creative Rewrite
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-background border z-50">
                      <DropdownMenuLabel className="text-xs">Choose Style</DropdownMenuLabel>
                      {REWRITE_MODES.map((mode) => (
                        <DropdownMenuItem key={mode.value} onClick={() => handleRewrite(mode.value)} className="text-xs">
                          {mode.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Expand Thought */}
                  <Button variant="outline" size="sm" onClick={handleExpand} disabled={!noteContent.trim() || isLoading} className="text-xs gap-1.5">
                    {advancedAI.loading === "expand" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Expand className="h-3.5 w-3.5" />}
                    Expand Thought
                  </Button>

                  {/* Scene Builder */}
                  <Button variant="outline" size="sm" onClick={() => setSceneModalOpen(true)} disabled={isLoading} className="text-xs gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Scene Builder
                  </Button>

                  {/* Character Builder */}
                  <Button variant="outline" size="sm" onClick={() => setCharacterModalOpen(true)} disabled={isLoading} className="text-xs gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Character Builder
                  </Button>

                  {/* Dialogue Enhancer */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" disabled={!noteContent.trim() || isLoading} className="text-xs gap-1.5">
                        {advancedAI.loading === "dialogue" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5" />}
                        Dialogue Enhancer
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-background border z-50">
                      <DropdownMenuLabel className="text-xs">Choose Tone</DropdownMenuLabel>
                      {DIALOGUE_STYLES.map((style) => (
                        <DropdownMenuItem key={style.value} onClick={() => handleEnhanceDialogue(style.value)} className="text-xs">
                          {style.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Idea Generator */}
                  <Button variant="outline" size="sm" onClick={() => setIdeaModalOpen(true)} disabled={isLoading} className="text-xs gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5" />
                    Idea Generator
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={handleSaveNote} disabled={!noteTitle.trim() || !noteContent.trim() || saving || isRecording} className="action-button">
                    {saving ? "Saving..." : "Save Work"}
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
                <CardTitle>Your Creative Works</CardTitle>
                <CardDescription>Stories, poems, and scripts</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    <NoteCardSkeleton />
                    <NoteCardSkeleton />
                  </div>
                ) : filteredNotes.length === 0 ? (
                  <div className="text-center py-12">
                    <PenTool className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No creative works yet. Start writing!</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3 pr-4">
                      {filteredNotes.map((note) => (
                        <Card key={note.id} className="card-hover cursor-pointer" onClick={() => handleNoteClick(note)}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base">{note.title}</CardTitle>
                              <Badge variant="outline" className="text-xs">{note.category}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Modals */}
      <SceneBuilderModal
        open={sceneModalOpen}
        onClose={() => setSceneModalOpen(false)}
        onGenerate={advancedAI.buildScene}
        onInsert={(text) => setNoteContent((prev) => prev + "\n\n" + text)}
        onReplace={setNoteContent}
        loading={advancedAI.loading === "scene"}
      />
      <CharacterBuilderModal
        open={characterModalOpen}
        onClose={() => setCharacterModalOpen(false)}
        onGenerate={advancedAI.buildCharacter}
        onInsert={(text) => setNoteContent((prev) => prev + "\n\n" + text)}
        onReplace={setNoteContent}
        loading={advancedAI.loading === "character"}
      />
      <IdeaGeneratorModal
        open={ideaModalOpen}
        onClose={() => setIdeaModalOpen(false)}
        onGenerate={advancedAI.generateIdeas}
        onInsert={(text) => setNoteContent((prev) => prev + "\n\n" + text)}
        onReplace={setNoteContent}
        loading={advancedAI.loading === "ideas"}
      />
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
      <AgentChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </DashboardLayout>
  );
};

export default WriterNotes;
