import React, { ReactNode } from "react";

interface SectionHeaderProps {
  /**
   * Icon to display in the badge
   */
  icon?: ReactNode;

  /**
   * Text to display in the badge
   */
  badgeText: string;

  /**
   * The main heading text
   */
  title: string;

  /**
   * The highlighted part of the title (will be displayed with gradient)
   */
  highlightedText?: string;

  /**
   * The description text
   */
  description: string;

  /**
   * Additional className for the container
   */
  className?: string;

  /**
   * Maximum width for the component
   */
  maxWidth?: string;

  /**
   * Alignment of the header (center or left)
   */
  alignment?: "left" | "center";
}

/**
 * A reusable section header component with consistent styling across the app
 */
const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  badgeText,
  title,
  highlightedText,
  description,
  className = "",
  maxWidth = "max-w-3xl",
  alignment = "left",
}) => {
  const alignmentClasses = alignment === "center" ? "text-center mx-auto" : "";

  return (
    <div className={`mb-16 ${maxWidth} ${alignmentClasses} ${className}`}>
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-2xl border border-indigo-100 shadow-sm mb-6">
        {icon && <div className="w-5 h-5 text-indigo-600">{icon}</div>}
        <p className="text-sm font-medium text-indigo-700">{badgeText}</p>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
        {highlightedText ? (
          <>
            {title}{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
              {highlightedText}
            </span>
          </>
        ) : (
          title
        )}
      </h1>

      <p className="text-xl text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default SectionHeader;
