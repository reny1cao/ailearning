import React from "react";
import {
  Book,
  ExternalLink,
  Code,
  Brain,
  BarChart2,
  Database,
  Layers,
} from "lucide-react";
import { cn } from "../../../lib/utils";

interface ConceptCardProps {
  concept: string;
  category?: string;
  mastery?: number;
  isActive?: boolean;
  onClick?: () => void;
  description?: string;
  exposure?: number;
}

/**
 * ConceptCard component renders information about a concept with visual styling
 * based on category and mastery level
 */
const ConceptCard: React.FC<ConceptCardProps> = ({
  concept,
  category = "general",
  mastery = 0.5, // Default to middle mastery
  isActive = false,
  onClick,
  description,
  exposure = 0,
}) => {
  // Format concept category for display
  const formatCategory = (cat: string) => {
    return cat.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Determine mastery level description
  const getMasteryLabel = (masteryValue: number) => {
    if (masteryValue >= 0.9) return "Expert";
    if (masteryValue >= 0.8) return "Advanced";
    if (masteryValue >= 0.6) return "Proficient";
    if (masteryValue >= 0.4) return "Intermediate";
    if (masteryValue >= 0.2) return "Basic";
    return "Beginner";
  };

  // Get color for mastery level
  const getMasteryColor = (masteryValue: number) => {
    if (masteryValue >= 0.9) return "bg-violet-500 dark:bg-violet-600";
    if (masteryValue >= 0.8) return "bg-indigo-500 dark:bg-indigo-600";
    if (masteryValue >= 0.6) return "bg-blue-500 dark:bg-blue-600";
    if (masteryValue >= 0.4) return "bg-cyan-500 dark:bg-cyan-600";
    if (masteryValue >= 0.2) return "bg-emerald-500 dark:bg-emerald-600";
    return "bg-gray-400 dark:bg-gray-500";
  };

  // Get the progress bar background color based on mastery
  const getProgressBackground = (masteryValue: number) => {
    if (masteryValue >= 0.9) return "bg-violet-200 dark:bg-violet-900/30";
    if (masteryValue >= 0.8) return "bg-indigo-200 dark:bg-indigo-900/30";
    if (masteryValue >= 0.6) return "bg-blue-200 dark:bg-blue-900/30";
    if (masteryValue >= 0.4) return "bg-cyan-200 dark:bg-cyan-900/30";
    if (masteryValue >= 0.2) return "bg-emerald-200 dark:bg-emerald-900/30";
    return "bg-gray-200 dark:bg-gray-800";
  };

  // Get category icon based on concept category
  const getCategoryIcon = (cat: string) => {
    const lowerCat = cat.toLowerCase();
    switch (true) {
      case lowerCat.includes("programming") || lowerCat.includes("coding"):
        return <Code className="w-4 h-4" />;
      case lowerCat.includes("web") ||
        lowerCat.includes("frontend") ||
        lowerCat.includes("backend"):
        return <ExternalLink className="w-4 h-4" />;
      case lowerCat.includes("data"):
        return <Database className="w-4 h-4" />;
      case lowerCat.includes("machine") ||
        lowerCat.includes("ml") ||
        lowerCat.includes("ai"):
        return <Brain className="w-4 h-4" />;
      case lowerCat.includes("algorithm") || lowerCat.includes("structure"):
        return <Layers className="w-4 h-4" />;
      case lowerCat.includes("analytics") || lowerCat.includes("visualization"):
        return <BarChart2 className="w-4 h-4" />;
      default:
        return <Book className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md",
        isActive
          ? "border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-sm"
          : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"
      )}
      onClick={onClick}
    >
      {/* Mastery indicator - top right corner pill */}
      <div className="absolute top-3 right-3">
        <div
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full text-white",
            getMasteryColor(mastery)
          )}
        >
          {getMasteryLabel(mastery)}
        </div>
      </div>

      <div className="flex justify-between items-start mb-3 pr-20">
        <h3 className="font-medium text-gray-800 dark:text-gray-200">
          {concept}
        </h3>
        <div
          className={cn(
            "p-1.5 rounded-full text-indigo-600 dark:text-indigo-400",
            isActive
              ? "bg-indigo-100 dark:bg-indigo-800/40"
              : "bg-gray-100 dark:bg-gray-800/40"
          )}
        >
          {getCategoryIcon(category)}
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-3">
        <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
          {formatCategory(category)}
        </span>
        {exposure > 0 && (
          <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>{exposure} exposures</span>
          </span>
        )}
      </div>

      {description && (
        <p className="mt-2 mb-3 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
          {description}
        </p>
      )}

      <div className="mt-3">
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-1 flex justify-between">
          <span>Mastery Level</span>
          <span className="font-medium">{Math.round(mastery * 100)}%</span>
        </p>
        <div
          className={cn(
            "w-full h-2 rounded-full overflow-hidden",
            getProgressBackground(mastery)
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              getMasteryColor(mastery)
            )}
            style={{ width: `${mastery * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ConceptCard;
