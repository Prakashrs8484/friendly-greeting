// src/lib/api.ts
// Notes CRUD API and AI features using centralized apiService

import { apiRequest, apiBlobRequest, API_BASE as BASE } from "./apiService";

export { API_BASE } from "./apiService";

// ========== Notes CRUD ==========

export async function fetchNotes() {
  return apiRequest("/api/notes/all");
}

export async function createNoteApi(payload: {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}) {
  return apiRequest("/api/notes/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateNoteApi(
  id: string,
  payload: Partial<{ title: string; content: string; category: string; tags: string[] }>
) {
  return apiRequest(`/api/notes/update/${id}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteNoteApi(id: string) {
  return apiRequest(`/api/notes/delete/${id}`, { method: "DELETE" });
}

export async function getNoteApi(id: string) {
  return apiRequest(`/api/notes/${id}`);
}

export async function searchNotesApi(query: string) {
  return apiRequest("/api/notes/search", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

// ========== AI Note Features ==========

export async function improveGrammarApi(text: string): Promise<{ improved: string }> {
  return apiRequest("/api/notes/improve", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function paraphraseNoteApi(text: string): Promise<{ paraphrased: string }> {
  return apiRequest("/api/notes/paraphrase", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function textToSpeechApi(text: string): Promise<Blob> {
  return apiBlobRequest("/api/notes/tts", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}
