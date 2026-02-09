import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Settings, Bot, Send, Loader2, Sparkles, ToggleLeft, ToggleRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAgentPage,
  createAgent,
  executeAgent,
  type AgentPage,
  type Agent,
  type CreateAgentPayload,
} from "@/lib/agentPageApi";
import { toast } from "@/hooks/use-toast";

interface ChatMessage {
  role: "user" | "agent";
  content: string;
  agentName?: string;
}

const TONES = ["Formal", "Friendly", "Motivational", "Neutral"];

const AgentPageWorkspace = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<AgentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Create agent form state
  const [agentName, setAgentName] = useState("");
  const [agentRole, setAgentRole] = useState("");
  const [agentTone, setAgentTone] = useState("Friendly");
  const [creativity, setCreativity] = useState([50]);
  const [verbosity, setVerbosity] = useState([50]);
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!pageId) return;
    const load = async () => {
      try {
        const data = await getAgentPage(pageId);
        setPage(data);
        if (data.agents?.length > 0) setSelectedAgent(data.agents[0]);
      } catch {
        toast({ title: "Failed to load workspace", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pageId]);

  const handleCreateAgent = async () => {
    if (!pageId || !agentName.trim()) return;
    setCreating(true);
    try {
      const payload: CreateAgentPayload = {
        name: agentName.trim(),
        description: agentRole,
        config: {
          role: agentRole,
          tone: agentTone,
          creativity: creativity[0],
          verbosity: verbosity[0],
          memoryEnabled,
        },
      };
      const agent = await createAgent(pageId, payload);
      setPage((prev) =>
        prev ? { ...prev, agents: [...(prev.agents || []), agent] } : prev
      );
      setSelectedAgent(agent);
      setCreateOpen(false);
      resetForm();
      toast({ title: `Agent "${agent.name}" created!` });
    } catch {
      toast({ title: "Failed to create agent", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setAgentName("");
    setAgentRole("");
    setAgentTone("Friendly");
    setCreativity([50]);
    setVerbosity([50]);
    setMemoryEnabled(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedAgent || !pageId) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    try {
      const res = await executeAgent(pageId, selectedAgent._id, userMsg.content);
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: res.reply, agentName: selectedAgent.name },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "Sorry, I couldn't process that. Please try again.", agentName: selectedAgent.name },
      ]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!page) {
    return (
      <DashboardLayout>
        <div className="page-container text-center py-20">
          <p className="text-muted-foreground">Workspace not found</p>
          <Button variant="outline" onClick={() => navigate("/agent-pages")} className="mt-4">
            Back to Agent Pages
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/agent-pages")} className="rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-2xl">{page.icon || "🧠"}</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold truncate">{page.name}</h1>
            <p className="text-sm text-muted-foreground truncate">{page.description}</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          {/* Agents Panel */}
          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Agents
              </h2>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="h-7 gap-1 rounded-lg text-xs">
                    <Plus className="w-3 h-3" /> New
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Create Agent
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <div>
                      <Label className="mb-1.5 block text-sm">Agent Name</Label>
                      <Input
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="e.g. Blog Writer, Code Reviewer..."
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-sm">Role / Purpose</Label>
                      <Input
                        value={agentRole}
                        onChange={(e) => setAgentRole(e.target.value)}
                        placeholder="What does this agent do?"
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-sm">Tone</Label>
                      <Select value={agentTone} onValueChange={setAgentTone}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TONES.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-sm">
                        Creativity — {creativity[0]}%
                      </Label>
                      <Slider
                        value={creativity}
                        onValueChange={setCreativity}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Precise</span>
                        <span>Creative</span>
                      </div>
                    </div>
                    <div>
                      <Label className="mb-1.5 block text-sm">
                        Response Length — {verbosity[0]}%
                      </Label>
                      <Slider
                        value={verbosity}
                        onValueChange={setVerbosity}
                        max={100}
                        step={5}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Concise</span>
                        <span>Detailed</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setMemoryEnabled(!memoryEnabled)}
                      className="flex items-center gap-3 w-full p-3 rounded-xl border border-border hover:border-primary/30 transition-colors"
                    >
                      {memoryEnabled ? (
                        <ToggleRight className="w-5 h-5 text-primary" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div className="text-left">
                        <span className="text-sm font-medium block">Memory</span>
                        <span className="text-xs text-muted-foreground">
                          {memoryEnabled ? "Agent remembers context" : "No memory between sessions"}
                        </span>
                      </div>
                    </button>
                    <Button
                      onClick={handleCreateAgent}
                      disabled={creating || !agentName.trim()}
                      className="w-full rounded-xl"
                    >
                      {creating ? "Creating..." : "Create Agent"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {(!page.agents || page.agents.length === 0) ? (
              <div className="text-center py-8">
                <Bot className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No agents yet</p>
                <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)} className="gap-1 rounded-lg text-xs">
                  <Plus className="w-3 h-3" /> Create First Agent
                </Button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {page.agents.map((agent) => (
                  <button
                    key={agent._id}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setMessages([]);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedAgent?._id === agent._id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-secondary border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedAgent?._id === agent._id ? "bg-primary/20" : "bg-secondary"
                      }`}>
                        <Bot className={`w-4 h-4 ${
                          selectedAgent?._id === agent._id ? "text-primary" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{agent.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {agent.config?.tone || "Neutral"} · {agent.config?.role || "Assistant"}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Workspace Area */}
          <div className="rounded-2xl bg-card border border-border flex flex-col min-h-[500px]">
            {selectedAgent ? (
              <>
                {/* Agent Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{selectedAgent.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedAgent.config?.role || "AI Assistant"}
                    </p>
                  </div>
                  <div className="ml-auto flex gap-1.5">
                    <Badge variant="outline" className="text-xs">
                      {selectedAgent.config?.tone || "Neutral"}
                    </Badge>
                    {selectedAgent.config?.memoryEnabled && (
                      <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                        Memory
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Start a conversation with <span className="font-medium text-foreground">{selectedAgent.name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Type a message below to begin
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary border border-border"
                            }`}
                          >
                            {msg.role === "agent" && (
                              <p className="text-xs font-medium text-primary mb-1">
                                {msg.agentName}
                              </p>
                            )}
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {sending && (
                        <div className="flex justify-start">
                          <div className="bg-secondary border border-border rounded-2xl px-4 py-3">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder={`Message ${selectedAgent.name}...`}
                      className="rounded-xl resize-none min-h-[44px] max-h-[120px]"
                      rows={1}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={sending || !input.trim()}
                      size="icon"
                      className="rounded-xl h-[44px] w-[44px] shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <Bot className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  {page.agents?.length ? "Select an agent to begin" : "Create an agent to get started"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AgentPageWorkspace;
