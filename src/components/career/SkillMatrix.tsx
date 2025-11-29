import { TrendingUp, Plus, Star, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface Skill {
  name: string;
  level: number;
  category: "technical" | "soft" | "domain";
  trend: "up" | "stable" | "learning";
  demand: "high" | "medium" | "low";
}

const skills: Skill[] = [
  { name: "React & TypeScript", level: 85, category: "technical", trend: "up", demand: "high" },
  { name: "Node.js & Express", level: 78, category: "technical", trend: "stable", demand: "high" },
  { name: "System Design", level: 65, category: "technical", trend: "learning", demand: "high" },
  { name: "AWS Cloud Services", level: 60, category: "technical", trend: "learning", demand: "high" },
  { name: "Leadership & Mentoring", level: 70, category: "soft", trend: "up", demand: "medium" },
  { name: "Project Management", level: 72, category: "soft", trend: "stable", demand: "medium" },
  { name: "FinTech Domain", level: 55, category: "domain", trend: "learning", demand: "high" },
  { name: "API Design", level: 80, category: "technical", trend: "stable", demand: "high" },
];

export const SkillMatrix = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const filteredSkills =
    filterCategory === "all"
      ? skills
      : skills.filter((s) => s.category === filterCategory);

  const avgSkillLevel = Math.round(
    filteredSkills.reduce((sum, s) => sum + s.level, 0) / filteredSkills.length
  );

  return (
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Skill Matrix</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Average Level: {avgSkillLevel}% • {filteredSkills.length} Skills Tracked
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Skill Name</Label>
                <Input placeholder="e.g., Python, Machine Learning" />
              </div>
              <div className="space-y-2">
                <Label>Current Proficiency Level (%)</Label>
                <Input type="number" min="0" max="100" placeholder="50" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select defaultValue="technical">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Skill</SelectItem>
                    <SelectItem value="soft">Soft Skill</SelectItem>
                    <SelectItem value="domain">Domain Knowledge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Add Skill</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={filterCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterCategory("all")}
        >
          All Skills
        </Button>
        <Button
          variant={filterCategory === "technical" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterCategory("technical")}
        >
          Technical
        </Button>
        <Button
          variant={filterCategory === "soft" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterCategory("soft")}
        >
          Soft Skills
        </Button>
        <Button
          variant={filterCategory === "domain" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterCategory("domain")}
        >
          Domain
        </Button>
      </div>

      <div className="space-y-3">
        {filteredSkills.map((skill, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-secondary/10 border border-border/50">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{skill.name}</span>
                  {skill.trend === "learning" && (
                    <TrendingUp className="w-3 h-3 text-accent" />
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    {skill.category}
                  </Badge>
                  <Badge
                    variant={skill.demand === "high" ? "default" : "outline"}
                    className={
                      skill.demand === "high"
                        ? "bg-success/10 text-success border-success/30 text-xs"
                        : "text-xs"
                    }
                  >
                    {skill.demand} demand
                  </Badge>
                </div>
              </div>
              <span className="text-sm font-bold text-foreground flex-shrink-0 ml-2">
                {skill.level}%
              </span>
            </div>
            <Progress
              value={skill.level}
              className={`h-2 ${
                skill.level >= 80
                  ? "[&>div]:bg-success"
                  : skill.level >= 60
                  ? "[&>div]:bg-primary"
                  : "[&>div]:bg-accent"
              }`}
            />
            {skill.level < 70 && skill.demand === "high" && (
              <p className="text-xs text-accent mt-2">
                High demand skill - consider prioritizing for growth
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-start gap-3">
          <Star className="w-4 h-4 text-primary mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">AI Recommendation</p>
            <p className="text-xs text-muted-foreground">
              Based on market trends, focus on improving <span className="font-semibold text-foreground">System Design</span> and{" "}
              <span className="font-semibold text-foreground">AWS Cloud Services</span> to increase your market value by 25%.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
