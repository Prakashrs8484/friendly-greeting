import { apiRequest } from "./apiService";

export interface AgentPage {
  _id: string;
  name: string;
  description: string;
  icon: string;
  ownerId: string;
  pageConfig: Record<string, unknown>;
  agents: Agent[];
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  _id: string;
  pageId: string;
  name: string;
  description: string;
  config: {
    role?: string;
    tone?: string;
    creativity?: number;
    verbosity?: number;
    memoryEnabled?: boolean;
  };
  memory: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentPagePayload {
  name: string;
  description: string;
  icon: string;
  pageConfig?: Record<string, unknown>;
}

export interface CreateAgentPayload {
  name: string;
  description?: string;
  config: {
    role: string;
    tone: string;
    creativity: number;
    verbosity: number;
    memoryEnabled: boolean;
  };
}

export interface AgentExecutionResponse {
  reply: string;
  executionId?: string;
}

// Agent Pages CRUD
export const getAgentPages = () =>
  apiRequest<AgentPage[]>("/api/agent-pages");

export const getAgentPage = (pageId: string) =>
  apiRequest<AgentPage>(`/api/agent-pages/${pageId}`);

export const createAgentPage = (data: CreateAgentPagePayload) =>
  apiRequest<AgentPage>("/api/agent-pages", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateAgentPage = (pageId: string, data: Partial<CreateAgentPagePayload>) =>
  apiRequest<AgentPage>(`/api/agent-pages/${pageId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteAgentPage = (pageId: string) =>
  apiRequest<{ message: string }>(`/api/agent-pages/${pageId}`, {
    method: "DELETE",
  });

// Agents inside pages
export const getAgents = (pageId: string) =>
  apiRequest<Agent[]>(`/api/agent-pages/${pageId}/agents`);

export const createAgent = (pageId: string, data: CreateAgentPayload) =>
  apiRequest<Agent>(`/api/agent-pages/${pageId}/agents`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const executeAgent = (pageId: string, agentId: string, query: string) =>
  apiRequest<AgentExecutionResponse>(
    `/api/agent-pages/${pageId}/agents/${agentId}/execute`,
    {
      method: "POST",
      body: JSON.stringify({ query }),
    }
  );

export const getExecutionHistory = (pageId: string, agentId: string) =>
  apiRequest<Array<{ query: string; reply: string; createdAt: string }>>(
    `/api/agent-pages/${pageId}/agents/${agentId}/history`
  );
