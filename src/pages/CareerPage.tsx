import DashboardLayout from "@/components/DashboardLayout";
import AgentChat from "@/components/AgentChat";
import { Target, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CareerDashboard } from "@/components/career/CareerDashboard";
import { CareerGoalsPlanner } from "@/components/career/CareerGoalsPlanner";
import { SkillMatrix } from "@/components/career/SkillMatrix";
import { ResumeOptimizer } from "@/components/career/ResumeOptimizer";
import { JobTracker } from "@/components/career/JobTracker";
import { LearningPathways } from "@/components/career/LearningPathways";

const CareerPage = () => {
  const { toast } = useToast();

  const handleExportReport = () => {
    toast({
      title: "Career Report Generated",
      description: "Your comprehensive career progress report is being downloaded.",
    });
  };

  return (
    <DashboardLayout hideNavigation>
      <div className="page-container animate-fade-in">
        {/* Header with Action Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="page-title">
              Career Workspace
            </h1>
            <p className="page-subtitle">
              Your AI-powered Career Coach for growth, learning, and professional development
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportReport}>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <Target className="w-4 h-4 mr-1.5" />
              Active Agent
            </Badge>
          </div>
        </div>

        {/* Career Overview Dashboard */}
        <CareerDashboard />

        {/* Two Column Layout */}
        <div className="workspace-grid">
          {/* Left Column - Agent Chat */}
          <div className="workspace-chat-column">
            <div className="h-[600px] sm:h-[750px] lg:h-[800px]">
              <AgentChat
                agentName="Career Coach"
                agentIcon={Target}
                placeholder="Ask about goals, skills, resume, jobs, learning paths..."
                initialMessages={[
                  {
                    role: "agent",
                    content: "Hello! I'm your Career Coach. I can help you set goals, track skills, optimize your resume, plan learning paths, and find job opportunities. What would you like to work on today?",
                    timestamp: new Date(Date.now() - 60000),
                  },
                ]}
              />
            </div>
          </div>

          {/* Right Column - Career Modules */}
          <div className="workspace-content-column">
            {/* Career Goals Planner */}
            <CareerGoalsPlanner />

            {/* Skill Matrix */}
            <SkillMatrix />

            {/* Resume Optimizer */}
            <ResumeOptimizer />

            {/* Job Application Tracker */}
            <JobTracker />

            {/* Learning Pathways */}
            <LearningPathways />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CareerPage;
