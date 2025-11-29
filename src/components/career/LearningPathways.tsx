import { BookOpen, Plus, Clock, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface LearningItem {
  id: string;
  title: string;
  platform: string;
  duration: string;
  progress: number;
  category: string;
  status: "recommended" | "in-progress" | "completed";
  skillGap?: string;
}

const learningItems: LearningItem[] = [
  {
    id: "1",
    title: "Advanced TypeScript Patterns",
    platform: "Frontend Masters",
    duration: "8 hours",
    progress: 65,
    category: "Technical",
    status: "in-progress",
  },
  {
    id: "2",
    title: "System Design Interview Prep",
    platform: "Educative",
    duration: "12 hours",
    progress: 35,
    category: "Technical",
    status: "in-progress",
  },
  {
    id: "3",
    title: "AWS Solutions Architect",
    platform: "A Cloud Guru",
    duration: "20 hours",
    progress: 100,
    category: "Cloud",
    status: "completed",
  },
  {
    id: "4",
    title: "Leadership & Team Management",
    platform: "LinkedIn Learning",
    duration: "6 hours",
    progress: 100,
    category: "Soft Skills",
    status: "completed",
  },
  {
    id: "5",
    title: "Microservices Architecture",
    platform: "Udemy",
    duration: "15 hours",
    progress: 0,
    category: "Technical",
    status: "recommended",
    skillGap: "Fills gap in distributed systems knowledge",
  },
  {
    id: "6",
    title: "GraphQL Complete Guide",
    platform: "Pluralsight",
    duration: "10 hours",
    progress: 0,
    category: "Technical",
    status: "recommended",
    skillGap: "High demand for API development",
  },
  {
    id: "7",
    title: "Docker & Kubernetes Mastery",
    platform: "Udemy",
    duration: "18 hours",
    progress: 0,
    category: "DevOps",
    status: "recommended",
    skillGap: "Essential for modern deployment practices",
  },
];

export const LearningPathways = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const recommended = learningItems.filter((i) => i.status === "recommended");
  const inProgress = learningItems.filter((i) => i.status === "in-progress");
  const completed = learningItems.filter((i) => i.status === "completed");

  const totalProgress = inProgress.length > 0
    ? Math.round(inProgress.reduce((sum, i) => sum + i.progress, 0) / inProgress.length)
    : 0;

  return (
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Learning Pathways</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {inProgress.length} in progress • {completed.length} completed
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Learning Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Course Title</Label>
                <Input placeholder="e.g., Advanced React Patterns" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Input placeholder="e.g., Udemy" />
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input placeholder="e.g., 10 hours" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="What will you learn? Why this course?" rows={3} />
              </div>
              <Button className="w-full">Add to Learning Plan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall Progress */}
      {inProgress.length > 0 && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Learning Progress</span>
            <span className="text-sm font-bold text-primary">{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
        </div>
      )}

      <Tabs defaultValue="in-progress" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="in-progress">
            In Progress ({inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="recommended">
            Recommended ({recommended.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-3 mt-4">
          {inProgress.map((item) => (
            <div key={item.id} className="p-4 rounded-lg bg-secondary/20 border border-border/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {item.platform}
                    </p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.duration}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <Progress value={item.progress} className="h-2 mb-2" />
              <p className="text-xs font-semibold text-primary">{item.progress}% Complete</p>
            </div>
          ))}
          {inProgress.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No courses in progress. Add a course to get started!
            </p>
          )}
        </TabsContent>

        <TabsContent value="recommended" className="space-y-3 mt-4">
          {recommended.map((item) => (
            <div key={item.id} className="p-4 rounded-lg bg-accent/10 border border-accent/30">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="text-xs text-muted-foreground">{item.platform}</p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-xs text-muted-foreground">{item.duration}</p>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  {item.skillGap && (
                    <p className="text-xs text-muted-foreground italic">{item.skillGap}</p>
                  )}
                </div>
                <Award className="w-4 h-4 text-accent flex-shrink-0 ml-2" />
              </div>
              <Button size="sm" variant="outline" className="w-full mt-2">
                Add to Learning Plan
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {completed.map((item) => (
            <div key={item.id} className="p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs text-muted-foreground">{item.platform}</p>
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-xs text-muted-foreground">{item.duration}</p>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                </div>
                <Award className="w-5 h-5 text-success flex-shrink-0 ml-2" />
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
