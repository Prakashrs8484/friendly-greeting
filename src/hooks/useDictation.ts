import { useState, useRef, useCallback } from "react";
import { API_BASE } from "@/lib/api";

interface UseDictationOptions {
  onTranscription: (text: string) => void;
  onError: (error: string) => void;
}

interface UseDictationReturn {
  isRecording: boolean;
  isProcessing: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  isSupported: boolean;
}

export function useDictation({ onTranscription, onError }: UseDictationOptions): UseDictationReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const isSupported = typeof window !== "undefined" && 
    "MediaRecorder" in window && 
    "mediaDevices" in navigator;

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      onError("Microphone not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "audio/ogg";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        
        if (audioBlob.size < 100) {
          onError("Recording too short. Please try again.");
          return;
        }

        await sendAudioForTranscription(audioBlob);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          onError("Microphone permission denied. Please allow access.");
        } else if (err.name === "NotFoundError") {
          onError("No microphone found on this device.");
        } else {
          onError(`Recording error: ${err.message}`);
        }
      }
    }
  }, [isSupported, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}/api/notes/speech-to-text`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Transcription failed (${response.status})`);
      }

      const data = await response.json();
      const transcribedText = data.text || data.transcription || "";
      
      if (transcribedText) {
        onTranscription(transcribedText);
      } else {
        onError("No speech detected. Please try again.");
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    isSupported,
  };
}
