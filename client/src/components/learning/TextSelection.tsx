import React, { useEffect, useRef, useState } from "react";
import { Bot, Highlighter, BookmarkPlus, X, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface TextSelectionProps {
  position: { x: number; y: number } | null;
  selectedText: string;
  isLoading?: boolean;
  onAction: (
    action: "explain" | "highlight" | "example" | "bookmark",
    text: string
  ) => void;
  onClose: () => void;
}

const TextSelection: React.FC<TextSelectionProps> = ({
  position,
  selectedText,
  isLoading = false,
  onAction,
  onClose,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [visible, setVisible] = useState(false);

  // Adjust position to ensure popup is within viewport
  useEffect(() => {
    if (!position || !popupRef.current) return;

    setVisible(false);

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get popup dimensions
    const popupRect = popupRef.current.getBoundingClientRect();
    const popupWidth = popupRect.width;
    const popupHeight = popupRect.height;

    // Calculate adjusted position
    let adjustedX = position.x;
    let adjustedY = position.y;

    // Adjust X if needed
    if (position.x + popupWidth / 2 > viewportWidth) {
      adjustedX = viewportWidth - popupWidth / 2 - 10;
    } else if (position.x - popupWidth / 2 < 0) {
      adjustedX = popupWidth / 2 + 10;
    }

    // Adjust Y if needed
    if (position.y + popupHeight + 10 > viewportHeight) {
      // Place above selection
      adjustedY = position.y - popupHeight - 10;
    } else {
      // Place below selection
      adjustedY = position.y + 10;
    }

    setAdjustedPosition({ x: adjustedX, y: adjustedY });

    // Animate in after position is set
    setTimeout(() => {
      setVisible(true);
    }, 10);
  }, [position]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!position || !adjustedPosition) return null;

  return (
    <div
      ref={popupRef}
      className={cn(
        "selection-popup fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 transition-all duration-200",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        transform: "translate(-50%, 0)",
      }}
    >
      <div className="flex items-center gap-1 p-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction("explain", selectedText)}
          disabled={isLoading}
          className="h-8 w-8 rounded-md flex items-center justify-center"
          title="Explain this"
        >
          <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction("highlight", selectedText)}
          disabled={isLoading}
          className="h-8 w-8 rounded-md flex items-center justify-center"
          title="Highlight this"
        >
          <Highlighter className="h-4 w-4 text-amber-500 dark:text-amber-400" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction("example", selectedText)}
          disabled={isLoading}
          className="h-8 w-8 rounded-md flex items-center justify-center"
          title="Show examples"
        >
          <Sparkles className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAction("bookmark", selectedText)}
          disabled={isLoading}
          className="h-8 w-8 rounded-md flex items-center justify-center"
          title="Save as note"
        >
          <BookmarkPlus className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        </Button>

        <div className="h-5 w-px bg-gray-200 dark:bg-gray-700 mx-0.5" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 rounded-md flex items-center justify-center"
          title="Close"
        >
          <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </Button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center rounded-lg backdrop-blur-sm">
          <div className="animate-pulse flex items-center gap-1">
            <div className="h-1.5 w-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
            <div className="h-1.5 w-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animation-delay-200"></div>
            <div className="h-1.5 w-1.5 bg-indigo-600 dark:bg-indigo-400 rounded-full animation-delay-400"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextSelection;
