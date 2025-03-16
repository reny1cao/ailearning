import React, { useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import RichTextContent from '../RichTextContent';
import AITeacher from './AITeacher';
import TextSelection from './TextSelection';
import AIResponse from './AIResponse';
import { useTextSelection } from '../../hooks/useTextSelection';
import { useAIInteraction } from '../../hooks/useAIInteraction';

interface ModuleContentProps {
  title: string;
  estimatedTime: number;
  moduleNumber: number;
  content: string;
  notes: Array<{ id: string; content: string; timestamp: Date }>;
  onAddNote: (note: { content: string; type: 'note' | 'highlight' | 'bookmark'; selection?: string }) => void;
  transitioning?: boolean;
}

const ModuleContent: React.FC<ModuleContentProps> = ({
  content,
  notes,
  onAddNote,
  transitioning = false,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showAITeacher, setShowAITeacher] = React.useState(false);

  const {
    selectedText,
    position,
    showFormatting,
    handleTextSelection,
    clearSelection
  } = useTextSelection(contentRef);

  const {
    isLoading,
    aiResponse,
    handleAIInteraction,
    clearResponse
  } = useAIInteraction();

  // Scroll to top on content change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo(0, 0);
    }
  }, [content]);

  const handleAction = async (type: 'explain' | 'example' | 'highlight') => {
    if (type === 'highlight') {
      onAddNote({ 
        content: selectedText, 
        type: 'highlight',
        selection: selectedText 
      });
      clearSelection();
    } else {
      await handleAIInteraction(type, selectedText, content);
    }
  };

  const handleCloseResponse = () => {
    clearResponse();
    clearSelection();
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50" ref={containerRef}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <div 
          className={`relative bg-white rounded-xl shadow-sm transition-opacity duration-300 ${
            transitioning ? 'opacity-0' : 'opacity-100'
          }`}
          ref={contentRef}
          onMouseUp={(e) => handleTextSelection(e.nativeEvent)}
        >
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="prose prose-lg max-w-none">
              <RichTextContent content={content} />
            </div>
          </div>
        </div>

        {showFormatting && (
          <TextSelection
            position={position}
            selectedText={selectedText}
            isLoading={isLoading}
            onAction={handleAction}
            onClose={clearSelection}
          />
        )}

        {aiResponse && (
          <AIResponse
            position={position}
            selectedText={selectedText}
            response={aiResponse}
            onClose={handleCloseResponse}
          />
        )}

        <div 
          className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
            showAITeacher ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <AITeacher 
            content={content}
            selectedText={selectedText}
            onClose={() => setShowAITeacher(false)}
          />
        </div>

        <button
          onClick={() => setShowAITeacher(true)}
          className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 h-12 px-5 rounded-full bg-indigo-600 text-white flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all duration-200 z-40 group ${
            showAITeacher ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <Bot className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="font-medium">Ask AI Teacher</span>
        </button>
      </div>
    </div>
  );
};

export default ModuleContent;