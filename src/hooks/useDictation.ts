// src/hooks/useDictation.ts
import { useState, useRef, useCallback } from "react";
import { apiFormRequest } from "@/lib/apiService";

interface UseDictationOptions {
  onTranscription: (text: string) => void;
  onError: (error: string) => void;
  onSuccess?: () => void;
}

interface TranscriptionResponse {
  text?: string;
  transcription?: string;
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

  const sendAudioForTranscription = useCallback(
    async (audioBlob: Blob) => {
      setIsProcessing(true);

      try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        const data = await apiFormRequest<TranscriptionResponse>(
          "/api/notes/speech-to-text",
          formData
        );

        const transcribedText = data.text || data.transcription || "";

        if (transcribedText) {
          onTranscription(transcribedText);
          onSuccess?.();
        } else {
          onError("No transcription returned. Please try again.");
        }
      } catch (err: unknown) {
        console.error("Transcription error:", err);
        const message = err instanceof Error ? err.message : "Transcription failed. Please try again.";
        onError(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [onTranscription, onError, onSuccess]
  );

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
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        onError("Microphone permission denied. Please allow microphone access.");
      } else {
        onError("Failed to start recording. Please try again.");
      }
      console.error("Recording error:", err);
    }
  }, [checkSupport, onError, sendAudioForTranscription]);

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

  return {
    isRecording,
    isProcessing,
    isSupported,
    toggleRecording,
    startRecording,
    stopRecording,
  };
}
