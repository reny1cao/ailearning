import React from "react";
import { Puzzle } from "lucide-react";
import { cn } from "../../../lib/utils";

interface ExerciseInterfaceProps {
  exerciseAnswer: string;
  onExerciseChange: (text: string) => void;
  onExerciseSubmit: () => void;
  concept?: string;
}

/**
 * ExerciseInterface component
 * Handles the UI for practice exercises
 */
const ExerciseInterface: React.FC<ExerciseInterfaceProps> = ({
  exerciseAnswer,
  onExerciseChange,
  onExerciseSubmit,
  concept = "the current topic",
}) => {
  return (
    <div className="mt-4 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/20">
      <h4 className="font-medium text-sm mb-2 text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
        <Puzzle className="w-4 h-4" />
        <span>Practice Exercise: {concept}</span>
      </h4>

      <textarea
        value={exerciseAnswer}
        onChange={(e) => onExerciseChange(e.target.value)}
        placeholder="Type your answer here..."
        className="w-full p-3 border border-indigo-200 dark:border-indigo-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-gray-100 resize-none mb-3"
        rows={4}
      />

      <div className="flex justify-between items-center">
        <div className="text-xs text-indigo-700 dark:text-indigo-300">
          Your answer will help reinforce your understanding
        </div>
        <button
          onClick={onExerciseSubmit}
          disabled={!exerciseAnswer.trim()}
          className={cn(
            "px-4 py-2 rounded-md font-medium text-sm transition-all",
            exerciseAnswer.trim()
              ? "bg-indigo-600 hover:bg-indigo-700 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          )}
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
};

export default ExerciseInterface;
