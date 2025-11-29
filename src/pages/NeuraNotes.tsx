// src/pages/NeuraNotes.tsx

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AgentChat from "@/components/AgentChat";

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
} from "lucide-react";

import { useNotes, NoteDTO } from "@/hooks/useNotes";

const NeuraNotes = () => {
  const [diaryLocked, setDiaryLocked] = useState(true);

  // HOOK for backend notes
  const { notes, loading, error, createNote } = useNotes();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const categories = [
    { id: "all", label: "All Notes", icon: FileText },
    { id: "diary", label: "Personal Diary", icon: Lock },
    { id: "vocabulary", label: "Vocabulary Builder", icon: BookOpen },
    { id: "academic", label: "Academic Notes", icon: Lightbulb },
    { id: "interview", label: "Interview Prep", icon: TrendingUp },
    { id: "daily-learnings", label: "Daily Learnings", icon: Calendar },
  ];

  // Save note to backend
  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;

    try {
      await createNote({
        title: noteTitle,
        content: noteContent,
        category: selectedCategory === "all" ? "daily-learnings" : selectedCategory,
        tags: [],
      });

      setNoteTitle("");
      setNoteContent("");
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  const filteredNotes =
    selectedCategory === "all"
      ? notes
      : notes.filter((note) => note.category === selectedCategory);

  return (
    <DashboardLayout>
      <div className="page-container animate-fade-in">
        {/* PAGE HEADER */}
        <div className="page-header">
          <div className="min-w-0 flex-1">
            <h1 className="page-title">NeuraNotes</h1>
            <p className="page-subtitle">
              Your AI-powered personal journal and knowledge workspace
            </p>
          </div>

          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20"
          >
            <Calendar className="w-4 h-4 mr-1.5" />
            {notes.length} Notes
          </Badge>
        </div>

        <div className="workspace-grid">
          {/* LEFT CONTENT */}
          <div className="workspace-content-column">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="card-hover card-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{notes.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across all categories
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover card-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Writing Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7 days</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep it up!
                  </p>
                </CardContent>
              </Card>

              <Card className="card-hover card-glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    New entries
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Editor */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create New Note
                </CardTitle>
                <CardDescription>
                  Write your thoughts, learnings, or reflections
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Input
                  placeholder="Note title..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="text-lg font-semibold"
                />

                <Textarea
                  placeholder="Start writing... (Supports markdown)"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[200px] resize-none"
                />

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    onClick={handleSaveNote}
                    disabled={!noteTitle.trim() || !noteContent.trim()}
                    className="action-button"
                  >
                    Save Note
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setNoteTitle("");
                      setNoteContent("");
                    }}
                    className="action-button"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes List */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle>Your Notes</CardTitle>
                <CardDescription>Organized and accessible</CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <ScrollArea className="w-full">
                    <TabsList className="inline-flex w-full min-w-max">
                      {categories.map((cat) => (
                        <TabsTrigger
                          key={cat.id}
                          value={cat.id}
                          className="gap-2"
                        >
                          <cat.icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{cat.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </ScrollArea>

                  <TabsContent value={selectedCategory} className="mt-4 space-y-3">
                    {/* Diary Lock */}
                    {selectedCategory === "diary" && diaryLocked ? (
                      <div className="text-center py-12">
                        <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          Private Diary Locked
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Your personal thoughts are protected
                        </p>
                        <Button onClick={() => setDiaryLocked(false)} variant="outline">
                          <Unlock className="w-4 h-4 mr-2" />
                          Unlock Diary
                        </Button>
                      </div>
                    ) : loading ? (
                      <div className="text-center py-12 text-muted-foreground">
                        Loading notes...
                      </div>
                    ) : filteredNotes.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No notes yet</p>
                      </div>
                    ) : (
                      filteredNotes.map((note) => {
                        const created = note.createdAt
                          ? new Date(note.createdAt)
                          : new Date();

                        return (
                          <Card key={note.id} className="card-hover">
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-base">
                                  {note.title}
                                </CardTitle>

                                <Badge variant="outline" className="text-xs">
                                  {categories.find((c) => c.id === note.category)
                                    ?.label || "General"}
                                </Badge>
                              </div>

                              <CardDescription className="text-xs">
                                {created.toLocaleDateString()}{" "}
                                {created.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </CardDescription>
                            </CardHeader>

                            <CardContent>
                              {/* CONTENT PREVIEW */}
                              <p className="text-sm text-foreground/80 line-clamp-3">
                                {note.content}
                              </p>

                              {/* AI SUMMARY */}
                              {note.summary && (
                                <p className="text-xs text-foreground/60 mt-2 line-clamp-2">
                                  <strong>Summary: </strong>
                                  {note.summary}
                                </p>
                              )}

                              {/* EMOTION */}
                              {note.emotion?.label && (
                                <Badge
                                  variant="secondary"
                                  className="mt-2 text-xs bg-primary/10 text-primary"
                                >
                                  {note.emotion.label} •{" "}
                                  {(note.emotion.score * 100).toFixed(0)}%
                                </Badge>
                              )}

                              {/* TAGS */}
                              {note.tags?.length > 0 && (
                                <div className="flex gap-1 mt-3">
                                  {note.tags.map((tag, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      <Tag className="w-3 h-3 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT — AI Chat Assistant */}
          <div className="workspace-chat-column">
            <div className="sticky top-20">
              <Card className="card-glass h-[calc(100vh-6rem)]">
                <AgentChat
                  agentName="NeuraNotes AI"
                  agentIcon={BookOpen}
                  placeholder="Ask me to summarize, organize, or analyze your notes..."
                  initialMessages={[
                    {
                      role: "agent",
                      content:
                        "Hello! I'm your NeuraNotes AI assistant. I can help you organize your notes, suggest topics, summarize past entries, and provide writing insights. How can I assist you today?",
                      timestamp: new Date(),
                    },
                  ]}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NeuraNotes;
