// src/hooks/useLiveDraftSync.ts
import { useEffect, useRef, useCallback } from "react";
import { updateLiveDraftApi } from "@/lib/agentApi";

interface UseLiveDraftSyncOptions {
  enabled?: boolean;
  debounceMs?: number;
}

export function useLiveDraftSync(
  content: string,
  options: UseLiveDraftSyncOptions = {}
) {
  const { enabled = true, debounceMs = 2000 } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedRef = useRef<string>("");

  const syncDraft = useCallback(async (text: string) => {
    if (!text.trim() || text === lastSyncedRef.current) return;
    
    try {
      await updateLiveDraftApi(text);
      lastSyncedRef.current = text;
    } catch (err) {
      console.error("Failed to sync live draft:", err);
    }
  }, []);

  useEffect(() => {
    if (!enabled || !content.trim()) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new debounced sync
    timeoutRef.current = setTimeout(() => {
      syncDraft(content);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, enabled, debounceMs, syncDraft]);

  // Force sync on unmount if there's unsaved content
  useEffect(() => {
    return () => {
      if (content.trim() && content !== lastSyncedRef.current) {
        syncDraft(content);
      }
    };
  }, []);

  return {
    syncNow: () => syncDraft(content),
  };
}
