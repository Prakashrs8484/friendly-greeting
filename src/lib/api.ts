// src/lib/api.ts
// Notes CRUD API and AI features using centralized apiService

import { apiRequest, apiBlobRequest } from "./apiService";

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
  // Backend uses PUT /api/notes/:id for updates
  return apiRequest(`/api/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteNoteApi(id: string) {
  // Backend uses DELETE /api/notes/:id
  return apiRequest(`/api/notes/${id}`, { method: "DELETE" });
}

export async function getNoteApi(id: string) {
  return apiRequest(`/api/notes/${id}`);
}

export async function searchNotesApi(query: string) {
  // No dedicated search endpoint - filter client-side from all notes
  const notes = await fetchNotes();
  if (!Array.isArray(notes)) return [];
  const q = query.toLowerCase();
  return notes.filter((n: { title?: string; content?: string; tags?: string[] }) =>
    n.title?.toLowerCase().includes(q) ||
    n.content?.toLowerCase().includes(q) ||
    n.tags?.some((t: string) => t.toLowerCase().includes(q))
  );
}

// ========== AI Note Features ==========

export async function improveGrammarApi(text: string): Promise<{ improved: string }> {
  try {
    // Try noteAi improve route first
    return await apiRequest("/api/notes/improve", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  } catch (err: unknown) {
    // Fallback: use rewrite endpoint as alternative
    if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 404) {
      const result = await apiRequest<{ rewritten: string }>("/api/notes/rewrite", {
        method: "POST",
        body: JSON.stringify({ content: text, style: "professional" }),
      });
      return { improved: result.rewritten || text };
    }
    throw err;
  }
}

export async function paraphraseNoteApi(text: string): Promise<{ paraphrased: string }> {
  try {
    return await apiRequest("/api/notes/paraphrase", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  } catch (err: unknown) {
    // Fallback: use rewrite endpoint
    if (err && typeof err === "object" && "status" in err && (err as { status: number }).status === 404) {
      const result = await apiRequest<{ rewritten: string }>("/api/notes/rewrite", {
        method: "POST",
        body: JSON.stringify({ content: text, style: "casual" }),
      });
      return { paraphrased: result.rewritten || text };
    }
    throw err;
  }
}

export async function textToSpeechApi(text: string): Promise<Blob> {
  try {
    return await apiBlobRequest("/api/notes/tts", {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  } catch (err: unknown) {
    // Graceful TTS failure - return empty audio blob instead of crashing
    console.warn("TTS service unavailable:", err);
    // Return a minimal valid audio blob to prevent UI crash
    return new Blob([], { type: "audio/mp3" });
  }
}
