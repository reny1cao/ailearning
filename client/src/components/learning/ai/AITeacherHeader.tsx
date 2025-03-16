import React from "react";
import {
  Bot,
  Sparkles,
  X,
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff,
  BookOpen,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { TeachingStyle } from "../../../types/shared";

interface AITeacherHeaderProps {
  isApiAvailable: boolean;
  teachingStyle: TeachingStyle;
  onStyleClick: () => void;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isFullscreen?: boolean;
  currentTopic?: string;
  conceptCount?: number;
}

/**
 * Header component for the AI Teacher interface
 * Displays connection status, teaching style, and control buttons
 */
const AITeacherHeader: React.FC<AITeacherHeaderProps> = ({
  isApiAvailable,
  teachingStyle,
  onStyleClick,
  onClose,
  onMinimize,
  onMaximize,
  isFullscreen = false,
  currentTopic,
  conceptCount = 0,
}) => {
  const getStyleText = (style: TeachingStyle): string => {
    switch (style) {
      case "academic":
        return "Academic";
      case "socratic":
        return "Socratic";
      case "example-based":
        return "Examples";
      case "conversational":
      default:
        return "Conversational";
    }
  };

  const getStyleIcon = (style: TeachingStyle) => {
    switch (style) {
      case "academic":
        return "📚";
      case "socratic":
        return "❓";
      case "example-based":
        return "💡";
      case "conversational":
      default:
        return "💬";
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl shadow-sm">
      {/* Left side - Title and status */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
          <Sparkles className="w-4 h-4" />
        </div>

        <div>
          <h2 className="text-sm font-medium flex items-center gap-1.5 text-gray-800 dark:text-gray-200">
            AI Learning Assistant
            <span className="flex items-center">
              {isApiAvailable ? (
                <Wifi className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
              )}
            </span>
          </h2>

          <div className="text-xs flex items-center gap-2 text-gray-500 dark:text-gray-400">
            {currentTopic && (
              <>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{currentTopic}</span>
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
              </>
            )}

            <button
              onClick={onStyleClick}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span>{getStyleIcon(teachingStyle)}</span>
              <span>{getStyleText(teachingStyle)}</span>
              <SlidersHorizontal className="w-3 h-3 opacity-60" />
            </button>

            {conceptCount > 0 && (
              <>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span>
                    {conceptCount} concept{conceptCount !== 1 ? "s" : ""}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-1">
        {onMinimize && (
          <button
            onClick={onMinimize}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Minimize"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        )}

        {onMaximize && !isFullscreen && (
          <button
            onClick={onMaximize}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Maximize"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AITeacherHeader;
