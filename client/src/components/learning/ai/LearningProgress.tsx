import React from "react";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  BarChart3,
  Award,
  RotateCcw,
  BookOpen,
  AlertTriangle,
  Gauge,
} from "lucide-react";
import { LearningAnalytics } from "../../../types/shared";

interface LearningProgressProps {
  analytics: LearningAnalytics;
}

/**
 * LearningProgress component displays analytics about user's learning progress
 * with visualizations for mastered concepts, struggle areas, and recommended review topics
 */
const LearningProgress: React.FC<LearningProgressProps> = ({ analytics }) => {
  const {
    masteredConcepts = [],
    struggleConcepts = [],
    weakConcepts = [],
    learningRate = 0.5,
    recommendedReview = [],
  } = analytics;

  // Use struggleConcepts or weakConcepts depending on which is available
  const strugglingTopics =
    struggleConcepts && struggleConcepts.length > 0
      ? struggleConcepts
      : weakConcepts || [];

  // Helper function to categorize learning rate
  const getLearningRateCategory = (rate: number) => {
    if (rate >= 0.7) return { label: "Fast", color: "text-green-500" };
    if (rate >= 0.4) return { label: "Moderate", color: "text-blue-500" };
    return { label: "Steady", color: "text-amber-500" };
  };

  // Get learning rate info
  const rateInfo = getLearningRateCategory(learningRate);

  // Progress score from 0-100 based on mastered vs struggle concepts
  const progressScore =
    masteredConcepts.length + strugglingTopics.length > 0
      ? Math.round(
          (masteredConcepts.length /
            (masteredConcepts.length + strugglingTopics.length)) *
            100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Learning Rate Gauge */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
          <Gauge className="w-5 h-5 text-blue-500" />
          <span>Learning Progress</span>
        </h3>

        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="stroke-current text-gray-200 dark:text-gray-700"
                fill="none"
                strokeWidth="3"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`stroke-current ${
                  progressScore >= 75
                    ? "text-green-500"
                    : progressScore >= 50
                    ? "text-blue-500"
                    : progressScore >= 25
                    ? "text-amber-500"
                    : "text-red-500"
                }`}
                fill="none"
                strokeWidth="3"
                strokeDasharray={`${progressScore}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text
                x="18"
                y="20.5"
                className="fill-current text-gray-800 dark:text-gray-200 text-lg font-semibold"
                textAnchor="middle"
              >
                {progressScore}%
              </text>
            </svg>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your learning rate is
            </p>
            <p className={`text-lg font-bold ${rateInfo.color}`}>
              {rateInfo.label}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {masteredConcepts.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Concepts Mastered
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">
              {strugglingTopics.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Areas for Improvement
            </div>
          </div>
        </div>
      </div>

      {/* Mastered Concepts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>Mastered Concepts</span>
        </h3>

        {masteredConcepts.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {masteredConcepts.map((concept, index) => (
              <div
                key={index}
                className="px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs"
              >
                {concept}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Continue learning to master concepts
          </p>
        )}
      </div>

      {/* Areas for Improvement */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Areas for Improvement</span>
        </h3>

        {strugglingTopics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {strugglingTopics.map((concept, index) => (
              <div
                key={index}
                className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs"
              >
                {concept}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No struggling concepts detected
          </p>
        )}
      </div>

      {/* Recommended Review */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-blue-500" />
          <span>Recommended for Review</span>
        </h3>

        {recommendedReview.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recommendedReview.map((concept, index) => (
              <div
                key={index}
                className="px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs"
              >
                {concept}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No review recommendations at this time
          </p>
        )}
      </div>

      {/* Learning Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/50">
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-blue-800 dark:text-blue-300">
          <Lightbulb className="w-4 h-4" />
          <span>Learning Tips</span>
        </h3>

        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <li className="flex items-start gap-2">
            <Award className="w-3 h-3 mt-1 flex-shrink-0" />
            <span>
              Focus on reviewing concepts that you've partially mastered
            </span>
          </li>
          <li className="flex items-start gap-2">
            <BookOpen className="w-3 h-3 mt-1 flex-shrink-0" />
            <span>
              Regular practice with struggling concepts will help build mastery
            </span>
          </li>
          <li className="flex items-start gap-2">
            <BarChart3 className="w-3 h-3 mt-1 flex-shrink-0" />
            <span>
              Your learning analytics will update as you continue learning
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LearningProgress;
