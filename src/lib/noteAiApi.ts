// src/lib/noteAiApi.ts
import { API_BASE } from "./api";

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

// Writer Tools
export type RewriteMode = 
  | "poetic" | "cinematic" | "professional" | "humorous" | "emotional"
  | "minimalist" | "dramatic" | "shakespearean" | "simple" | "expanded";

export async function rewriteNoteApi(text: string, mode: RewriteMode): Promise<{ rewritten: string }> {
  return request("/api/notes/rewrite", { method: "POST", body: JSON.stringify({ text, mode }) });
}

export async function expandThoughtApi(text: string): Promise<{ expanded: string }> {
  return request("/api/notes/expand", { method: "POST", body: JSON.stringify({ text }) });
}

export async function sceneBuilderApi(location: string, mood: string): Promise<{ scene: string }> {
  return request("/api/notes/scene", { method: "POST", body: JSON.stringify({ location, mood }) });
}

export async function characterBuilderApi(description: string): Promise<{ character: object }> {
  return request("/api/notes/character", { method: "POST", body: JSON.stringify({ description }) });
}

export type DialogueStyle = 
  | "natural" | "emotional" | "romantic" | "dramatic"
  | "comedic" | "formal" | "aggressive" | "mysterious";

export async function dialogueEnhancerApi(text: string, style: DialogueStyle): Promise<{ enhanced: string }> {
  return request("/api/notes/dialogue", { method: "POST", body: JSON.stringify({ text, style }) });
}

export type IdeaMode = "story" | "poem" | "article" | "youtube" | "motivational" | "romantic";

export async function ideaGeneratorApi(mode: IdeaMode, topic?: string): Promise<{ ideas: string[] }> {
  return request("/api/notes/idea", { method: "POST", body: JSON.stringify({ mode, topic }) });
}

// Productivity Tools
export async function structureDocumentApi(text: string): Promise<{ structured: string }> {
  return request("/api/notes/structure", { method: "POST", body: JSON.stringify({ text }) });
}

export async function bulletExtractorApi(text: string): Promise<{ bullets: string[] }> {
  return request("/api/notes/bullets", { method: "POST", body: JSON.stringify({ text }) });
}

export interface ActionItem {
  action: string;
  owner?: string;
  deadline?: string;
}

export async function actionItemsApi(text: string): Promise<{ actions: ActionItem[] }> {
  return request("/api/notes/actions", { method: "POST", body: JSON.stringify({ text }) });
}

export async function academicImproveApi(text: string): Promise<{ improved: string }> {
  return request("/api/notes/improve-academic", { method: "POST", body: JSON.stringify({ text }) });
}

export async function argumentStrengthenerApi(text: string): Promise<{ strengthened: string }> {
  return request("/api/notes/strengthen", { method: "POST", body: JSON.stringify({ text }) });
}

export interface CompareResult {
  differences: string[];
  similarities: string[];
  improvements: string[];
}

export async function compareTextsApi(textA: string, textB: string): Promise<CompareResult> {
  return request("/api/notes/compare", { method: "POST", body: JSON.stringify({ textA, textB }) });
}

export async function autoTitleApi(text: string): Promise<{ title: string }> {
  return request("/api/notes/auto-title", { method: "POST", body: JSON.stringify({ text }) });
}

export async function autoTagsApi(text: string): Promise<{ tags: string[] }> {
  return request("/api/notes/auto-tags", { method: "POST", body: JSON.stringify({ text }) });
}

export async function outlineGeneratorApi(text: string): Promise<{ outline: string }> {
  return request("/api/notes/outline", { method: "POST", body: JSON.stringify({ text }) });
}
