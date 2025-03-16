import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CopyButtonProps {
  text: string;
  onCopy?: () => void;
  size?: "sm" | "md";
}

/**
 * Button that copies the provided text to clipboard with feedback
 */
export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  onCopy,
  size = "md",
}) => {
  const [copied, setCopied] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (onCopy) onCopy();

      // Reset the copied state after a delay
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const buttonSize = size === "sm" ? "p-1 rounded-md" : "p-1.5 rounded-lg";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleCopy}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`${buttonSize} bg-gray-800/70 hover:bg-gray-800 text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500`}
        aria-label={copied ? "Copied!" : "Copy to clipboard"}
      >
        {copied ? (
          <Check className={iconSize} />
        ) : (
          <Copy className={iconSize} />
        )}
      </button>

      {showTooltip && !copied && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
          Copy to clipboard
        </div>
      )}

      {copied && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-green-700 text-white text-xs rounded whitespace-nowrap">
          Copied!
        </div>
      )}
    </div>
  );
};

export default CopyButton;
