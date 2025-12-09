// src/pages/NeuraNotes.tsx - Hub page for all note types
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  PenTool,
  GraduationCap,
  StickyNote,
  ArrowRight,
  Sparkles,
  MapPin,
  User,
  MessageSquare,
  Lightbulb,
  Expand,
  ListTree,
  List,
  CheckSquare,
  Shield,
  GitCompare,
  Wand2,
  RefreshCw,
  Volume2,
  Calendar,
} from "lucide-react";
import { useNotes } from "@/hooks/useNotes";

const NeuraNotes = () => {
  const { notes } = useNotes();

  const writerNotes = notes.filter(
    (n) => ["creative", "story", "poetry", "script"].includes(n.category || "") || n.tags?.includes("writer")
  );
  const academicNotes = notes.filter(
    (n) => ["academic", "research", "vocabulary", "interview"].includes(n.category || "") || n.tags?.includes("academic")
  );
  const generalNotes = notes.filter(
    (n) => !["creative", "story", "poetry", "script", "academic", "research", "vocabulary", "interview"].includes(n.category || "") &&
           !n.tags?.includes("writer") && !n.tags?.includes("academic")
  );

  const noteSpaces = [
    {
      title: "Writer's Studio",
      description: "Craft stories, poems, and scripts with creative AI tools",
      icon: PenTool,
      path: "/notes/writer",
      color: "from-violet-500/20 to-purple-500/20",
      borderColor: "border-violet-500/30",
      iconColor: "text-violet-500",
      count: writerNotes.length,
      features: [
        { icon: Sparkles, label: "Creative Rewrite (10 styles)" },
        { icon: Expand, label: "Expand Thought" },
        { icon: MapPin, label: "Scene Builder" },
        { icon: User, label: "Character Builder" },
        { icon: MessageSquare, label: "Dialogue Enhancer" },
        { icon: Lightbulb, label: "Idea Generator" },
      ],
    },
    {
      title: "General Notes",
      description: "Quick notes, daily learnings, and personal diary",
      icon: StickyNote,
      path: "/notes/general",
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-500",
      count: generalNotes.length,
      features: [
        { icon: Wand2, label: "Improve Grammar" },
        { icon: RefreshCw, label: "Paraphrase" },
        { icon: Volume2, label: "Read Aloud (TTS)" },
        { icon: Calendar, label: "Daily Learnings" },
      ],
    },
    {
      title: "Academic Hub",
      description: "Research notes, study materials, and interview prep",
      icon: GraduationCap,
      path: "/notes/academic",
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-500",
      count: academicNotes.length,
      features: [
        { icon: ListTree, label: "Structure Document" },
        { icon: List, label: "Extract Bullets" },
        { icon: CheckSquare, label: "Extract Actions" },
        { icon: GraduationCap, label: "Academic Improve" },
        { icon: Shield, label: "Strengthen Argument" },
        { icon: GitCompare, label: "Compare Texts" },
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="page-container animate-fade-in">
        {/* Header */}
        <div className="page-header text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-10 h-10 text-primary" />
            <h1 className="page-title">NeuraNotes</h1>
          </div>
          <p className="page-subtitle max-w-2xl mx-auto">
            Your AI-powered writing workspace. Choose a specialized space for your notes.
          </p>
          <Badge variant="secondary" className="mt-4 bg-primary/10 text-primary border-primary/20">
            {notes.length} Total Notes
          </Badge>
        </div>

        {/* Note Spaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {noteSpaces.map((space) => (
            <Link key={space.path} to={space.path} className="block group">
              <Card className={`h-full card-hover border-2 ${space.borderColor} bg-gradient-to-br ${space.color} transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-background/80 ${space.iconColor}`}>
                      <space.icon className="w-8 h-8" />
                    </div>
                    <Badge variant="secondary" className="bg-background/80">
                      {space.count} notes
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mt-4">{space.title}</CardTitle>
                  <CardDescription className="text-sm">{space.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">AI Features</p>
                    <div className="flex flex-wrap gap-1.5">
                      {space.features.map((feature, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs gap-1 bg-background/60">
                          <feature.icon className="w-3 h-3" />
                          {feature.label}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full group-hover:bg-primary gap-2" variant="secondary">
                    Open {space.title.split("'")[0]}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
          <Card className="card-glass text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">{notes.length}</div>
              <p className="text-sm text-muted-foreground">Total Notes</p>
            </CardContent>
          </Card>
          <Card className="card-glass text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-violet-500">{writerNotes.length}</div>
              <p className="text-sm text-muted-foreground">Creative Works</p>
            </CardContent>
          </Card>
          <Card className="card-glass text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-500">{generalNotes.length}</div>
              <p className="text-sm text-muted-foreground">General Notes</p>
            </CardContent>
          </Card>
          <Card className="card-glass text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-500">{academicNotes.length}</div>
              <p className="text-sm text-muted-foreground">Academic Notes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NeuraNotes;
