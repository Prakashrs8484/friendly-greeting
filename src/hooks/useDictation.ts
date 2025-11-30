import { useState, useRef, useCallback } from "react";
import { API_BASE } from "@/lib/api";

interface UseDictationOptions {
  onTranscription: (text: string) => void;
  onError: (error: string) => void;
  onSuccess?: () => void;
}

export function useDictation({ onTranscription, onError, onSuccess }: UseDictationOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const checkSupport = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      return false;
    }
    if (typeof MediaRecorder === "undefined") {
      setIsSupported(false);
      return false;
    }
    return true;
  }, []);

  const startRecording = useCallback(async () => {
    if (!checkSupport()) {
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
        
        if (audioBlob.size === 0) {
          onError("No audio recorded. Please try again.");
          setIsRecording(false);
          return;
        }

        await sendAudioForTranscription(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        onError("Microphone permission denied. Please allow microphone access.");
      } else {
        onError("Failed to start recording. Please try again.");
      }
      console.error("Recording error:", err);
    }
  }, [checkSupport, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const token = localStorage.getItem("token");
      
      const response = await fetch(`${API_BASE}/api/notes/speech-to-text`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Transcription failed: ${errorText}`);
      }

      const data = await response.json();
      const transcribedText = data.text || data.transcription || "";

      if (transcribedText) {
        onTranscription(transcribedText);
        onSuccess?.();
      } else {
        onError("No transcription returned. Please try again.");
      }
    } catch (err: any) {
      console.error("Transcription error:", err);
      onError(err.message || "Transcription failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isRecording,
    isProcessing,
    isSupported,
    toggleRecording,
    startRecording,
    stopRecording,
  };
}
