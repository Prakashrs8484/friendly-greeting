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
  metadata?: {
    latency?: number;
    source?: string;
    tools?: string[];
    tokens?: number;
  };
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

export const updateAgent = (pageId: string, agentId: string, data: Partial<CreateAgentPayload>) =>
  apiRequest<Agent>(`/api/agent-pages/${pageId}/agents/${agentId}`, {
    method: "PUT",
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

export type SectionVariant = "compact" | "detailed" | "minimal";

export type SectionComponentType =
  | "form"
  | "list"
  | "table"
  | "kanban"
  | "calendar"
  | "timeline"
  | "chart-bar"
  | "chart-line"
  | "chart-pie"
  | "kpi-grid"
  | "tabs"
  | "accordion"
  | "progressTracker"
  | "comparisonTable"
  | "filterBar"
  | "tagSelector"
  | "streakTracker"
  | "metricBoard"
  | "insightPanel"
  | "recommendationCards"
  | "nextStepPlanner"
  | "anomalyAlerts"
  | "semanticFilterRail"
  | "decisionPlaybook"
  | "chart"
  | "summaryCard";

export interface LayoutSchema {
  type: "grid" | "dashboard" | "vertical" | "sidebar";
  columns?: number;
}

export interface FeatureFieldSchema {
  name: string;
  type: "text" | "number" | "date" | "time" | "select" | "textarea";
  label: string;
  required?: boolean;
  options?: Array<string | { label: string; value: string }>;
}

export interface FeatureSectionSchema {
  id: string;
  component: SectionComponentType | string;
  variant?: SectionVariant;
  label: string;
  description?: string;
  fields?: FeatureFieldSchema[] | string[];
  props?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PageBlueprint {
  featureName?: string;
  description?: string;
  layout?: LayoutSchema | "grid" | "dashboard" | "vertical" | "sidebar";
  sections?: FeatureSectionSchema[];
  dataModel?: string[];
  aiCapabilities?: string[];
}

// Feature types
export interface Feature {
  _id: string;
  pageId: string;
  name: string;
  description: string;
  type?: "todo" | "notes" | "advice" | "tracker" | "insights" | "ideas" | "research-tracker" | "custom";
  category?: "functional" | "chat";
  uiConfig?: {
    layout: "crud" | "input-output" | "list" | "dashboard" | "custom";
    components: string[];
    actions: string[];
  };
  config?: Record<string, unknown>;
  pageBlueprint?: PageBlueprint | null;
  featurePlan?: FeaturePlan | null;
  agentIds: Agent[];
  originalInput: string;
  schemaVersion?: string; // e.g., "1.0" for forward compatibility tracking
  createdAt: string;
  updatedAt: string;
}

export interface FeaturePlan {
  _id?: string;
  pageId?: string;
  featureName: string;
  type?: "ideas" | "todo" | "notes" | "planner" | "analytics" | "decision" | string;
  description: string;
  layout?: string | LayoutSchema;
  sections: FeatureSectionSchema[];
  dataModel: string[];
  aiCapabilities: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFeaturePayload {
  input: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown; // Allow endpoints to include additional metadata
}

export interface CreateFeatureResponse extends ApiResponse<{ featureId: string; feature: Feature }> {
  featureId: string;
  feature: Feature;
}

export interface GetPageFeaturesResponse extends ApiResponse<Feature[]> {
  features: Feature[];
}

export interface DeleteFeatureResponse extends ApiResponse<void> {}

export interface ExecuteAgentResponse extends ApiResponse<{ response: string; executionId?: string; metadata?: Record<string, unknown> }> {
  response: string;
  executionId?: string;
  metadata?: Record<string, unknown>;
}

// Feature endpoints
export const createFeature = (pageId: string, data: CreateFeaturePayload) =>
  apiRequest<CreateFeatureResponse>(`/api/agent-pages/${pageId}/features`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const materializeFeatureFromPlan = (pageId: string, plan: FeaturePlan) =>
  apiRequest<CreateFeatureResponse>(`/api/agent-pages/${pageId}/features/materialize-plan`, {
    method: "POST",
    body: JSON.stringify({ plan }),
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
export const getFeaturePlans = async (pageId: string) => {
  const response = await apiRequest<{ success: boolean; featurePlans: Array<FeaturePlan & { ui?: FeatureSectionSchema[] }> }>(
    `/api/agent-pages/${pageId}/feature-plans`
  );

  return {
    ...response,
    featurePlans: (response.featurePlans || []).map((plan) => ({
      ...plan,
      sections: Array.isArray(plan.sections)
        ? plan.sections
        : (Array.isArray(plan.ui) ? plan.ui : []),
      layout:
        plan.layout && typeof plan.layout === "object"
          ? plan.layout
          : { type: "vertical" as const },
    })),
  };
};

export const generateFeaturePlan = (pageId: string, prompt: string) =>
  apiRequest<{ success: boolean; featurePlan: FeaturePlan }>(
    `/api/agent-pages/${pageId}/feature-plans/generate`,
    {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }
  );

export const createFeaturePlan = (pageId: string, plan: FeaturePlan) =>
  apiRequest<{ success: boolean; featurePlan: FeaturePlan }>(
    `/api/agent-pages/${pageId}/feature-plans`,
    {
      method: "POST",
      body: JSON.stringify(plan),
    }
  );

// Workspace aggregate endpoint
export interface WorkspaceData {
  page: AgentPage;
  agents: Agent[];
  features: Feature[];
  featurePlans: FeaturePlan[];
  featureDataMap: Record<string, Array<{ _id: string; featureType: string; itemCount: number; aiSummary: string; updatedAt: string }>>;
}

export interface WorkspaceResponse extends ApiResponse<WorkspaceData> {
  data: WorkspaceData;
}

/** Load complete workspace data in one request to reduce race conditions and sequential fetches */
export const getWorkspaceData = (pageId: string) =>
  apiRequest<WorkspaceResponse>(`/api/agent-pages/${pageId}/workspace`);
