import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import teacherApi from '../api/teacherApi';
import { 
  Message, 
  LearningAnalytics, 
  Misconception, 
  ConceptRelationships, 
  ConceptMastery 
} from '../types/shared';
import useApiHealth from './useApiHealth';
import logger from '../lib/logger';

/**
 * State interface for the teacher chat hook
 */
export interface TeacherChatState {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  concepts: string[];
  followupQuestions: string[];
  learningAnalytics: LearningAnalytics | null;
  misconceptions: Misconception[];
  conceptRelationships: ConceptRelationships;
  conceptMastery: ConceptMastery[];
}

/**
 * Custom hook for interacting with the AI teacher
 * Provides chat functionality with streaming support
 */
export function useTeacherChat() {
  // Basic chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [followupQuestions, setFollowupQuestions] = useState<string[]>([]);
  
  // Learning analytics state
  const [learningAnalytics, setLearningAnalytics] = useState<LearningAnalytics | null>(null);
  const [misconceptions, setMisconceptions] = useState<Misconception[]>([]);
  const [conceptRelationships, setConceptRelationships] = useState<ConceptRelationships>({});
  const [conceptMastery, setConceptMastery] = useState<ConceptMastery[]>([]);
  
  // Unique session ID for this chat instance
  const sessionId = useRef<string>(uuidv4());
  
  // Reference to track if component is mounted
  const isMounted = useRef<boolean>(true);
  
  // Reference to the current stream controller
  const streamController = useRef<{ abort: () => void } | null>(null);
  
  // Get API health status
  const { status, checkHealth, startMonitoring, isAvailable } = useApiHealth();
  
  // Reference to track the last seen message content to avoid duplication
  const lastSeenContentRef = useRef<string>("");
  
  // Safe state setter function that avoids updates on unmounted components
  const safeSetState = useCallback(<T,>(
    setter: React.Dispatch<React.SetStateAction<T>>, 
    value: React.SetStateAction<T>
  ) => {
    if (isMounted.current) {
      setter(value);
    }
  }, []);
  
  /**
   * Handle streaming message from the server
   * With improved handling to prevent duplicate rendering
   */
  const handleStreamingMessage = useCallback((chunk: string) => {
    setError(null);
    
    // Skip empty chunks
    if (!chunk || chunk.trim() === '') {
      return;
    }

    // Debug logging
    logger.debug('Raw chunk received:', {
      length: chunk.length,
      preview: chunk.length > 50 ? `${chunk.substring(0, 50)}...` : chunk
    });

    // Remove SSE prefix if present
    let processedChunk = chunk;
    if (processedChunk.startsWith('data: ')) {
      processedChunk = processedChunk.substring(6);
    }

    // Skip control messages
    if (
      processedChunk.includes('"type":"connected"') ||
      processedChunk.includes('"type":"complete"') ||
      processedChunk.trim() === ''
    ) {
      return;
    }

    try {
      // Try to parse as DeepSeek JSON format
      const jsonData = JSON.parse(processedChunk);
      
      // Handle DeepSeek delta format
      if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].delta) {
        const deltaContent = jsonData.choices[0].delta.content;
        
        // Only process if content exists and isn't empty
        if (deltaContent !== undefined && deltaContent !== null) {
          updateMessageWithContent(deltaContent);
        }
        return;
      }
      
      // Handle metadata format
      if (jsonData.concepts || jsonData.followupQuestions) {
        if (jsonData.concepts) {
          setConcepts(jsonData.concepts);
        }
        if (jsonData.followupQuestions) {
          setFollowupQuestions(jsonData.followupQuestions);
        }
        return;
      }
      
      // Handle simple JSON with content field
      if (jsonData.content !== undefined) {
        const content = String(jsonData.content);
        if (content) {
          updateMessageWithContent(content);
        }
        return;
      }
      
      // If we got here, it's a JSON format we don't recognize
      logger.debug('Unrecognized JSON format:', jsonData);
      
    } catch (e) {
      // Not valid JSON, treat as plain text if it has content
      if (processedChunk.trim()) {
        updateMessageWithContent(processedChunk);
      }
    }
  }, []);
  
  /**
   * Helper function to update messages with new content
   * This centralizes the logic for appending content to avoid duplicates
   */
  const updateMessageWithContent = useCallback((newContent: string) => {
    if (!newContent) return;
    
    // Track what we've already seen to avoid duplicates
    if (lastSeenContentRef.current === newContent) {
      logger.debug('Skipping duplicate content:', { content: newContent });
      return;
    }
    
    // Update messages state
    setMessages(prevMessages => {
      const messages = [...prevMessages];
      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
      
      // If we have a streaming assistant message, update it
      if (lastMessage && lastMessage.role === 'assistant' && lastMessage.streaming) {
        // Only append if this content isn't already part of the message
        // This prevents duplicates when chunks get repeated
        if (!lastMessage.content.endsWith(newContent)) {
          lastMessage.content += newContent;
          lastMessage.lastUpdate = Date.now();
          lastSeenContentRef.current = newContent;
        }
      } else {
        // Create a new streaming message
        messages.push({
          id: uuidv4(),
          role: 'assistant',
          content: newContent,
          streaming: true,
          timestamp: new Date(),
          lastUpdate: Date.now()
        });
        lastSeenContentRef.current = newContent;
      }
      
      return messages;
    });
  }, []);
  
  /**
   * Send a message to the AI teacher
   */
  const sendMessage = useCallback(async (
    userId: string,
    message: string,
    useStreaming: boolean = true,
    context?: { moduleContent?: string; moduleTitle?: string }
  ) => {
    try {
      // Reset error state
      setError(null);
      
      // Add user message to chat
      const userMessage: Message = { role: 'user', content: message };
      setMessages(prev => [...prev, userMessage]);
      
      logger.debug('Sending message to AI teacher', { 
        userId, 
        messageLength: message.length, 
        useStreaming,
        hasContext: !!context
      });
      
      if (useStreaming) {
        // Start loading and streaming indicators
        setIsLoading(true);
        setIsStreaming(true);
        
        // Add an empty assistant message that will be populated during streaming
        setMessages(prev => [
          ...prev, 
          { role: 'assistant' as const, content: '', streaming: true }
        ]);
        
        // Start streaming
        streamController.current = teacherApi.streamMessage({
          userId,
          sessionId: sessionId.current,
          message,
          previousMessages: messages.filter(m => !m.streaming), // Don't send incomplete messages
          context,
          callbacks: {
            onChunk: (chunk) => handleStreamingMessage(chunk),
            onMetadata: (detectedConcepts, suggestedFollowups) => {
              logger.debug('Received metadata from streaming response', {
                detectedConceptsCount: detectedConcepts.length,
                suggestedFollowupsCount: suggestedFollowups.length
              });
              
              setConcepts(detectedConcepts);
              setFollowupQuestions(suggestedFollowups);
            },
            onComplete: () => {
              logger.debug('Streaming complete');
              
              // Finalize the streaming message
              setMessages(prev => {
                const newMessages = [...prev];
                const streamingIndex = newMessages.findIndex(
                  msg => msg.role === 'assistant' && msg.streaming === true
                );
                
                if (streamingIndex !== -1) {
                  // Remove streaming flag when complete
                  newMessages[streamingIndex] = {
                    ...newMessages[streamingIndex],
                    streaming: false
                  };
                }
                
                return newMessages;
              });
              
              setIsLoading(false);
              setIsStreaming(false);
              streamController.current = null;
            },
            onError: (err) => {
              logger.error('Streaming error', { error: err.message });
              setError(err.message);
              setIsLoading(false);
              setIsStreaming(false);
              streamController.current = null;
              
              // Mark any streaming messages as complete with an error indicator
              setMessages(prev => {
                const newMessages = [...prev];
                const streamingIndex = newMessages.findIndex(
                  msg => msg.role === 'assistant' && msg.streaming === true
                );
                
                if (streamingIndex !== -1) {
                  let errorContent = newMessages[streamingIndex].content;
                  if (!errorContent.trim()) {
                    errorContent = "I'm sorry, I encountered a problem while generating a response.";
                  } else if (!errorContent.endsWith('...')) {
                    errorContent += '...';
                  }
                  
                  newMessages[streamingIndex] = {
                    ...newMessages[streamingIndex],
                    content: errorContent,
                    streaming: false,
                    error: true
                  };
                }
                
                return newMessages;
              });
            }
          }
        });
      } else {
        // Regular non-streaming request
        setIsLoading(true);
        
        const response = await teacherApi.sendMessage({
          userId,
          sessionId: sessionId.current,
          message,
          previousMessages: messages,
          context
        });
        
        // Update state with response
        setMessages(prev => [...prev, response.message]);
        setConcepts(response.detectedConcepts || []);
        setFollowupQuestions(response.suggestedFollowups || []);
        setIsLoading(false);
      }
    } catch (err) {
      logger.error('Error sending message', { error: (err as Error).message });
      setError((err as Error).message);
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [messages, handleStreamingMessage]);
  
  /**
   * Initialize chat with a welcome message
   */
  const initializeChat = useCallback(async (userId: string) => {
    try {
      // Reset states at the start of initialization
      setIsLoading(false);
      setIsStreaming(false);
      setError(null);
      
      // If there are already messages, don't re-initialize
      if (messages.length > 0) return;
      
      logger.debug('Initializing chat', { userId, sessionId: sessionId.current });
      
      // Only initialize if no messages exist
      if (messages.length === 0) {
        // Add AI welcome message
        setMessages([{
          role: 'assistant',
          content: "Hello! I'm your AI teacher assistant. How can I help you with your learning today?"
        }]);
      }
    } catch (error) {
      // Make sure to reset loading states in case of error
      setIsLoading(false);
      setIsStreaming(false);
      setError(error instanceof Error ? error.message : 'Failed to initialize chat');
      console.error('Failed to initialize chat:', error);
    }
  }, [messages.length]);
  
  /**
   * Clear chat history and reset all state
   */
  const clearChat = useCallback(() => {
    logger.debug('Clearing chat');
    
    // Stop any active streaming
    if (streamController.current) {
      streamController.current.abort();
      streamController.current = null;
    }
    
    // Reset all state
    setMessages([]);
    setIsLoading(false);
    setIsStreaming(false);
    setError(null);
    setConcepts([]);
    setFollowupQuestions([]);
    setLearningAnalytics(null);
    setMisconceptions([]);
    setConceptRelationships({});
    setConceptMastery([]);
    
    // Generate a new session ID
    sessionId.current = uuidv4();
  }, []);
  
  /**
   * Stop streaming response
   */
  const stopStreaming = useCallback(() => {
    logger.debug('Stopping streaming response');
    
    if (streamController.current) {
      streamController.current.abort();
      streamController.current = null;
      setIsStreaming(false);
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Fetch learning analytics for a user
   * This includes mastery information, misconceptions, and learning progress
   */
  const fetchLearningAnalytics = useCallback(async (userId: string) => {
    try {
      // If analytics already loaded, don't fetch again
      if (learningAnalytics !== null) return;
      
      if (!userId) {
        logger.warn('fetchLearningAnalytics called without userId');
        return null;
      }
      
      logger.debug('Fetching learning analytics', { userId });
      setIsLoading(true);
      setError(null);
      
      // Use Promise.allSettled to fetch multiple resources in parallel
      // This ensures we get as much data as possible even if some requests fail
      const [analyticsResult, misconceptionsResult, masteryResult] = await Promise.allSettled([
        teacherApi.getLearningAnalytics(userId),
        teacherApi.getMisconceptions(userId),
        teacherApi.getConceptMastery(userId)
      ]);
      
      // Process analytics
      if (analyticsResult.status === 'fulfilled') {
        setLearningAnalytics(normalizeLearningAnalyticsData(analyticsResult.value));
        logger.debug('Learning analytics fetched successfully', {
          masteredCount: analyticsResult.value.masteredConcepts?.length,
          totalConcepts: analyticsResult.value.totalConcepts
        });
      } else {
        logger.error('Failed to fetch learning analytics', analyticsResult.reason);
      }
      
      // Process misconceptions
      if (misconceptionsResult.status === 'fulfilled') {
        setMisconceptions(misconceptionsResult.value);
        logger.debug('Misconceptions fetched successfully', {
          count: misconceptionsResult.value.length
        });
      } else {
        logger.error('Failed to fetch misconceptions', misconceptionsResult.reason);
      }
      
      // Process concept mastery
      if (masteryResult.status === 'fulfilled') {
        setConceptMastery(masteryResult.value);
        logger.debug('Concept mastery fetched successfully', {
          count: masteryResult.value.length
        });
      } else {
        logger.error('Failed to fetch concept mastery', masteryResult.reason);
      }
      
      setIsLoading(false);
      
      // Return the learning analytics if available
      return analyticsResult.status === 'fulfilled' ? analyticsResult.value : null;
    } catch (err) {
      const errorMessage = (err as Error).message || 'Unknown error fetching learning analytics';
      logger.error('Error fetching learning analytics', { error: errorMessage, userId });
      setError(errorMessage);
      setIsLoading(false);
      return null;
    } finally {
      // Ensure loading states are reset
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [learningAnalytics]);
  
  /**
   * Fetch concept relationships for a specific concept
   */
  const fetchConceptRelationships = useCallback(async (userId: string, conceptId: string) => {
    try {
      if (!userId || !conceptId) {
        logger.warn('fetchConceptRelationships called with missing parameters', { userId, conceptId });
        return {};
      }
      
      logger.debug('Fetching concept relationships', { userId, conceptId });
      setIsLoading(true);
      setError(null);
      
      // Fetch related misconceptions in parallel with concept relationships
      const [relationshipsResult, relatedMisconceptionsResult] = await Promise.allSettled([
        teacherApi.getConceptRelationships(userId, conceptId),
        teacherApi.getMisconceptions(userId, conceptId)
      ]);
      
      // Process relationships
      if (relationshipsResult.status === 'fulfilled') {
        setConceptRelationships(relationshipsResult.value);
        logger.debug('Concept relationships fetched successfully', {
          types: Object.keys(relationshipsResult.value)
        });
      } else {
        logger.error('Failed to fetch concept relationships', relationshipsResult.reason);
      }
      
      // Process related misconceptions
      if (relatedMisconceptionsResult.status === 'fulfilled') {
        setMisconceptions(relatedMisconceptionsResult.value);
        logger.debug('Related misconceptions fetched successfully', {
          count: relatedMisconceptionsResult.value.length,
          conceptId
        });
      } else {
        logger.error('Failed to fetch misconceptions', relatedMisconceptionsResult.reason);
      }
      
      setIsLoading(false);
      
      return relationshipsResult.status === 'fulfilled' ? relationshipsResult.value : {};
    } catch (err) {
      const errorMessage = (err as Error).message || 'Unknown error fetching concept relationships';
      logger.error('Error fetching concept relationships', { 
        error: errorMessage,
        userId,
        conceptId
      });
      setError(errorMessage);
      setIsLoading(false);
      return {};
    }
  }, []);
  
  // Start monitoring API health
  useEffect(() => {
    logger.debug('Starting API health monitoring in useTeacherChat');
    startMonitoring();
    
    return () => {
      isMounted.current = false;
    };
  }, [startMonitoring]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Abort any active streaming
      if (streamController.current) {
        streamController.current.abort();
      }
      // Clear the lastSeenContentRef
      lastSeenContentRef.current = "";
    };
  }, []);
  
  return {
    // State
    messages,
    isLoading,
    isStreaming,
    error,
    concepts,
    followupQuestions,
    learningAnalytics,
    misconceptions,
    conceptRelationships,
    conceptMastery,
    apiStatus: status,
    isApiAvailable: isAvailable,
    
    // Actions
    sendMessage,
    clearChat,
    stopStreaming,
    initializeChat,
    checkApiHealth: checkHealth,
    fetchLearningAnalytics,
    fetchConceptRelationships
  };
}

// Add a function to normalize learning analytics data
const normalizeLearningAnalyticsData = (data: any): LearningAnalytics => {
  return {
    lastUpdated: new Date(data.lastUpdated || Date.now()),
    totalConcepts: data.totalConcepts || 0,
    proficiencyScore: data.proficiencyScore || 0,
    conceptsLearned: data.conceptsLearned || 0,
    strongConcepts: data.strongConcepts || [],
    weakConcepts: data.weakConcepts || [],
    masteredConcepts: data.masteredConcepts || [],
    suggestedTopics: data.suggestedTopics || [],
    struggleConcepts: data.struggleConcepts || data.strugglingConcepts || [],
    learningRate: data.learningRate || 0,
    recommendedReview: data.recommendedReview || [],
  };
};

export default useTeacherChat; 