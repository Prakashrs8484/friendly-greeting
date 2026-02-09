import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAgentPage } from "@/lib/agentPageApi";
import { toast } from "@/hooks/use-toast";

const ICONS = ["🧠", "✍️", "🔬", "💼", "🏋️", "🎨", "📊", "📚", "🎯", "⚡", "🎵", "🌍"];
const PURPOSES = [
  { label: "Writing", desc: "Content creation, editing, storytelling" },
  { label: "Research", desc: "Analysis, data exploration, learning" },
  { label: "Fitness", desc: "Workouts, nutrition, wellness" },
  { label: "Career", desc: "Resume, interviews, skill building" },
  { label: "Custom", desc: "Define your own purpose" },
];

const CreateAgentPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🧠");
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: "Page name is required", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const page = await createAgentPage({
        name: name.trim(),
        description: description.trim(),
        icon,
        pageConfig: { purpose },
      });
      toast({ title: `"${page.name}" created!` });
      navigate(`/agent-pages/${page._id}`);
    } catch {
      toast({ title: "Failed to create page", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-container max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/agent-pages")}
          className="mb-4 gap-2 text-muted-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <h1 className="page-title mb-1">Create Agent Page</h1>
        <p className="page-subtitle mb-8">
          Set up a new workspace for your custom AI agents
        </p>

        <div className="space-y-6">
          {/* Icon picker */}
          <div>
            <Label className="mb-2 block">Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                    icon === ic
                      ? "border-primary bg-primary/10 scale-110"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name" className="mb-2 block">Page Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Content Studio, Research Lab..."
              className="rounded-xl"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="desc" className="mb-2 block">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will this workspace be used for?"
              className="rounded-xl resize-none"
              rows={3}
            />
          </div>

          {/* Purpose */}
          <div>
            <Label className="mb-2 block">Purpose</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PURPOSES.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setPurpose(p.label)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    purpose === p.label
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <span className="text-sm font-medium">{p.label}</span>
                  <span className="text-xs text-muted-foreground block mt-0.5">
                    {p.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            className="w-full rounded-xl h-11"
          >
            {submitting ? "Creating..." : "Create Workspace"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateAgentPage;
