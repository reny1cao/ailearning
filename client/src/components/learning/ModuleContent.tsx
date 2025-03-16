import React, { useRef, useEffect, useState } from "react";
import {
  Bot,
  Lightbulb,
  BookOpen,
  PenTool,
  Settings,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Type,
  Eye,
  Bell,
  Clock,
} from "lucide-react";
import RichTextContent from "../RichTextContent";
import AITeacher from "./AITeacher";
import TextSelection from "./TextSelection";
import AIResponse from "./AIResponse";
import { useTextSelection } from "../../hooks/useTextSelection";
import { useAIInteraction } from "../../hooks/useAIInteraction";

interface Note {
  id: string;
  content: string;
  timestamp: Date;
  type: "note" | "highlight" | "bookmark";
  selection?: string;
  moduleId?: string;
}

interface ModuleContentProps {
  title: string;
  estimatedTime: number;
  moduleNumber: number;
  content: string;
  notes: Note[];
  onAddNote: (note: {
    content: string;
    type: "note" | "highlight" | "bookmark";
    selection?: string;
  }) => void;
  transitioning?: boolean;
  focusMode?: boolean;
  fontSize?: "small" | "medium" | "large";
  onSettingsChange?: (settings: any) => void;
}

const ModuleContent: React.FC<ModuleContentProps> = ({
  title,
  estimatedTime,
  moduleNumber,
  content,
  notes,
  onAddNote,
  transitioning = false,
  focusMode = false,
  fontSize = "medium",
  onSettingsChange,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [contentProgress, setContentProgress] = useState(0);

  const {
    selectedText,
    position,
    showFormatting,
    handleTextSelection,
    clearSelection,
  } = useTextSelection(contentRef);

  const { isLoading, aiResponse, handleAIInteraction, clearResponse } =
    useAIInteraction();

  // Calculate estimated reading time
  useEffect(() => {
    if (content) {
      // Average reading speed: 200 words per minute
      const wordCount = content.split(/\s+/).length;
      const minutes = Math.ceil(wordCount / 200);
      setReadingTime(minutes);
    }
  }, [content]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const scrollPosition = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;

      if (scrollHeight > 0) {
        const progress = (scrollPosition / scrollHeight) * 100;
        setContentProgress(Math.min(100, Math.max(0, progress)));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Scroll to top on content change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
      setContentProgress(0);
    }
  }, [content]);

  const handleAction = async (type: "explain" | "example" | "highlight") => {
    if (type === "highlight") {
      onAddNote({
        content: selectedText,
        type: "highlight",
        selection: selectedText,
      });
      clearSelection();
    } else {
      await handleAIInteraction(type, selectedText, content);
    }
  };

  const handleCloseResponse = () => {
    clearResponse();
    clearSelection();
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case "small":
        return "text-sm";
      case "large":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  // Apply focus mode class for enhanced readability
  const getFocusModeClass = () => {
    if (focusMode) {
      return "max-w-3xl mx-auto bg-white rounded-xl shadow-sm prose-headings:text-indigo-900 prose-p:text-gray-700 prose-strong:text-gray-900";
    }
    return "bg-white rounded-xl shadow-sm";
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Content */}
      <div
        className={`relative ${getFocusModeClass()} transition-all duration-300 ${
          transitioning
            ? "opacity-0 transform translate-y-4"
            : "opacity-100 transform translate-y-0"
        }`}
        ref={contentRef}
        onMouseUp={(e) => handleTextSelection(e.nativeEvent)}
      >
        <div className="p-6 sm:p-8 lg:p-10">
          <div className={`prose max-w-none ${getFontSizeClass()}`}>
            <RichTextContent content={content} />
          </div>
        </div>
      </div>

      {showFormatting && (
        <TextSelection
          position={position}
          selectedText={selectedText}
          isLoading={isLoading}
          onAction={(action, text) => {
            if (action === "highlight" || action === "bookmark") {
              onAddNote({
                content: text,
                type: action,
                selection: text,
              });
              clearSelection();
            } else if (action === "explain" || action === "example") {
              handleAIInteraction(action, text, content);
            }
          }}
          onClose={clearSelection}
        />
      )}

      {aiResponse && (
        <AIResponse
          position={position}
          selectedText={selectedText}
          response={aiResponse}
          onClose={handleCloseResponse}
        />
      )}

      {/* Settings panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[300px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          showSettings ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Display Settings
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
            >
              <PenTool className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Font Size
                </h4>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() =>
                      onSettingsChange?.({ fontSize: "small" })
                    }
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors ${
                      fontSize === "small"
                        ? "border-indigo-500 text-indigo-500 bg-indigo-50"
                        : "border-gray-200"
                    }`}
                  >
                    <Type className="w-4 h-4 mb-1" />
                    <span className="text-xs">Small</span>
                  </button>
                  <button
                    onClick={() =>
                      onSettingsChange?.({ fontSize: "medium" })
                    }
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors ${
                      fontSize === "medium"
                        ? "border-indigo-500 text-indigo-500 bg-indigo-50"
                        : "border-gray-200"
                    }`}
                  >
                    <Type className="w-5 h-5 mb-1" />
                    <span className="text-xs">Medium</span>
                  </button>
                  <button
                    onClick={() =>
                      onSettingsChange?.({ fontSize: "large" })
                    }
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors ${
                      fontSize === "large"
                        ? "border-indigo-500 text-indigo-500 bg-indigo-50"
                        : "border-gray-200"
                    }`}
                  >
                    <Type className="w-6 h-6 mb-1" />
                    <span className="text-xs">Large</span>
                  </button>
                </div>
              </div>

              {/* Focus Mode */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Reading Mode
                </h4>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() =>
                      onSettingsChange?.({ focusMode: false })
                    }
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors ${
                      !focusMode
                        ? "border-indigo-500 text-indigo-500 bg-indigo-50"
                        : "border-gray-200"
                    }`}
                  >
                    <Eye className="w-5 h-5 mb-1" />
                    <span className="text-xs">Normal</span>
                  </button>
                  <button
                    onClick={() =>
                      onSettingsChange?.({ focusMode: true })
                    }
                    className={`flex flex-col items-center justify-center p-3 border rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors ${
                      focusMode
                        ? "border-indigo-500 text-indigo-500 bg-indigo-50"
                        : "border-gray-200"
                    }`}
                  >
                    <Minimize2 className="w-5 h-5 mb-1" />
                    <span className="text-xs">Focus</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating settings toggle */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed bottom-6 right-6 lg:right-[320px] w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-indigo-600 transition-colors border border-gray-200 z-10"
      >
        <Settings className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ModuleContent;
