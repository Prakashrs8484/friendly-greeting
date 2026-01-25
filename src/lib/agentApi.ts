// src/lib/agentApi.ts
// Agent API functions using centralized apiService

import { apiRequest } from "./apiService";

export interface AgentQueryResponse {
  reply: string;
  usedMemories?: Array<{
    id: string;
    type: string;
    title: string;
    excerpt: string;
  }>;
  savedMemory?: unknown;
}

export interface AgentMemory {
  id: string;
  type: string;
  title: string;
  content: string;
  excerpt: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Send query to the AI agent
export async function agentQueryApi(
  query: string,
  topK: number = 5
): Promise<AgentQueryResponse> {
  return apiRequest("/api/agent/query", {
    method: "POST",
    body: JSON.stringify({ query, topK }),
  });
}

// Update live draft (debounced from frontend)
export async function updateLiveDraftApi(
  text: string
): Promise<{ success: boolean }> {
  return apiRequest("/api/agent/live", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

// Get all memories
export async function getMemoriesApi(): Promise<AgentMemory[]> {
  return apiRequest("/api/agent/memories");
}

// Search memories/notes
export async function searchMemoriesApi(query: string): Promise<AgentMemory[]> {
  return apiRequest("/api/agent/search", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}
