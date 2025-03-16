import React from "react";
import { AlertTriangle, CheckCircle, AlertCircle, X } from "lucide-react";

interface Misconception {
  misconception: string;
  correction: string;
  confidenceLevel: number;
}

interface MisconceptionAlertProps {
  misconception: Misconception;
  onDismiss?: () => void;
}

/**
 * MisconceptionAlert component displays a detected misconception with its correction
 * and a visual indicator of the AI's confidence level in its detection
 */
const MisconceptionAlert: React.FC<MisconceptionAlertProps> = ({
  misconception,
  onDismiss,
}) => {
  const {
    misconception: misconceptionText,
    correction,
    confidenceLevel,
  } = misconception;

  // Format confidence level as percentage
  const confidencePercent = Math.round(confidenceLevel * 100);

  // Determine confidence status and styling
  const getConfidenceStatus = () => {
    if (confidenceLevel >= 0.8) {
      return {
        label: "High Confidence",
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
        color: "text-green-600",
      };
    }
    if (confidenceLevel >= 0.5) {
      return {
        label: "Medium Confidence",
        icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
        color: "text-amber-600",
      };
    }
    return {
      label: "Low Confidence",
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      color: "text-red-600",
    };
  };

  const confidenceStatus = getConfidenceStatus();

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 relative mb-4">
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
            Potential Misconception Detected
          </h4>

          <div className="mb-3">
            <div className="text-yellow-700 dark:text-yellow-400 font-medium mb-1">
              {misconceptionText}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm">
              {correction}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {confidenceStatus.icon}
            <span className={`text-xs ${confidenceStatus.color}`}>
              {confidenceStatus.label} ({confidencePercent}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MisconceptionAlert;
