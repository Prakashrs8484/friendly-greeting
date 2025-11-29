import { Briefcase, MapPin, DollarSign, Clock, Search, Filter, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  status: "applied" | "interview" | "offer" | "rejected";
  appliedDate: string;
  nextStep?: string;
  match: number;
}

const jobApplications: JobApplication[] = [
  {
    id: "1",
    company: "TechCorp",
    role: "Senior Full Stack Developer",
    location: "Remote",
    salary: "$120k-$150k",
    status: "interview",
    appliedDate: "2025-01-15",
    nextStep: "Technical Round - Jan 25",
    match: 92,
  },
  {
    id: "2",
    company: "InnovateLabs",
    role: "Lead Backend Engineer",
    location: "San Francisco, CA",
    salary: "$140k-$170k",
    status: "applied",
    appliedDate: "2025-01-10",
    match: 88,
  },
  {
    id: "3",
    company: "StartupXYZ",
    role: "Full Stack Engineer",
    location: "New York, NY",
    salary: "$110k-$130k",
    status: "offer",
    appliedDate: "2024-12-20",
    nextStep: "Decision deadline: Jan 30",
    match: 85,
  },
  {
    id: "4",
    company: "MegaCorp",
    role: "Software Engineer II",
    location: "Seattle, WA",
    salary: "$130k-$160k",
    status: "rejected",
    appliedDate: "2024-12-15",
    match: 78,
  },
  {
    id: "5",
    company: "CloudSystems",
    role: "DevOps Engineer",
    location: "Austin, TX",
    salary: "$115k-$145k",
    status: "applied",
    appliedDate: "2025-01-05",
    match: 82,
  },
];

export const JobTracker = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredJobs = jobApplications.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "applied":
        return <Badge variant="outline">Applied</Badge>;
      case "interview":
        return <Badge className="bg-accent/10 text-accent border-accent/30">Interview</Badge>;
      case "offer":
        return <Badge className="bg-success/10 text-success border-success/30">Offer</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    total: jobApplications.length,
    applied: jobApplications.filter((j) => j.status === "applied").length,
    interviews: jobApplications.filter((j) => j.status === "interview").length,
    offers: jobApplications.filter((j) => j.status === "offer").length,
  };

  return (
    <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur border-border">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="text-lg sm:text-xl font-semibold text-foreground">Job Application Tracker</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            {stats.total} applications • {stats.interviews} interviews • {stats.offers} offers
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Job Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input placeholder="e.g., Google" />
              </div>
              <div className="space-y-2">
                <Label>Role/Position</Label>
                <Input placeholder="e.g., Senior Software Engineer" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="Remote" />
                </div>
                <div className="space-y-2">
                  <Label>Salary Range</Label>
                  <Input placeholder="$120k-$150k" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Interview rounds, contacts, etc." rows={3} />
              </div>
              <Button className="w-full">Track Application</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-secondary/20 border border-border/50">
          <p className="text-xs text-muted-foreground mb-1">Total Applied</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-bold text-foreground">{stats.applied}</p>
        </div>
        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
          <p className="text-xs text-muted-foreground mb-1">In Interview</p>
          <p className="text-2xl font-bold text-foreground">{stats.interviews}</p>
        </div>
        <div className="p-3 rounded-lg bg-success/5 border border-success/20">
          <p className="text-xs text-muted-foreground mb-1">Offers</p>
          <p className="text-2xl font-bold text-foreground">{stats.offers}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search companies or roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">Company</TableHead>
                <TableHead className="min-w-[180px]">Role</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[100px]">Match</TableHead>
                <TableHead className="min-w-[150px]">Next Step</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{job.company}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{job.role}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <DollarSign className="w-3 h-3" />
                        {job.salary}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {job.match}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {job.nextStep ? (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.nextStep}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground">-</p>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
};
