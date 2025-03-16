import React, { useEffect, useRef } from 'react';
import { Brain, Sparkles, PenTool, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

interface TextSelectionProps {
  position: { x: number; y: number } | null;
  selectedText: string;
  isLoading: boolean;
  onAction: (type: 'explain' | 'example' | 'highlight') => void;
  onClose: () => void;
}

const TextSelection: React.FC<TextSelectionProps> = ({
  position,
  selectedText,
  isLoading,
  onAction,
  onClose,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [loadingAction, setLoadingAction] = React.useState<'explain' | 'example' | 'highlight' | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setLoadingAction(null);
    }
  }, [isLoading]);

  useEffect(() => {
    if (position && popupRef.current) {
      const popup = popupRef.current;
      const rect = popup.getBoundingClientRect();
      
      // Calculate available space
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const scrollTop = window.scrollY;
      
      // Initial position
      let top = position.y - rect.height - 10; // 10px gap
      let left = position.x - (rect.width / 2);
      
      // Adjust if too close to top
      if (top - scrollTop < 10) {
        top = position.y + 30; // Show below selection
      }
      
      // Adjust if too close to sides
      if (left < 10) {
        left = 10;
      } else if (left + rect.width > viewportWidth - 10) {
        left = viewportWidth - rect.width - 10;
      }
      
      // Apply position
      popup.style.left = `${left}px`;
      popup.style.top = `${top}px`;
    }
  }, [position]);

  if (!position || !selectedText) return null;

  const handleAction = (type: 'explain' | 'example' | 'highlight') => {
    // Preserve the selection when clicking action buttons
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    
    setLoadingAction(type);
    onAction(type);
    
    // Restore the selection after action
    if (range) {
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  const ActionButton = ({ 
    type, 
    icon: Icon, 
    label 
  }: { 
    type: 'explain' | 'example' | 'highlight';
    icon: typeof Brain;
    label: string;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleAction(type)}
      className="h-8 px-3 hover:bg-indigo-50 hover:text-indigo-600 transition-colors relative"
      disabled={isLoading}
    >
      {loadingAction === type ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Icon className="w-4 h-4 mr-2" />
      )}
      <span>{label}</span>
    </Button>
  );

  return (
    <div 
      ref={popupRef}
      className="selection-popup fixed bg-white rounded-lg shadow-xl border p-1.5 flex items-center gap-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
      style={{ transform: 'none' }}
    >
      <ActionButton
        type="explain"
        icon={Brain}
        label="Explain"
      />

      <ActionButton
        type="example"
        icon={Sparkles}
        label="Example"
      />

      <div className="w-px h-6 bg-gray-200" />

      <ActionButton
        type="highlight"
        icon={PenTool}
        label="Highlight"
      />
    </div>
  );
};

export default TextSelection;