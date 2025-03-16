import React, { useEffect, useRef, useState } from 'react';
import { Bot, X, Copy, ThumbsUp, ThumbsDown, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface AIResponseProps {
  position: { x: number; y: number } | null;
  selectedText: string;
  response: {
    content: string;
    type: string;
  };
  onClose: () => void;
}

const AIResponse: React.FC<AIResponseProps> = ({
  position,
  selectedText,
  response,
  onClose,
}) => {
  const responseRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);
  const [initialPosition, setInitialPosition] = useState(position);

  // Store initial position for animations
  useEffect(() => {
    if (position && !initialPosition) {
      setInitialPosition(position);
    }
  }, [position, initialPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (responseRef.current && !responseRef.current.contains(event.target as Node)) {
        // Clear selection only when clicking outside both the response and selection popup
        if (!(event.target as Element).closest('.selection-popup')) {
          if (!expanded) {
            window.getSelection()?.removeAllRanges();
            onClose();
          }
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (expanded) {
          setExpanded(false);
        } else {
          window.getSelection()?.removeAllRanges();
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, expanded]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const provideFeedback = (type: 'liked' | 'disliked') => {
    setFeedback(type);
    // Here you would typically send feedback to your backend
    console.log(`User ${type} the response`);
  };

  if (!position) return null;

  const getPositionStyle = () => {
    if (expanded) {
      return {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(800px, 90vw)',
        height: 'min(600px, 80vh)',
        maxHeight: '80vh',
      };
    }

    return {
      left: `${position.x}px`,
      top: `${position.y + 20}px`,
      transform: 'translate(-50%, 0)',
      width: 'min(400px, 90vw)',
      maxHeight: '60vh',
    };
  };

  return (
    <div 
      ref={responseRef}
      className={cn(
        "ai-response fixed bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50",
        "transition-all duration-300 ease-in-out",
        expanded ? "backdrop-blur-sm backdrop-filter" : "",
        expanded ? "animate-in fade-in zoom-in-95" : "animate-in fade-in slide-in-from-top-4"
      )}
      style={{
        ...getPositionStyle(),
        overflowY: 'auto'
      }}
    >
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-3 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-1.5 rounded-md">
            <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">AI Response</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            title={expanded ? "Minimize" : "Expand"}
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.getSelection()?.removeAllRanges();
              onClose();
            }}
            className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 rounded-md"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {selectedText && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-100 dark:border-gray-700 italic">
            "{selectedText}"
          </div>
        )}
        
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {response.content}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => provideFeedback('liked')}
              className={cn(
                "h-8 text-xs gap-1.5",
                feedback === 'liked' ? "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" : ""
              )}
              disabled={feedback !== null}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              Helpful
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => provideFeedback('disliked')}
              className={cn(
                "h-8 text-xs gap-1.5",
                feedback === 'disliked' ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" : ""
              )}
              disabled={feedback !== null}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              Not helpful
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 text-xs gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        
        {expanded && (
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center">
            <span>Press <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 mx-1">Esc</kbd> to minimize</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIResponse;