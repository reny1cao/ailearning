import React from "react";
import { X } from "lucide-react";
import { TeachingStyle } from "../../../types/shared";
import { cn } from "../../../lib/utils";

interface TeachingStyleSelectorProps {
  onSelect: (style: TeachingStyle) => void;
  currentStyle: TeachingStyle;
  onClose: () => void;
}

/**
 * Component for selecting the AI teaching style
 */
const TeachingStyleSelector: React.FC<TeachingStyleSelectorProps> = ({
  onSelect,
  currentStyle,
  onClose,
}) => {
  const styles = [
    {
      id: "conversational" as TeachingStyle,
      name: "Conversational",
      icon: "💬",
      description: "Friendly, informal explanations",
    },
    {
      id: "academic" as TeachingStyle,
      name: "Academic",
      icon: "📚",
      description: "Detailed, rigorous content",
    },
    {
      id: "socratic" as TeachingStyle,
      name: "Socratic",
      icon: "❓",
      description: "Learning through questions",
    },
    {
      id: "example-based" as TeachingStyle,
      name: "Examples",
      icon: "💡",
      description: "Learning through examples",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 w-64">
      <div className="flex justify-between items-center mb-2 px-2 pb-1 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Teaching Style
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {styles.map((style) => (
        <button
          key={style.id}
          onClick={() => onSelect(style.id)}
          className={cn(
            "w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 text-sm transition-colors",
            currentStyle === style.id
              ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300"
              : "hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
        >
          <div
            className={cn(
              "p-1 rounded-full",
              currentStyle === style.id
                ? "bg-indigo-200 dark:bg-indigo-800"
                : "bg-gray-200 dark:bg-gray-700"
            )}
          >
            <span role="img" aria-label={style.name}>
              {style.icon}
            </span>
          </div>
          <div>
            <div className="font-medium">{style.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {style.description}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default TeachingStyleSelector;
