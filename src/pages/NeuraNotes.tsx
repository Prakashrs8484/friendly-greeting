import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import AgentChat from "@/components/AgentChat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Lock, Unlock, Plus, TrendingUp, Calendar, Lightbulb, FileText, Tag } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
}

const NeuraNotes = () => {
  const [diaryLocked, setDiaryLocked] = useState(true);
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "First Note",
      content: "Welcome to NeuraNotes!",
      category: "daily-learnings",
      tags: ["productivity"],
      createdAt: new Date(),
    },
  ]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
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

  const handleSaveNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title: noteTitle,
      content: noteContent,
      category: selectedCategory === "all" ? "daily-learnings" : selectedCategory,
      tags: [],
      createdAt: new Date(),
    };

    setNotes([newNote, ...notes]);
    setNoteTitle("");
    setNoteContent("");
  };

  const filteredNotes = selectedCategory === "all" 
    ? notes 
    : notes.filter(note => note.category === selectedCategory);

  return (
    <DashboardLayout>
      <div className="page-container animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div className="min-w-0 flex-1">
            <h1 className="page-title">NeuraNotes</h1>
            <p className="page-subtitle">Your AI-powered personal journal and knowledge workspace</p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            <Calendar className="w-4 h-4 mr-1.5" />
            {notes.length} Notes
          </Badge>
        </div>

        {/* Main Content */}
        <div className="workspace-grid">
          {/* Notes Section */}
          <div className="workspace-content-column">
            {/* Stats Cards */}
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

            {/* Note Editor */}
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
                  <Button onClick={handleSaveNote} disabled={!noteTitle.trim() || !noteContent.trim()} className="action-button">
                    Save Note
                  </Button>
                  <Button variant="outline" onClick={() => { setNoteTitle(""); setNoteContent(""); }} className="action-button">
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Categories & Notes List */}
            <Card className="card-glass">
              <CardHeader>
                <CardTitle>Your Notes</CardTitle>
                <CardDescription>
                  Organized and accessible
                </CardDescription>
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
                        <p className="text-sm text-muted-foreground mb-4">
                          Your personal thoughts are protected
                        </p>
                        <Button onClick={() => setDiaryLocked(false)} variant="outline">
                          <Unlock className="w-4 h-4 mr-2" />
                          Unlock Diary
                        </Button>
                      </div>
                    ) : filteredNotes.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          No notes in this category yet
                        </p>
                      </div>
                    ) : (
                      filteredNotes.map((note) => (
                        <Card key={note.id} className="card-hover">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base">{note.title}</CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {categories.find(c => c.id === note.category)?.label}
                              </Badge>
                            </div>
                            <CardDescription className="text-xs">
                              {note.createdAt.toLocaleDateString()} at {note.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-foreground/80 line-clamp-2">
                              {note.content}
                            </p>
                            {note.tags.length > 0 && (
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
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant */}
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
                      content: "Hello! I'm your NeuraNotes AI assistant. I can help you organize your notes, suggest topics, summarize past entries, and provide writing insights. How can I assist you today?",
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
