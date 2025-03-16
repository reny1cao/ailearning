import React, { useEffect, useRef } from 'react';
import { Bot, X } from 'lucide-react';
import { Button } from '../ui/button';

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (responseRef.current && !responseRef.current.contains(event.target as Node)) {
        // Clear selection only when clicking outside both the response and selection popup
        if (!(event.target as Element).closest('.selection-popup')) {
          window.getSelection()?.removeAllRanges();
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!position) return null;

  return (
    <div 
      ref={responseRef}
      className="ai-response fixed bg-white rounded-xl shadow-xl border-0 p-4 sm:p-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300"
      style={{
        left: `${position.x}px`,
        top: `${position.y + 20}px`,
        transform: 'translate(-50%, 0)',
        width: 'min(400px, 90vw)',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-600" />
          <span className="font-medium text-gray-900">AI Response</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            window.getSelection()?.removeAllRanges();
            onClose();
          }}
          className="h-8 w-8 p-0 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
        "{selectedText}"
      </div>
      <div className="text-sm leading-relaxed text-gray-800">
        {response.content}
      </div>
    </div>
  );
};

export default AIResponse;