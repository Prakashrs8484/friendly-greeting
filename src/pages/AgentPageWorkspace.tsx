import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Settings, Bot, Send, Loader2, Sparkles, ToggleLeft, ToggleRight, Wand2, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
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
  getPageMessages,
  clearAgentMessages,
  clearPageMessages,
  createFeature,
  getPageFeatures,
  deleteFeature,
  type AgentPage,
  type Agent,
  type CreateAgentPayload,
  type PageMessage,
  type Feature,
} from "@/lib/agentPageApi";
import { FeatureRenderer } from "@/components/features/FeatureRenderer";
import { buildSampleFeatures } from "@/components/features/featurePlanSamples";
import { toast } from "@/hooks/use-toast";

interface ChatMessage {
  role: "user" | "agent";
  content: string;
  agentName?: string;
  timestamp: Date;
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
  
  // Feature creation state
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [creatingFeature, setCreatingFeature] = useState(false);
  const [showFeatureInput, setShowFeatureInput] = useState(false);
  const sampleFeatures = buildSampleFeatures(pageId);

  // Load page data
  useEffect(() => {
    if (!pageId) return;
    const load = async () => {
      try {
        const data = await getAgentPage(pageId);
        setPage(data);
        if (data.agents?.length > 0) setSelectedAgent(data.agents[0]);

        // Load existing features
        try {
          const response = await getPageFeatures(pageId);
          // Handle both old format (direct array) and new format (wrapped response)
          const pageFeatures = response.features || response || [];
          const normalized = Array.isArray(pageFeatures)
            ? pageFeatures.map((f) => ({
                ...f,
                featurePlan: f.featurePlan || (f.config as { featurePlan?: unknown } | undefined)?.featurePlan || null
              }))
            : [];
          setFeatures(normalized);
        } catch (err: any) {
          console.error("[Feature Loading] Error:", err);
          // Don't show error toast for loading failures, just log
          setFeatures([]);
        }
      } catch {
        toast({ title: "Failed to load workspace", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pageId]);

  // Load messages for the selected agent (per-agent chat history) - FRONTEND SYNC WITH DB
  useEffect(() => {
    if (!pageId || !page) return;
    const loadMessages = async () => {
      console.log('[Frontend] [DB SYNC] Loading messages from MongoDB:', { pageId, agentId: selectedAgent?._id });
      try {
        // Load only the selected agent's chat thread (or all if no agent selected)
        const response = await getPageMessages(pageId, selectedAgent?._id);
        const pageMessages = response.messages || [];
        console.log('[Frontend] [DB SYNC] Loaded', pageMessages.length, 'messages from DB');
        // Convert PageMessage[] to ChatMessage[]
        const chatMessages: ChatMessage[] = pageMessages.map((msg) => {
          // Find agent name if it's an agent message
          const agent = page.agents?.find((a) => a._id === msg.agentId);
          const timestamp = msg.createdAt || msg.timestamp;
          return {
            role: msg.role,
            content: msg.content,
            agentName: msg.role === "agent" ? (agent?.name || "Agent") : undefined,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
          };
        });
        setMessages(chatMessages);
        console.log('[Frontend] [DB SYNC] Messages synced to UI:', chatMessages.length);
      } catch (err) {
        // If loading messages fails, just start with empty messages
        console.error('[Frontend] [DB SYNC] Failed to load agent messages:', err);
        setMessages([]);
      }
    };
    loadMessages();
  }, [pageId, selectedAgent?._id, page]);

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
    const userMsg: ChatMessage = { role: "user", content: input.trim(), timestamp: new Date() };
    // Optimistically add user message to UI
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    try {
      // Backend saves user message (with agentId) and returns agent response (also saved with agentId)
      const res = await executeAgent(pageId, selectedAgent._id, userMsg.content);
      const agentReply = res.response;
      const content = !agentReply || agentReply.trim() === '' ? "Agent is active but returned no response." : agentReply;
      // Backend saves agent response, so we just update UI optimistically
      setMessages((prev) => [
        ...prev,
        { role: "agent", content, agentName: selectedAgent.name, timestamp: new Date() },
      ]);
      // Reload messages to ensure sync with DB (ensures consistency with MongoDB)
      console.log('[Frontend] [DB SYNC] Reloading messages after send to sync with MongoDB...');
      try {
        const response = await getPageMessages(pageId, selectedAgent._id);
        const pageMessages = response.messages || [];
        console.log('[Frontend] [DB SYNC] Reloaded', pageMessages.length, 'messages from DB');
        const chatMessages: ChatMessage[] = pageMessages.map((msg) => {
          const agent = page?.agents?.find((a) => a._id === msg.agentId);
          const timestamp = msg.createdAt || msg.timestamp;
          return {
            role: msg.role,
            content: msg.content,
            agentName: msg.role === "agent" ? (agent?.name || "Agent") : undefined,
            timestamp: timestamp ? new Date(timestamp) : new Date(),
          };
        });
        setMessages(chatMessages);
        console.log('[Frontend] [DB SYNC] UI synced with MongoDB');
      } catch (err) {
        console.error('[Frontend] [DB SYNC] Failed to reload messages after send:', err);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "Agent is active but returned no response.", agentName: selectedAgent.name, timestamp: new Date() },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleCreateFeature = async () => {
    if (!featureInput.trim() || !pageId || creatingFeature) return;
    setCreatingFeature(true);
    try {
      const response = await createFeature(pageId, { input: featureInput.trim() });
      
      // Handle both old format (direct feature) and new format (wrapped response)
      const newFeature = response.feature || response;
      const normalizedFeature = {
        ...newFeature,
        featurePlan: newFeature.featurePlan || (newFeature.config as { featurePlan?: unknown } | undefined)?.featurePlan || null
      };
      
      if (!normalizedFeature || !normalizedFeature._id) {
        throw new Error("Invalid response from server");
      }

      setFeatures((prev) => [normalizedFeature, ...prev]);
      setFeatureInput("");
      setShowFeatureInput(false);
      toast({ title: `Feature "${normalizedFeature.name}" created!` });
      
      // Update page agents list if needed
      if (page && normalizedFeature.agentIds && normalizedFeature.agentIds.length > 0) {
        setPage((prev) =>
          prev
            ? {
                ...prev,
                agents: [
                  ...(prev.agents || []),
                  ...normalizedFeature.agentIds.filter(
                    (newAgent) => !prev.agents?.some((a) => a._id === newAgent._id)
                  ),
                ],
              }
            : null
        );
      }
    } catch (err: any) {
      console.error("[Feature Creation] Error:", err);
      
      // Extract error message from various possible formats
      let errorMessage = "Failed to create feature. Please try again.";
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      // Clean up HTML error messages if any
      if (errorMessage.includes('<html>') || errorMessage.includes('<!DOCTYPE')) {
        errorMessage = "Server error occurred. Please check the console for details.";
      }
      
      toast({
        title: "Failed to create feature",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreatingFeature(false);
    }
  };

  const handleDeleteFeature = async (feature: Feature) => {
    if (!pageId || !feature?._id) return;
    const confirmed = confirm(`Delete feature "${feature.name}"? This will remove its data and linked insights.`);
    if (!confirmed) return;

    // Optimistic UI update (no page reload)
    const prevFeatures = features;
    setFeatures((prev) => prev.filter((f) => f._id !== feature._id));
    const featureAgentIds = (feature.agentIds || []).map((a: any) => a?._id).filter(Boolean);
    const prevPage = page;
    const prevSelectedAgent = selectedAgent;

    if (featureAgentIds.length > 0) {
      // Remove feature-tied agents from the agents panel immediately (no ghost agents)
      setPage((prev) =>
        prev
          ? { ...prev, agents: (prev.agents || []).filter((a) => !featureAgentIds.includes(a._id)) }
          : prev
      );
      // If the currently selected agent was deleted, reset selection + messages
      if (selectedAgent && featureAgentIds.includes(selectedAgent._id)) {
        setSelectedAgent(null);
        setMessages([]);
      }
    }

    try {
      await deleteFeature(pageId, feature._id, true);
      toast({ title: `Feature "${feature.name}" deleted` });
    } catch (err) {
      console.error("[Feature Delete] Error:", err);
      // Roll back if deletion failed
      setFeatures(prevFeatures);
      if (prevPage) setPage(prevPage);
      if (prevSelectedAgent) setSelectedAgent(prevSelectedAgent);
      toast({ title: "Failed to delete feature", variant: "destructive" });
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

        {/* Feature Creation Input */}
        {showFeatureInput ? (
          <Card className="mb-4 rounded-2xl bg-card border border-border p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Create a feature with AI</h3>
              </div>
              <div className="flex gap-2">
                <Input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCreateFeature();
                    }
                  }}
                  placeholder="e.g. I want a todo feature with add, edit, delete and AI productivity insights"
                  className="rounded-xl flex-1"
                  disabled={creatingFeature}
                />
                <Button
                  onClick={handleCreateFeature}
                  disabled={!featureInput.trim() || creatingFeature}
                  className="rounded-xl"
                >
                  {creatingFeature ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowFeatureInput(false);
                    setFeatureInput("");
                  }}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="mb-4">
            <Button
              onClick={() => setShowFeatureInput(true)}
              variant="outline"
              className="rounded-xl gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Create a feature with AI
            </Button>
          </div>
        )}

        {/* Features List */}
        {features.length > 0 && (
          <div className="mb-4 space-y-4">
            {features.map((feature) => (
              <FeatureRenderer
                key={feature._id}
                feature={feature}
                onDeleteFeature={() => handleDeleteFeature(feature)}
              />
            ))}
          </div>
        )}

        {/* Sample Feature Plans (preview only) */}
        {features.length === 0 && (
          <div className="mb-4 space-y-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Sample AI Feature Plans
            </div>
            {sampleFeatures.map((feature) => (
              <FeatureRenderer key={feature._id} feature={feature} />
            ))}
          </div>
        )}

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
                      // Messages will be reloaded for this agent via useEffect (per-agent chat history)
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
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{selectedAgent.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedAgent.config?.role || "AI Assistant"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      if (!pageId || !selectedAgent?._id) return;
                      if (!confirm(`Clear chat history with ${selectedAgent.name}? This cannot be undone.`)) return;
                      try {
                        await clearAgentMessages(pageId, selectedAgent._id);
                        setMessages([]);
                        toast({ title: "Chat history cleared" });
                      } catch (err) {
                        toast({ title: "Failed to clear chat", variant: "destructive" });
                      }
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Clear Chat
                  </Button>
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
                            <span className="text-xs opacity-70 mt-1 block">
                              {msg.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
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
