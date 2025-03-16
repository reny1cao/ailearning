import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, TeachingContext } from '../../shared/types';
import { teacherApi } from '../api/teacherApi';

export interface TeacherAPIState {
  isLoading: boolean;
  error: string | null;
  messages: Message[];
  concepts: string[];
  followupQuestions: string[];
  isStreaming: boolean;
}

/**
 * Health check status for the AI Teacher API
 */
export type HealthCheckStatus = 
  | 'available'      // API is operational
  | 'unavailable'    // API is not responding
  | 'partial'        // API is operating with limited functionality
  | 'checking'       // Health check in progress
  | 'error';         // Error occurred during health check

/**
 * Hook for interacting with the AI Teacher API
 */
export function useTeacherAPI() {
  const [state, setState] = useState<TeacherAPIState>({
    isLoading: false,
    error: null,
    messages: [],
    concepts: [],
    followupQuestions: [],
    isStreaming: false
  });
  
  // Generate a unique session ID for this conversation
  const sessionId = useRef(uuidv4()).current;
  
  // Reference to the EventSource for streaming
  const eventSourceRef = useRef<EventSource | null>(null);
  
  const [healthCheckStatus, setHealthCheckStatus] = useState<HealthCheckStatus>('checking');
  const healthCheckAttemptsRef = useRef(0);
  const healthCheckIntervalRef = useRef<number | null>(null);
  
  /**
   * Send a message to the AI teacher
   * @param userId User ID
   * @param message Message content
   * @param context Optional content context
   * @param title Optional title context
   * @param useStreaming Whether to use streaming for the response (default: true)
   */
  const sendMessage = useCallback(async (
    userId: string,
    message: string,
    context?: string,
    title?: string,
    useStreaming: boolean = true
  ) => {
    // Add the user message to the state immediately
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      messages: [...prev.messages, { role: 'user', content: message }]
    }));
    
    try {
      if (useStreaming) {
        // Close any existing event source
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        
        // Set streaming mode
        setState(prev => ({
          ...prev,
          isStreaming: true
        }));
        
        // Create a placeholder for the streaming message
        const placeholderId = Date.now().toString();
        setState(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            { role: 'assistant', content: '' }
          ]
        }));
        
        // Create event source for streaming
        const eventSource = new EventSource(
          `${process.env.VITE_API_URL || 'http://localhost:3001'}/api/teacher/chat/stream`, 
          { withCredentials: false }
        );
        eventSourceRef.current = eventSource;
        
        // Keep track of the accumulated content
        let accumulatedContent = '';
        
        // Listen for messages
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'chunk') {
              // Update the content with the new chunk
              accumulatedContent += data.content;
              
              // Update the message with accumulated content
              setState(prev => {
                const updatedMessages = [...prev.messages];
                const assistantMessageIndex = updatedMessages.length - 1;
                
                if (assistantMessageIndex >= 0 && updatedMessages[assistantMessageIndex].role === 'assistant') {
                  updatedMessages[assistantMessageIndex] = {
                    ...updatedMessages[assistantMessageIndex],
                    content: accumulatedContent
                  };
                }
                
                return {
                  ...prev,
                  messages: updatedMessages
                };
              });
            } else if (data.type === 'complete') {
              // Update with any additional data
              setState(prev => ({
                ...prev,
                isLoading: false,
                isStreaming: false,
                concepts: data.detectedConcepts || [],
                followupQuestions: data.suggestedFollowups || []
              }));
              
              // Close the event source
              eventSource.close();
              eventSourceRef.current = null;
            } else if (data.type === 'error') {
              // Handle error
              setState(prev => ({
                ...prev,
                isLoading: false,
                isStreaming: false,
                error: data.message || 'An error occurred'
              }));
              
              // Close the event source
              eventSource.close();
              eventSourceRef.current = null;
            }
          } catch (error) {
            console.error('Error parsing streaming response:', error);
          }
        };
        
        // Handle connection open
        eventSource.onopen = () => {
          console.log('Streaming connection established');
          
          // Send the message to begin streaming
          fetch(`${process.env.VITE_API_URL || 'http://localhost:3001'}/api/teacher/chat/stream`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId,
              sessionId,
              message,
              previousMessages: state.messages,
              context: {
                moduleContent: context,
                moduleTitle: title
              }
            })
          }).catch(error => {
            console.error('Error sending message for streaming:', error);
            setState(prev => ({
              ...prev,
              isLoading: false,
              isStreaming: false,
              error: error?.message || 'Failed to send message'
            }));
            
            // Close the event source
            eventSource.close();
            eventSourceRef.current = null;
          });
        };
        
        // Handle errors
        eventSource.onerror = (event) => {
          console.error('Streaming error:', event);
          setState(prev => ({
            ...prev,
            isLoading: false,
            isStreaming: false,
            error: 'Connection error. Please try again.'
          }));
          
          // Close the event source
          eventSource.close();
          eventSourceRef.current = null;
        };
      } else {
        // Use regular non-streaming API
        const response = await teacherApi.sendMessage({
          userId,
          sessionId,
          message,
          previousMessages: state.messages,
          context: context ? {
            moduleContent: context,
            moduleTitle: title
          } : undefined
        });
        
        // Update state with response
        setState(prev => ({
          ...prev,
          isLoading: false,
          messages: [
            ...prev.messages,
            response.message
          ],
          concepts: response.detectedConcepts || [],
          followupQuestions: response.suggestedFollowups || []
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isStreaming: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  }, [sessionId, state.messages]);
  
  /**
   * Analyze user understanding based on concepts
   */
  const analyzeUnderstanding = useCallback(async (
    userId: string,
    userResponse: string,
    concepts: string[]
  ) => {
    try {
      return await teacherApi.analyzeUnderstanding({
        userId,
        userResponse,
        concepts
      });
    } catch (error) {
      console.error('Error analyzing understanding:', error);
      throw error;
    }
  }, []);
  
  /**
   * Clear the chat history
   */
  const clearChat = useCallback(() => {
    // Close any active stream
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    setState({
      isLoading: false,
      error: null,
      messages: [],
      concepts: [],
      followupQuestions: [],
      isStreaming: false
    });
  }, []);
  
  /**
   * Check if the API is healthy with retry logic
   * @param retries Number of retry attempts
   * @param interval Milliseconds between retries
   */
  const checkAPIHealth = useCallback(async (
    retries: number = 2,
    interval: number = 1500
  ): Promise<boolean> => {
    try {
      setHealthCheckStatus('checking');
      healthCheckAttemptsRef.current = 0;
      
      const attemptHealthCheck = async (): Promise<boolean> => {
        try {
          const health = await teacherApi.checkHealth();
          
          if (health?.status === 'ok') {
            // Full health check successful
            setHealthCheckStatus('available');
            return true;
          } else if (health) {
            // Partial health status
            console.log('API health check returned limited functionality:', health);
            setHealthCheckStatus('partial');
            return true;
          } else {
            throw new Error('Health check returned no data');
          }
        } catch (error) {
          console.warn(`Health check attempt ${healthCheckAttemptsRef.current + 1} failed:`, error);
          healthCheckAttemptsRef.current++;
          
          if (healthCheckAttemptsRef.current < retries) {
            // Try again after the interval
            await new Promise(resolve => setTimeout(resolve, interval));
            return attemptHealthCheck();
          } else {
            console.error('Health check failed after', retries, 'attempts');
            setHealthCheckStatus('unavailable');
            return false;
          }
        }
      };
      
      return await attemptHealthCheck();
    } catch (error) {
      console.error('Health check error:', error);
      setHealthCheckStatus('error');
      return false;
    }
  }, []);
  
  /**
   * Start automatic periodic health checks
   * @param interval Milliseconds between checks
   */
  const startPeriodicHealthCheck = useCallback((interval: number = 30000) => {
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current);
    }
    
    // Do an immediate check
    checkAPIHealth();
    
    // Setup periodic checks
    healthCheckIntervalRef.current = window.setInterval(() => {
      // Only check if not already checking and the component is still mounted
      if (healthCheckStatus !== 'checking') {
        checkAPIHealth();
      }
    }, interval);
    
    // Return cleanup function
    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    };
  }, [checkAPIHealth, healthCheckStatus]);
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
        healthCheckIntervalRef.current = null;
      }
    };
  }, []);
  
  /**
   * Stop the current streaming response
   */
  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isStreaming: false
      }));
    }
  }, []);
  
  return {
    state,
    sessionId,
    sendMessage,
    analyzeUnderstanding,
    clearChat,
    checkAPIHealth,
    stopStreaming,
    healthCheckStatus,
    startPeriodicHealthCheck
  };
} 