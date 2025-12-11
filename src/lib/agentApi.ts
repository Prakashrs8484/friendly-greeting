// src/lib/agentApi.ts - Agent API functions
const API_BASE = import.meta.env.VITE_API_BASE || "";

function getToken() {
  return localStorage.getItem("token");
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) || {}),
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...opts, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status} ${res.statusText} - ${body}`);
  }
  return res.json();
}

export interface AgentQueryResponse {
  reply: string;
  usedMemories?: Array<{
    id: string;
    type: string;
    title: string;
    excerpt: string;
  }>;
  savedMemory?: any;
}

export interface AgentMemory {
  id: string;
  type: string;
  title: string;
  content: string;
  excerpt: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Send query to the AI agent
export async function agentQueryApi(query: string, topK: number = 5): Promise<AgentQueryResponse> {
  return request("/api/agent/query", {
    method: "POST",
    body: JSON.stringify({ query, topK }),
  });
}

// Update live draft (debounced from frontend)
export async function updateLiveDraftApi(text: string): Promise<{ success: boolean }> {
  return request("/api/agent/live", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

// Get all memories
export async function getMemoriesApi(): Promise<AgentMemory[]> {
  return request("/api/agent/memories");
}

// Search memories/notes
export async function searchMemoriesApi(query: string): Promise<AgentMemory[]> {
  return request("/api/agent/search", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}
