// src/lib/noteAiApi.ts
// Advanced Note AI APIs using centralized apiService

import { apiRequest } from "./apiService";

// ========== Writer Tools ==========

export type RewriteMode =
  | "poetic"
  | "cinematic"
  | "professional"
  | "humorous"
  | "emotional"
  | "minimalist"
  | "dramatic"
  | "shakespearean"
  | "simple"
  | "expanded";

export async function rewriteNoteApi(
  text: string,
  mode: RewriteMode
): Promise<{ rewritten: string }> {
  return apiRequest("/api/notes/rewrite", {
    method: "POST",
    body: JSON.stringify({ text, mode }),
  });
}

export async function expandThoughtApi(text: string): Promise<{ expanded: string }> {
  return apiRequest("/api/notes/expand", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function sceneBuilderApi(
  location: string,
  mood: string
): Promise<{ scene: string }> {
  return apiRequest("/api/notes/scene", {
    method: "POST",
    body: JSON.stringify({ location, mood }),
  });
}

export async function characterBuilderApi(
  description: string
): Promise<{ character: object }> {
  return apiRequest("/api/notes/character", {
    method: "POST",
    body: JSON.stringify({ description }),
  });
}

export type DialogueStyle =
  | "natural"
  | "emotional"
  | "romantic"
  | "dramatic"
  | "comedic"
  | "formal"
  | "aggressive"
  | "mysterious";

export async function dialogueEnhancerApi(
  text: string,
  style: DialogueStyle
): Promise<{ enhanced: string }> {
  return apiRequest("/api/notes/dialogue", {
    method: "POST",
    body: JSON.stringify({ text, style }),
  });
}

export type IdeaMode =
  | "story"
  | "poem"
  | "article"
  | "youtube"
  | "motivational"
  | "romantic";

export async function ideaGeneratorApi(
  mode: IdeaMode,
  topic?: string
): Promise<{ ideas: string | string[] }> {
  return apiRequest("/api/notes/idea", {
    method: "POST",
    body: JSON.stringify({ mode, topic }),
  });
}

// ========== Productivity Tools ==========

export async function structureDocumentApi(
  text: string
): Promise<{ structured: string }> {
  return apiRequest("/api/notes/structure", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function bulletExtractorApi(text: string): Promise<{ bullets: string[] }> {
  return apiRequest("/api/notes/bullets", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

// ActionItem interface - flexible to handle various backend response shapes
export interface ActionItem {
  action?: string;
  task?: string;
  text?: string;
  owner?: string;
  due?: string;
  deadline?: string;
}

export async function actionItemsApi(text: string): Promise<{ actions: ActionItem[] }> {
  return apiRequest("/api/notes/actions", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function academicImproveApi(text: string): Promise<{ improved: string }> {
  return apiRequest("/api/notes/improve-academic", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function argumentStrengthenerApi(
  text: string
): Promise<{ strengthened: string }> {
  return apiRequest("/api/notes/strengthen", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function compareTextsApi(textA: string, textB: string): Promise<string> {
  const result = await apiRequest<{ comparison?: string }>("/api/notes/compare", {
    method: "POST",
    body: JSON.stringify({ textA, textB }),
  });
  return result.comparison || "";
}

export async function autoTitleApi(text: string): Promise<{ title: string }> {
  return apiRequest("/api/notes/auto-title", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function autoTagsApi(text: string): Promise<{ tags: string[] }> {
  return apiRequest("/api/notes/auto-tags", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function outlineGeneratorApi(text: string): Promise<{ outline: string }> {
  return apiRequest("/api/notes/outline", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
