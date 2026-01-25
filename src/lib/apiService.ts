// src/lib/apiService.ts
// Centralized API service with auth handling, error normalization, and 401 redirect

export const API_BASE = import.meta.env.VITE_API_BASE || "";

function getToken(): string | null {
  return localStorage.getItem("token");
}

function clearAuthAndRedirect(): void {
  localStorage.removeItem("token");
  // Only redirect if not already on auth page
  if (window.location.pathname !== "/auth") {
    window.location.href = "/auth";
  }
}

export class ApiError extends Error {
  status: number;
  statusText: string;

  constructor(status: number, statusText: string, message: string) {
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) || {}),
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(API_BASE + path, { ...opts, headers });

    if (res.status === 401) {
      clearAuthAndRedirect();
      throw new ApiError(401, "Unauthorized", "Session expired. Please log in again.");
    }

    if (!res.ok) {
      const body = await res.text();
      throw new ApiError(res.status, res.statusText, body || `API Error: ${res.status}`);
    }

    // Handle empty responses
    const text = await res.text();
    if (!text) return {} as T;
    
    try {
      return JSON.parse(text);
    } catch {
      return text as unknown as T;
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;
    
    // Network error
    throw new ApiError(0, "Network Error", "Unable to connect to server. Please check your connection.");
  }
}

// Form data request (for file uploads like STT)
export async function apiFormRequest<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(API_BASE + path, {
      method: "POST",
      headers,
      body: formData,
    });

    if (res.status === 401) {
      clearAuthAndRedirect();
      throw new ApiError(401, "Unauthorized", "Session expired. Please log in again.");
    }

    if (!res.ok) {
      const body = await res.text();
      throw new ApiError(res.status, res.statusText, body || `API Error: ${res.status}`);
    }

    return res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, "Network Error", "Unable to connect to server.");
  }
}

// Blob request (for TTS audio)
export async function apiBlobRequest(
  path: string,
  opts: RequestInit = {}
): Promise<Blob> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) || {}),
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(API_BASE + path, { ...opts, headers });

    if (res.status === 401) {
      clearAuthAndRedirect();
      throw new ApiError(401, "Unauthorized", "Session expired. Please log in again.");
    }

    if (!res.ok) {
      const body = await res.text();
      throw new ApiError(res.status, res.statusText, body || `API Error: ${res.status}`);
    }

    return res.blob();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, "Network Error", "Unable to connect to server.");
  }
}
