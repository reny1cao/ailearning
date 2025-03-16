import { useState, useRef, useEffect } from "react";
import logger from "../lib/logger";

interface UseVoiceInputProps {
  onTranscript: (text: string) => void;
  isDisabled?: boolean;
  lang?: string;
}

interface UseVoiceInputResult {
  isRecording: boolean;
  startVoiceInput: () => void;
  stopVoiceInput: () => void;
  error: string | null;
}

/**
 * Custom hook for handling voice input using browser's speech recognition API
 */
export function useVoiceInput({
  onTranscript,
  isDisabled = false,
  lang = "en-US",
}: UseVoiceInputProps): UseVoiceInputResult {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Cleanup when component unmounts or when disabled changes
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          // Ignore errors when stopping on unmount
        }
      }
    };
  }, []);

  // Reset when disabled changes
  useEffect(() => {
    if (isDisabled && isRecording) {
      stopVoiceInput();
    }
  }, [isDisabled]);

  // Start recording voice input
  const startVoiceInput = () => {
    if (isDisabled || isRecording) return;
    
    try {
      setError(null);
      
      // Check if Speech Recognition is available
      // @ts-ignore - SpeechRecognition may not be in the types
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = lang;

        recognitionRef.current.onstart = () => {
          setIsRecording(true);
          onTranscript("Listening...");
          logger.debug("Voice recording started");
        };

        recognitionRef.current.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join("");

          onTranscript(transcript);
          logger.debug("Voice transcript:", transcript);
        };

        recognitionRef.current.onerror = (event: any) => {
          logger.error("Speech recognition error", event.error);
          setError(event.error);
          setIsRecording(false);
          
          if (event.error === "not-allowed") {
            onTranscript("Microphone access denied. Please check your browser settings.");
          } else if (event.error === "network") {
            onTranscript("Network error. Please check your connection.");
          } else if (event.error === "no-speech") {
            onTranscript(""); // Clear the transcript if no speech detected
          } else {
            onTranscript("");
          }
        };

        recognitionRef.current.onend = () => {
          logger.debug("Voice recording ended");
          setIsRecording(false);
        };

        recognitionRef.current.start();
      } else {
        setError("Speech recognition not supported in this browser");
        onTranscript("Voice input is not supported in your browser");
        logger.error("Speech recognition not supported");
      }
    } catch (err) {
      logger.error("Error starting speech recognition", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsRecording(false);
    }
  };

  // Stop recording voice input
  const stopVoiceInput = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        logger.debug("Stopping voice recording");
      } catch (err) {
        logger.error("Error stopping speech recognition", err);
      }
    }
    setIsRecording(false);
  };

  return {
    isRecording,
    startVoiceInput,
    stopVoiceInput,
    error,
  };
}

export default useVoiceInput; 