import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "../../../lib/utils";

interface IdeaBubbleProps {
  id: string;
  content: string;
  position?: "left" | "right" | "top" | "bottom";
  type?: "tip" | "question" | "insight" | "warning";
  className?: string;
  isActive?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  onAction?: () => void;
  actionLabel?: string;
  onDismiss?: (id: string) => void;
}

/**
 * IdeaBubble - A non-intrusive contextual bubble that appears next to content
 * to provide insights, tips, or prompt questions without disrupting the flow
 */
const IdeaBubble: React.FC<IdeaBubbleProps> = ({
  id,
  content,
  position = "right",
  type = "tip",
  className,
  isActive = true,
  autoHide = false,
  autoHideDelay = 8000,
  onAction,
  actionLabel = "Explore this",
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(isActive);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  // Auto-hide logic
  useEffect(() => {
    if (autoHide && isVisible && !hasBeenSeen) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setHasBeenSeen(true);
        if (onDismiss) onDismiss(id);
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, isVisible, hasBeenSeen, autoHideDelay, id, onDismiss]);

  // Update visibility when active state changes
  useEffect(() => {
    setIsVisible(isActive);
  }, [isActive]);

  // Handle dismiss
  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss(id);
  };

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case "question":
        return <div className="text-blue-500">?</div>;
      case "warning":
        return <div className="text-yellow-500">!</div>;
      case "insight":
        return <div className="text-purple-500">✨</div>;
      case "tip":
      default:
        return <Lightbulb className="w-4 h-4 text-amber-500" />;
    }
  };

  // Get background color based on type
  const getBgColor = () => {
    switch (type) {
      case "question":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50";
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/50";
      case "insight":
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50";
      case "tip":
      default:
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/50";
    }
  };

  // Get text color based on type
  const getTextColor = () => {
    switch (type) {
      case "question":
        return "text-blue-700 dark:text-blue-300";
      case "warning":
        return "text-yellow-700 dark:text-yellow-300";
      case "insight":
        return "text-purple-700 dark:text-purple-300";
      case "tip":
      default:
        return "text-amber-700 dark:text-amber-300";
    }
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (position) {
      case "left":
        return "right-full mr-2";
      case "right":
        return "left-full ml-2";
      case "top":
        return "bottom-full mb-2";
      case "bottom":
        return "top-full mt-2";
      default:
        return "left-full ml-2";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            "absolute z-30 max-w-xs w-auto",
            getPositionClasses(),
            className
          )}
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <div className={cn("rounded-lg p-3 shadow-lg border", getBgColor())}>
            <div className="flex justify-between items-start mb-1">
              <div
                className={cn(
                  "text-xs font-medium flex items-center gap-1",
                  getTextColor()
                )}
              >
                {getIcon()}
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 -mt-1 -mr-1"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
              {content}
            </p>
            {onAction && (
              <button
                onClick={onAction}
                className={cn(
                  "text-xs flex items-center gap-0.5 font-medium mt-1 px-2 py-1 rounded-md transition-colors",
                  type === "question"
                    ? "text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    : "",
                  type === "warning"
                    ? "text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
                    : "",
                  type === "insight"
                    ? "text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/30"
                    : "",
                  type === "tip"
                    ? "text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/30"
                    : ""
                )}
              >
                {actionLabel}
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IdeaBubble;
