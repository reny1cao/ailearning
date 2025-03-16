import { useState } from 'react';
import { getAIResponse } from '../lib/ai';

interface AIMessage {
  id: string;
  content: string;
  type: 'insight' | 'question' | 'explanation' | 'example';
  timestamp: Date;
  selection?: string;
}

export function useAIInteraction() {
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAIInteraction = async (
    type: 'explain' | 'example' | 'highlight',
    selectedText: string,
    content: string
  ) => {
    if (!selectedText || isLoading) return;
    
    // Clear any existing response first
    clearResponse();
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the enhanced AI service with DeepSeek integration
      const response = await getAIResponse(selectedText, type, content);
      
      if (type === 'highlight') {
        // Handle highlighting separately
        return;
      }
      
      setAiResponse({
        id: Date.now().toString(),
        content: response.content,
        type: response.type,
        timestamp: new Date(),
        selection: selectedText
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearResponse = () => {
    setAiResponse(null);
    setError(null);
  };

  return {
    isLoading,
    aiResponse,
    error,
    handleAIInteraction,
    clearResponse
  };
}