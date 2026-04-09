import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Wand2, Edit2, RotateCcw, ChevronRight } from "lucide-react";
import { FeaturePlan, Feature, generateFeaturePlan, materializeFeatureFromPlan } from "@/lib/agentPageApi";
import { useToast } from "@/hooks/use-toast";

interface PlanRevision {
  id: string;
  prompt: string;
  generatedPlans: FeaturePlan[];
  timestamp: Date;
  appliedAt?: Date;
}

interface GeneratorCanvasProps {
  pageId: string;
  onFeaturesCreated: (features: Feature[]) => void;
  onCancel: () => void;
}

export const AgentPageGeneratorCanvas: React.FC<GeneratorCanvasProps> = ({
  pageId,
  onFeaturesCreated,
  onCancel,
}) => {
  const { toast } = useToast();
  const [stage, setStage] = useState<"prompt" | "planning" | "review" | "materializing">("prompt");
  const [prompt, setPrompt] = useState("");
  const [generatedPlans, setGeneratedPlans] = useState<FeaturePlan[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [revisions, setRevisions] = useState<PlanRevision[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMaterializing, setIsMaterializing] = useState(false);

  // Template prompts to guide users
  const templates = [
    {
      title: "Business Dashboard",
      description: "Sales, metrics, and analytics workspace",
      prompt: "I want to build a business intelligence dashboard that tracks KPIs, team performance, and quarterly goals. Include features for data visualization, goal tracking, and team insights.",
    },
    {
      title: "Project Management",
      description: "Task tracking and collaboration tools",
      prompt: "Create a project management workspace with task lists, kanban boards, timeline views, team assignments, and project status tracking.",
    },
    {
      title: "Content Library",
      description: "Research, notes, and knowledge base",
      prompt: "Build a knowledge management system with research tracker, note-taking, idea collection, content organization, and AI-powered search and summarization.",
    },
  ];

  const handleGeneratePlans = async () => {
    if (!prompt.trim()) {
      toast({ title: "Please enter a description", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateFeaturePlan(pageId, prompt.trim());
      const generatedPlan = result.featurePlan;
      const plans = [generatedPlan];

      setGeneratedPlans(plans);
      setSelectedPlans(new Set(plans.map((p) => p._id || "").filter(Boolean)));
      setRevisions((prev) => [
        ...prev,
        {
          id: `rev-${Date.now()}`,
          prompt,
          generatedPlans: plans,
          timestamp: new Date(),
        },
      ]);
      setStage("review");
      toast({ title: "Plans generated", description: "Review and customize before creating features" });
    } catch (error) {
      console.error("Error generating plans:", error);
      toast({ title: "Generation failed", description: "Could not generate feature plans", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePlan = (planId: string) => {
    const updated = new Set(selectedPlans);
    if (updated.has(planId)) {
      updated.delete(planId);
    } else {
      updated.add(planId);
    }
    setSelectedPlans(updated);
  };

  const handleRegenerate = () => {
    setGeneratedPlans([]);
    setSelectedPlans(new Set());
    setStage("prompt");
  };

  const handleMaterializePlans = async () => {
    if (selectedPlans.size === 0) {
      toast({ title: "Select at least one plan", variant: "destructive" });
      return;
    }

    setIsMaterializing(true);
    try {
      const createdFeatures: Feature[] = [];
      const plansToCreate = generatedPlans.filter((p) => selectedPlans.has(p._id || ""));

      for (const plan of plansToCreate) {
        const response = await materializeFeatureFromPlan(pageId, plan);
        if (response.feature) {
          createdFeatures.push(response.feature);
        }
      }

      toast({
        title: "Features created",
        description: `${createdFeatures.length} features materialized successfully`,
      });
      onFeaturesCreated(createdFeatures);
      setPrompt("");
      setGeneratedPlans([]);
      setSelectedPlans(new Set());
      setStage("prompt");
    } catch (error) {
      console.error("Error materializing plans:", error);
      toast({ title: "Creation failed", description: "Could not create features from plans", variant: "destructive" });
    } finally {
      setIsMaterializing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stage Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={stage === "prompt" ? "default" : "outline"}>
            {stage === "prompt" ? "✓" : "1"} Prompt
          </Badge>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Badge variant={stage === "review" ? "default" : "outline"}>
            {stage === "review" ? "✓" : "2"} Planning
          </Badge>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Badge variant={stage === "materializing" ? "default" : "outline"}>
            3 Review
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {/* Prompt Stage */}
      {stage === "prompt" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Describe Your Workspace
              </CardTitle>
              <CardDescription>
                Tell the AI what you want to build. Use templates or write a custom description.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: I need a project management system with task tracking, kanban board, timeline view, and team collaboration features..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-32"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {templates.map((template) => (
                  <Button
                    key={template.title}
                    variant="outline"
                    className="h-auto p-3 text-left"
                    onClick={() => setPrompt(template.prompt)}
                  >
                    <div>
                      <div className="font-medium text-sm">{template.title}</div>
                      <div className="text-xs text-muted-foreground">{template.description}</div>
                    </div>
                  </Button>
                ))}
              </div>

              <Button
                onClick={handleGeneratePlans}
                disabled={!prompt.trim() || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Plans...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate Feature Plans
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Revision History */}
          {revisions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revision History</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {revisions.map((rev) => (
                      <Button
                        key={rev.id}
                        variant="ghost"
                        className="w-full justify-start text-xs text-left"
                        onClick={() => {
                          setGeneratedPlans(rev.generatedPlans);
                          setSelectedPlans(new Set(rev.generatedPlans.map((p) => p._id || "")));
                          setStage("review");
                        }}
                      >
                        <div className="flex-1">
                          <div className="font-medium">{rev.prompt.substring(0, 50)}...</div>
                          <div className="text-xs text-muted-foreground">
                            {rev.timestamp.toLocaleString()}
                          </div>
                        </div>
                        {rev.appliedAt && <Badge variant="secondary">Applied</Badge>}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Review Stage */}
      {stage === "review" && generatedPlans.length > 0 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit2 className="w-5 h-5" />
                Review & Customize Plans
              </CardTitle>
              <CardDescription>
                Select which features to create. Edit sections and capabilities as needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedPlans.map((plan) => (
                <Card
                  key={plan._id}
                  className={`cursor-pointer transition-colors ${
                    selectedPlans.has(plan._id || "") ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => handleTogglePlan(plan._id || "")}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedPlans.has(plan._id || "")}
                        onChange={() => {}}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{plan.featureName}</div>
                        <div className="text-sm text-muted-foreground mt-1">{plan.description}</div>
                        <div className="flex gap-2 mt-3 flex-wrap">
                          {plan.sections?.slice(0, 2).map((section) => (
                            <Badge key={section.id} variant="secondary" className="text-xs">
                              {section.component}
                            </Badge>
                          ))}
                          {plan.sections && plan.sections.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{plan.sections.length - 2} more
                            </Badge>
                          )}
                        </div>
                        {plan.aiCapabilities && plan.aiCapabilities.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs font-medium mb-1">AI Capabilities:</div>
                            <div className="flex gap-1 flex-wrap">
                              {plan.aiCapabilities.map((cap) => (
                                <Badge key={cap} variant="outline" className="text-xs">
                                  {cap}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Open advanced editor
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRegenerate} className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  onClick={handleMaterializePlans}
                  disabled={selectedPlans.size === 0 || isMaterializing}
                  className="flex-1"
                >
                  {isMaterializing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4 mr-2" />
                      Create Selected Features
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
