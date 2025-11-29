// src/hooks/useNotes.ts
import { useEffect, useState, useCallback } from "react";
import { fetchNotes, createNoteApi, updateNoteApi, deleteNoteApi, getNoteApi } from "@/lib/api";

export interface NoteDTO {
  _id?: string;
  id?: string; // fallback
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  summary?: string;
  emotion?: { label: string; score: number };
}

export function useNotes() {
  const [notes, setNotes] = useState<NoteDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNotes();
      // normalize _id -> id
      const normalized: NoteDTO[] = res.map((n: any) => ({
        ...n,
        id: n._id || n.id,
      }));
      setNotes(normalized);
    } catch (err: any) {
      setError(err.message || "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const createNote = useCallback(async (payload: { title: string; content: string; category?: string; tags?: string[] }) => {
    setError(null);
    try {
      const created = await createNoteApi(payload);
      // normalize and add to state
      setNotes(n => [{ ...created, id: created._id || created.id }, ...n]);
      return created;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const updateNote = useCallback(async (id: string, payload: any) => {
    setError(null);
    try {
      const updated = await updateNoteApi(id, payload);
      setNotes(n => n.map(x => (x.id === id || x._id === id ? { ...updated, id: updated._id || updated.id } : x)));
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const removeNote = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteNoteApi(id);
      setNotes(n => n.filter(x => !(x.id === id || x._id === id)));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const refreshOne = useCallback(async (id: string) => {
    setError(null);
    try {
      const note = await getNoteApi(id);
      setNotes(n => n.map(x => (x.id === id || x._id === id ? { ...note, id: note._id || note.id } : x)));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return { notes, loading, error, load, createNote, updateNote, removeNote, refreshOne };
}
