import React, { ReactNode } from "react";

interface EmptyStateProps {
  /**
   * Icon to display
   */
  icon: ReactNode;

  /**
   * Title text
   */
  title: string;

  /**
   * Description text
   */
  description: string;

  /**
   * Action button text (optional)
   */
  actionText?: string;

  /**
   * Action button click handler (optional)
   */
  onAction?: () => void;

  /**
   * Additional class names
   */
  className?: string;
}

/**
 * Empty state component to display when no data is available
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 ${className}`}
    >
      <div className="text-gray-300 mb-4">{icon}</div>

      <h3 className="text-xl font-medium text-gray-700 mb-2">{title}</h3>

      <p className="text-gray-500 mb-6 text-center max-w-md">{description}</p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
