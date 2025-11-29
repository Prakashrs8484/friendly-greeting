import { Upload, Download, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const resumeSuggestions = [
  {
    type: "success",
    text: "Strong technical skills section with measurable achievements",
  },
  {
    type: "warning",
    text: "Add more quantified results in your work experience (e.g., '30% performance improvement')",
  },
  {
    type: "warning",
    text: "Include leadership keywords for senior roles",
  },
  {
    type: "info",
    text: "Consider adding a portfolio link to showcase projects",
  },
];

const resumeMetrics = [
  { label: "ATS Compatibility", score: 92, status: "excellent" },
  { label: "Keyword Optimization", score: 78, status: "good" },
  { label: "Impact & Results", score: 85, status: "excellent" },
  { label: "Formatting", score: 90, status: "excellent" },
];

export const ResumeOptimizer = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { toast } = useToast();

  const handleUpload = () => {
    setUploadOpen(false);
    toast({
      title: "Resume Uploaded",
      description: "Career Agent is analyzing your resume and generating insights.",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Resume Downloaded",
      description: "Your optimized resume has been downloaded.",
    });
  };

  const overallScore = Math.round(
    resumeMetrics.reduce((sum, m) => sum + m.score, 0) / resumeMetrics.length
  );

  return (
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Resume Optimizer</h3>
          </div>
          <p className="text-sm text-muted-foreground">AI-powered resume analysis and improvement</p>
        </div>
      </div>

      {/* Overall Score */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Overall Resume Score</p>
            <p className="text-xs text-muted-foreground">Based on industry standards</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{overallScore}</div>
            <div className="text-xs text-muted-foreground">out of 100</div>
          </div>
        </div>
        <Progress value={overallScore} className="h-3" />
      </div>

      {/* Metrics Breakdown */}
      <div className="space-y-3 mb-6">
        <p className="text-sm font-semibold text-foreground">Score Breakdown</p>
        {resumeMetrics.map((metric, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-secondary/10 border border-border/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-foreground">{metric.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{metric.score}%</span>
                {metric.status === "excellent" ? (
                  <CheckCircle className="w-4 h-4 text-success" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-warning" />
                )}
              </div>
            </div>
            <Progress
              value={metric.score}
              className={`h-1.5 ${
                metric.status === "excellent"
                  ? "[&>div]:bg-success"
                  : "[&>div]:bg-warning"
              }`}
            />
          </div>
        ))}
      </div>

      {/* AI Suggestions */}
      <div className="space-y-3 mb-6">
        <p className="text-sm font-semibold text-foreground">AI Suggestions</p>
        {resumeSuggestions.map((suggestion, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border flex items-start gap-3 ${
              suggestion.type === "success"
                ? "bg-success/5 border-success/20"
                : suggestion.type === "warning"
                ? "bg-warning/5 border-warning/20"
                : "bg-accent/5 border-accent/20"
            }`}
          >
            <div className="mt-0.5">
              {suggestion.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : suggestion.type === "warning" ? (
                <AlertCircle className="w-4 h-4 text-warning" />
              ) : (
                <FileText className="w-4 h-4 text-accent" />
              )}
            </div>
            <p className="text-xs text-muted-foreground flex-1">{suggestion.text}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1 gap-2">
              <Upload className="w-4 h-4" />
              Upload New Resume
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Resume</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-secondary/20 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX (Max 5MB)
                </p>
              </div>
              <Button onClick={handleUpload} className="w-full">
                Analyze Resume
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button variant="default" className="flex-1 gap-2" onClick={handleDownload}>
          <Download className="w-4 h-4" />
          Download Optimized
        </Button>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Pro Tip:</span> Tailor your resume for each job application. Our AI can customize it based on job descriptions.
        </p>
      </div>
    </Card>
  );
};
