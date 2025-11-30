// src/hooks/useNoteAI.ts
import { useState, useRef, useCallback } from "react";
import { improveGrammarApi, paraphraseNoteApi, textToSpeechApi } from "@/lib/api";

export function useNoteAI() {
  const [improving, setImproving] = useState(false);
  const [paraphrasing, setParaphrasing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const improveGrammar = useCallback(async (text: string): Promise<string> => {
    if (!text.trim()) throw new Error("No content to improve");
    setImproving(true);
    try {
      const result = await improveGrammarApi(text);
      return result.improved;
    } finally {
      setImproving(false);
    }
  }, []);

  const paraphrase = useCallback(async (text: string): Promise<string> => {
    if (!text.trim()) throw new Error("No content to paraphrase");
    setParaphrasing(true);
    try {
      const result = await paraphraseNoteApi(text);
      return result.paraphrased;
    } finally {
      setParaphrasing(false);
    }
  }, []);

  const readAloud = useCallback(async (text: string): Promise<void> => {
    if (!text.trim()) throw new Error("No content to read");
    
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    setTtsLoading(true);
    try {
      const blob = await textToSpeechApi(text);
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onplay = () => setPlaying(true);
      audio.onended = () => {
        setPlaying(false);
        URL.revokeObjectURL(url);
        audioUrlRef.current = null;
      };
      audio.onerror = () => {
        setPlaying(false);
        URL.revokeObjectURL(url);
        audioUrlRef.current = null;
      };
      
      await audio.play();
    } finally {
      setTtsLoading(false);
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    }
  }, []);

  return {
    improving,
    paraphrasing,
    ttsLoading,
    playing,
    improveGrammar,
    paraphrase,
    readAloud,
    stopAudio,
  };
}
