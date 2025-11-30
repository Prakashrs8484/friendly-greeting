// src/lib/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE || ""; // e.g. http://localhost:4000

function getToken() {
  return localStorage.getItem("token"); // or your auth store
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string,string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string,string>) || {})
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

export async function fetchNotes() {
  return request("/api/notes/all");
}

export async function createNoteApi(payload: { title: string; content: string; category?: string; tags?: string[] }) {
  return request("/api/notes/create", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateNoteApi(id: string, payload: Partial<{ title:string; content:string; category:string; tags:string[] }>) {
  return request(`/api/notes/update/${id}`, { method: "POST", body: JSON.stringify(payload) });
}

export async function deleteNoteApi(id: string) {
  return request(`/api/notes/delete/${id}`, { method: "DELETE" });
}

export async function getNoteApi(id: string) {
  return request(`/api/notes/${id}`);
}

export async function searchNotesApi(query: string) {
  return request("/api/notes/search", { method: "POST", body: JSON.stringify({ query }) });
}

// AI Note Features
export async function improveGrammarApi(text: string): Promise<{ improved: string }> {
  return request("/api/notes/improve", { method: "POST", body: JSON.stringify({ text }) });
}

export async function paraphraseNoteApi(text: string): Promise<{ paraphrased: string }> {
  return request("/api/notes/paraphrase", { method: "POST", body: JSON.stringify({ text }) });
}

export async function textToSpeechApi(text: string): Promise<Blob> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(API_BASE + "/api/notes/tts", {
    method: "POST",
    headers,
    body: JSON.stringify({ text }),
  });
  
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status} ${res.statusText} - ${body}`);
  }
  
  return res.blob();
}
