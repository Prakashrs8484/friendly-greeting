import { TrendingUp, Calendar, Award, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CareerStat {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  trend?: string;
}

const careerStats: CareerStat[] = [
  { label: "Current Role", value: "Full Stack Developer", icon: Briefcase },
  { label: "Experience", value: "5 Years", icon: Calendar },
  { label: "Skills Tracked", value: "12", icon: TrendingUp, trend: "+2 this month" },
  { label: "Certifications", value: "3", icon: Award },
];

const milestones = [
  { title: "Joined TechCorp as Senior Developer", date: "January 2024", type: "work" },
  { title: "Completed AWS Solutions Architect Certification", date: "November 2023", type: "cert" },
  { title: "Promoted to Team Lead", date: "June 2023", type: "work" },
  { title: "Published Open Source Project", date: "March 2023", type: "project" },
  { title: "Completed React Advanced Course", date: "January 2023", type: "learning" },
];

export const CareerDashboard = () => {
  return (
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur border-border">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">Career Overview</h3>
        </div>
        <p className="text-sm text-muted-foreground">Your professional profile and milestones</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {careerStats.map((stat, idx) => (
          <div key={idx} className="p-3 sm:p-4 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-base sm:text-lg font-semibold text-foreground truncate">
              {stat.value}
            </p>
            {stat.trend && (
              <p className="text-xs text-success mt-1">{stat.trend}</p>
            )}
          </div>
        ))}
      </div>

      {/* Milestones Timeline */}
      <div>
        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
          <Calendar className="w-4 h-4" />
          Career Milestones
        </h4>
        <div className="space-y-3">
          {milestones.map((milestone, idx) => (
            <div key={idx} className="flex items-start gap-3 group">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                {idx < milestones.length - 1 && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {milestone.title}
                  </p>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {milestone.type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{milestone.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
