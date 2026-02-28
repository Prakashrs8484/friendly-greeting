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
  response: string;
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
      body: JSON.stringify({ input: query }),
    }
  );

export const getExecutionHistory = (pageId: string, agentId: string) =>
  apiRequest<Array<{ query: string; reply: string; createdAt: string }>>(
    `/api/agent-pages/${pageId}/agents/${agentId}/history`
  );

export interface PageMessage {
  _id: string;
  pageId: string;
  agentId: string | null;
  role: "user" | "agent";
  content: string;
  timestamp?: string;
  createdAt?: string;
}

export interface GetPageMessagesResponse {
  success: boolean;
  messages: PageMessage[];
}

/** Load messages: pass agentId to get only that agent's chat thread (for selected agent). Omit for all page messages. */
export const getPageMessages = (pageId: string, agentId?: string | null) => {
  const url = agentId
    ? `/api/agent-pages/${pageId}/messages?agentId=${encodeURIComponent(agentId)}`
    : `/api/agent-pages/${pageId}/messages`;
  return apiRequest<GetPageMessagesResponse>(url);
};

export const clearAgentMessages = (pageId: string, agentId: string) =>
  apiRequest<{ success: boolean; deletedCount: number; message: string }>(
    `/api/agent-pages/${pageId}/agents/${agentId}/messages`,
    { method: "DELETE" }
  );

export const clearPageMessages = (pageId: string) =>
  apiRequest<{ success: boolean; deletedCount: number; message: string }>(
    `/api/agent-pages/${pageId}/messages`,
    { method: "DELETE" }
  );

// Feature types
export interface Feature {
  _id: string;
  pageId: string;
  name: string;
  description: string;
  type: "todo" | "notes" | "advice" | "tracker" | "insights" | "ideas" | "research-tracker" | "custom";
  category?: "functional" | "chat";
  uiConfig: {
    layout: "crud" | "input-output" | "list" | "dashboard" | "custom";
    components: string[];
    actions: string[];
  };
  config: Record<string, unknown>;
  featurePlan?: FeaturePlan | null;
  agentIds: Agent[];
  originalInput: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturePlan {
  _id?: string;
  pageId?: string;
  featureName: string;
  type: "ideas" | "todo" | "notes" | "planner" | "analytics" | "decision" | string;
  description: string;
  ui: Array<{
    component: string;
    editable?: boolean;
    variant?: string;
  }>;
  dataModel: string[];
  aiCapabilities: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFeaturePayload {
  input: string;
}

export interface CreateFeatureResponse {
  success: boolean;
  featureId: string;
  message: string;
  feature: Feature;
}

export interface GetPageFeaturesResponse {
  success: boolean;
  features: Feature[];
}

// Feature endpoints
export const createFeature = (pageId: string, data: CreateFeaturePayload) =>
  apiRequest<CreateFeatureResponse>(`/api/agent-pages/${pageId}/features`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getPageFeatures = (pageId: string) =>
  apiRequest<GetPageFeaturesResponse | Feature[]>(`/api/agent-pages/${pageId}/features`);

export const deleteFeature = (pageId: string, featureId: string, deleteAgents?: boolean) =>
  apiRequest<{ message: string }>(
    `/api/agent-pages/${pageId}/features/${featureId}${deleteAgents ? "?deleteAgents=true" : ""}`,
    {
      method: "DELETE",
    }
  );

// Feature data endpoints
export interface FeatureData {
  _id: string;
  pageId: string;
  featureId: string;
  featureType: string;
  data: unknown[];
  aiSummary: string;
  updatedAt: string;
}

export interface FeatureInsights {
  insights: string[];
}

export const updateFeatureData = (pageId: string, featureId: string, data: unknown[]) =>
  apiRequest<{ success: boolean; featureData: FeatureData }>(
    `/api/agent-pages/${pageId}/features/${featureId}/data`,
    {
      method: "PUT",
      body: JSON.stringify({ data }),
    }
  );

export const getFeatureData = (pageId: string, featureId: string) =>
  apiRequest<{ success: boolean; featureData: FeatureData }>(
    `/api/agent-pages/${pageId}/features/${featureId}/data`
  );

export const getFeatureInsights = (pageId: string, featureId: string) =>
  apiRequest<{ success: boolean; insights: string[] }>(
    `/api/agent-pages/${pageId}/features/${featureId}/insights`
  );

// Feature plan endpoints
export const getFeaturePlans = (pageId: string) =>
  apiRequest<{ success: boolean; featurePlans: FeaturePlan[] }>(
    `/api/agent-pages/${pageId}/feature-plans`
  );

export const createFeaturePlan = (pageId: string, plan: FeaturePlan) =>
  apiRequest<{ success: boolean; featurePlan: FeaturePlan }>(
    `/api/agent-pages/${pageId}/feature-plans`,
    {
      method: "POST",
      body: JSON.stringify(plan),
    }
  );
