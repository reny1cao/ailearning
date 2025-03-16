import React, { useState, useRef, useEffect } from "react";
import {
  ArrowUp,
  Sparkles,
  SlidersHorizontal,
  Mic,
  MicOff,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { TeachingStyle } from "../../../types/shared";
import TeachingStyleSelector from "./TeachingStyleSelector";
import useVoiceInput from "../../../hooks/useVoiceInput";

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onStyleChange: (style: TeachingStyle) => void;
  currentStyle?: TeachingStyle;
  showStyleOptions?: boolean;
  onToggleStyleOptions?: () => void;
  onReset?: () => void;
  placeholder?: string;
}

/**
 * InputArea component for the AI Teacher Chat
 * Provides a text input area with teaching style options
 */
const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  isLoading,
  onStyleChange,
  currentStyle = "conversational",
  showStyleOptions = false,
  onToggleStyleOptions = () => {},
  onReset,
  placeholder = "Ask a question...",
}) => {
  // Local state
  const [inputText, setInputText] = useState("");
  const [inputRows, setInputRows] = useState(1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const maxRows = 5;

  // Voice input support
  const {
    isRecording,
    startVoiceInput,
    stopVoiceInput,
    error: voiceError,
  } = useVoiceInput({
    onTranscript: (text) => {
      if (text && text !== "Listening...") {
        setInputText(text);
      }
    },
    isDisabled: isLoading,
  });

  // Auto-resize textarea based on content
  useEffect(() => {
    if (!inputRef.current) return;

    // Reset to single row height
    inputRef.current.style.height = "auto";

    // Count newlines plus content overflow
    const lineCount = (inputText.match(/\n/g) || []).length + 1;
    const scrollHeight = inputRef.current.scrollHeight;
    const lineHeight =
      parseInt(getComputedStyle(inputRef.current).lineHeight) || 24;
    const calculatedRows = Math.ceil(scrollHeight / lineHeight);

    const newRows = Math.min(Math.max(calculatedRows, lineCount), maxRows);
    setInputRows(newRows);

    // Auto-grow height based on content up to maxRows
    inputRef.current.style.height = `${scrollHeight}px`;
  }, [inputText]);

  // Focus the input when component mounts
  useEffect(() => {
    if (inputRef.current && !isRecording) {
      inputRef.current.focus();
    }
  }, [isRecording]);

  // Handle key press in input field
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle send message
  const handleSendMessage = () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    onSendMessage(text);
    setInputText("");
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (isRecording) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };

  // Clear input text
  const handleClearInput = () => {
    setInputText("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative mt-2">
      {/* Teaching style selector popup */}
      {showStyleOptions && (
        <div className="absolute bottom-full mb-3 right-0 z-10">
          <TeachingStyleSelector
            onSelect={onStyleChange}
            currentStyle={currentStyle}
            onClose={onToggleStyleOptions}
          />
        </div>
      )}

      <div
        className={cn(
          "relative rounded-2xl border transition-all duration-200 bg-white dark:bg-gray-800",
          isFocused
            ? "border-indigo-400 dark:border-indigo-500 shadow-sm"
            : "border-gray-200 dark:border-gray-700",
          isLoading && "opacity-80"
        )}
      >
        <textarea
          ref={inputRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isRecording ? "Listening..." : placeholder}
          className={cn(
            "w-full py-3 px-4 pr-20 bg-transparent rounded-2xl focus:outline-none focus:ring-0 resize-none transition-all",
            isLoading
              ? "text-gray-500 dark:text-gray-400"
              : "text-gray-800 dark:text-gray-200",
            isRecording && "animate-pulse text-indigo-600 dark:text-indigo-400"
          )}
          rows={inputRows}
          disabled={isLoading}
          aria-label="Message input"
        />

        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          {/* Voice input toggle */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            disabled={isLoading}
            className={cn(
              "p-2 rounded-full transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              isRecording &&
                "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
            )}
            title={isRecording ? "Stop recording" : "Start voice input"}
            aria-label={isRecording ? "Stop recording" : "Start voice input"}
          >
            {isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {/* Clear input button - only show when there's text */}
          {inputText.length > 0 && (
            <button
              type="button"
              onClick={handleClearInput}
              className="p-2 rounded-full transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Clear input"
              aria-label="Clear input"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Teaching style options */}
          <button
            type="button"
            onClick={onToggleStyleOptions}
            className={cn(
              "p-2 rounded-full transition-colors",
              showStyleOptions
                ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            )}
            aria-label="Teaching style options"
            title="Teaching style options"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          {/* Reset conversation button */}
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="p-2 rounded-full transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Reset conversation"
              title="Reset conversation"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          {/* Send button */}
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            className={cn(
              "p-2 rounded-full flex items-center justify-center transition-all",
              !inputText.trim()
                ? "text-gray-400 cursor-not-allowed dark:text-gray-600"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            )}
            aria-label="Send message"
          >
            {isLoading ? (
              <Sparkles className="w-5 h-5 animate-pulse" />
            ) : (
              <ArrowUp className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Voice input status message */}
      {voiceError && (
        <div className="mt-2 text-xs text-red-500 dark:text-red-400">
          {voiceError === "not-allowed"
            ? "Microphone access denied. Please check your browser settings."
            : `Voice input error: ${voiceError}`}
        </div>
      )}
    </div>
  );
};

export default InputArea;
