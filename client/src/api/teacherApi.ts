import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ChatRequest, 
  ChatResponse, 
  TeachingContext, 
  TeachingResponse,
  TeachingStrategy,
  Message,
  LearningAnalytics,
  Misconception,
  ConceptRelationships,
  ConceptMastery,
  ConceptRelationship
} from '../types/shared';
import logger from '../lib/logger';

/**
 * API client for the AI Teacher service
 */
class TeacherApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private lastHealthCheckTime = 0;
  private healthCheckCacheMs = 5000; // Cache health check for 5 seconds
  private cachedHealthStatus: { 
    available: boolean;
    status: string; 
    timestamp: string; 
    nodeEnv: string; 
    deepSeekConfigured: boolean;
    services?: {
      database?: boolean;
      ai?: boolean;
      memory?: boolean;
    };
  } | null = null;

  constructor() {
    // Use environment variable for API URL with fallback
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    logger.info('Initializing TeacherApiClient', { baseURL: this.baseURL });
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });
    
    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        const { method, url, data } = config;
        logger.debug('API request', { 
          url: url || '',
          method: method?.toUpperCase() || 'UNKNOWN',
          dataSize: data ? JSON.stringify(data).length : 0
        });
        return config;
      },
      (error) => {
        logger.error('Request failed before sending', { error: error.message });
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        const { status, config } = response;
        logger.debug('API response', { 
          url: config.url || '', 
          method: config.method?.toUpperCase() || 'UNKNOWN', 
          status,
          dataSize: response.data ? JSON.stringify(response.data).length : 0
        });
        return response;
      },
      (error) => {
        // Extract information about the request
        const { config, response } = error;
        const status = response?.status || 0;
        const url = config?.url || 'unknown';
        const method = config?.method?.toUpperCase() || 'UNKNOWN';
        
        logger.error('API error', {
          url,
          method,
          status,
          message: error.message,
          responseData: response?.data || 'No response data'
        });
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Send a message to the AI teacher
   */
  async sendMessage(params: {
    userId: string;
    sessionId: string;
    message: string;
    previousMessages?: Message[];
    context?: {
      moduleContent?: string;
      moduleTitle?: string;
    };
  }): Promise<ChatResponse> {
    try {
      logger.debug('Sending message to AI teacher', { 
        userId: params.userId, 
        sessionId: params.sessionId, 
        messageLength: params.message.length, 
        prevMessagesCount: params.previousMessages?.length || 0,
        hasContext: !!params.context 
      });
      
      const { userId, sessionId, message, previousMessages = [], context = {} } = params;
      
      const response = await this.client.post<ChatResponse>('/api/teacher/chat', {
        userId,
        sessionId,
        message,
        previousMessages,
        moduleContent: context.moduleContent,
        moduleTitle: context.moduleTitle
      });
      
      logger.debug('Received AI teacher response', {
        responseLength: response.data.message?.content.length || 0,
        detectedConceptsCount: response.data.detectedConcepts?.length || 0,
        suggestedFollowupsCount: response.data.suggestedFollowups?.length || 0
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to send message to AI teacher', { 
        error: (error as Error).message,
        userId: params.userId,
        sessionId: params.sessionId,
      });
      
      // Create a graceful error response
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('AI Teacher API endpoint not found. The server might be misconfigured.');
        } else if (error.response?.status === 503) {
          throw new Error('AI Teacher service is temporarily unavailable. Please try again later.');
        } else if (error.response?.status === 400) {
          throw new Error('Invalid request: ' + (error.response.data.message || 'Missing required fields'));
        } else if (error.response?.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out while waiting for AI Teacher response.');
        } else if (error.code === 'ERR_NETWORK') {
          throw new Error('Network error: Cannot connect to AI Teacher API.');
        }
      }
      
      throw new Error(`Failed to send message: ${(error as Error).message}`);
    }
  }

  /**
   * Stream a message to the AI teacher and receive chunks
   */
  streamMessage(params: {
    userId: string;
    sessionId: string;
    message: string;
    previousMessages?: Message[];
    context?: {
      moduleContent?: string;
      moduleTitle?: string;
    };
    callbacks: {
      onChunk: (chunk: string) => void;
      onMetadata?: (concepts: string[], followups: string[]) => void;
      onComplete: () => void;
      onError: (error: Error) => void;
    };
  }): { abort: () => void } {
    const { userId, sessionId, message, previousMessages = [], context = {}, callbacks } = params;
    
    logger.debug('Starting streaming message to AI teacher', { 
      userId, 
      sessionId, 
      messageLength: message.length,
      prevMessagesCount: previousMessages.length,
      hasContext: !!context
    });
    
    // Create AbortController to allow canceling the stream
    const controller = new AbortController();
    
    // Handle connection timeout
    const timeoutId = setTimeout(() => {
      logger.error('Stream request timed out');
      callbacks.onError(new Error('Connection timed out. Please try again.'));
      controller.abort();
    }, 15000); // 15 seconds timeout
    
    // Set up metadata tracking
    let metadataReceived = false;
    
    // Set up a timer to detect if metadata isn't received within reasonable time
    const metadataTimeoutId = setTimeout(() => {
      if (!metadataReceived && !controller.signal.aborted) {
        logger.warn('No metadata received, will use fallback after stream completes');
      }
    }, 10000); // Wait 10 seconds for metadata
    
    // Start the streaming process
    (async () => {
      try {
        // Create the request
        const response = await fetch(`${this.baseURL}/api/teacher/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
          },
          body: JSON.stringify({
            userId,
            sessionId,
            message,
            previousMessages,
            moduleContent: context.moduleContent,
            moduleTitle: context.moduleTitle
          }),
          signal: controller.signal,
        });
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          clearTimeout(metadataTimeoutId);
          try {
            const errorData = await response.json();
            const errorMessage = errorData.message || `Server responded with ${response.status}`;
            
            logger.error('Streaming error response', {
              status: response.status,
              message: errorMessage
            });
            
            callbacks.onError(new Error(errorMessage));
          } catch (parseError) {
            // If we can't parse the error response
            logger.error('Failed to parse error response', {
              status: response.status,
              error: (parseError as Error).message
            });
            callbacks.onError(new Error(`Server error: ${response.status}`));
          }
          return;
        }
        
        // Get the response reader
        if (!response.body) {
          clearTimeout(metadataTimeoutId);
          callbacks.onError(new Error('Response body is null'));
          return;
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';
        
        // Process the stream
        while (true) {
          const { value, done } = await reader.read();
          
          if (done) {
            // Process any remaining data in the buffer
            if (buffer.trim()) {
              this.processChunk(buffer.trim(), {
                ...callbacks,
                onMetadata: (concepts, followups) => {
                  metadataReceived = true;
                  clearTimeout(metadataTimeoutId);
                  if (callbacks.onMetadata) {
                    callbacks.onMetadata(concepts, followups);
                  }
                }
              });
            }
            
            // If we never received metadata, generate some default followup questions
            if (!metadataReceived && callbacks.onMetadata) {
              logger.warn('No metadata received during streaming, using fallback');
              callbacks.onMetadata(
                [], // No concepts detected
                [
                  'Could you explain that in more detail?',
                  'How would you apply this concept in practice?',
                  'Can you give me a specific example?'
                ]
              );
            }
            
            clearTimeout(metadataTimeoutId);
            logger.debug('Stream ended');
            callbacks.onComplete();
            break;
          }
          
          // Decode the chunk and add to buffer
          const textChunk = decoder.decode(value, { stream: true });
          buffer += textChunk;
          
          // Process SSE data events
          // The format is expected to be: "data: {...}\n\n"
          const lines = buffer.split('\n\n');
          
          // Process all complete events except the last one (which might be incomplete)
          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line) {
              this.processChunk(line, {
                ...callbacks,
                onMetadata: (concepts, followups) => {
                  metadataReceived = true;
                  clearTimeout(metadataTimeoutId);
                  if (callbacks.onMetadata) {
                    callbacks.onMetadata(concepts, followups);
                  }
                }
              });
            }
          }
          
          // Keep the last line in the buffer (it might be incomplete)
          buffer = lines[lines.length - 1];
        }
      } catch (error) {
        // Clear the timeout
        clearTimeout(timeoutId);
        
        // Handle fetch errors or AbortController errors
        if ((error as Error).name === 'AbortError') {
          logger.debug('Stream aborted by user');
        } else {
          logger.error('Error in stream processing', {
            error: (error as Error).message,
            stack: (error as Error).stack
          });
          
          // Provide helpful error messages based on the error type
          if ((error as Error).message.includes('NetworkError') || 
              (error as Error).message.includes('Failed to fetch')) {
            callbacks.onError(new Error('Network connection issue. Please check your internet connection.'));
          } else {
            callbacks.onError(error as Error);
          }
        }
      }
    })();
    
    // Return the abort function
    return {
      abort: () => {
        logger.debug('Aborting stream');
        clearTimeout(timeoutId);
        controller.abort();
      },
    };
  }
  
  /**
   * Process a streaming chunk before sending it to the client
   */
  private processChunk(chunk: string, callbacks: {
    onChunk: (chunk: string) => void;
    onMetadata?: (concepts: string[], followups: string[]) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
  }): void {
    try {
      // Skip empty chunks
      if (!chunk || chunk.trim() === '') {
        return;
      }

      // Check if this is a "connected" event (occurs at the start of the stream)
      // Skip it to avoid rendering connection info as response content
      if (chunk.includes('"type":"connected"')) {
        logger.debug('Received stream connection message, skipping');
        return;
      }

      // Skip SSE data prefix line (contains just "data: " with no content)
      if (chunk.trim() === 'data:') {
        return;
      }

      // Handle completion event
      if (chunk.includes('"type":"complete"')) {
        logger.debug('Received stream completion message');
        callbacks.onComplete();
        return;
      }

      // Pass the raw chunk directly to the client
      // The client-side handler will process it based on format
      callbacks.onChunk(chunk);
    } catch (error) {
      logger.error('Error processing chunk:', error);
      callbacks.onError(new Error(`Error processing streaming chunk: ${error}`));
    }
  }

  /**
   * Analyze a user's understanding level
   */
  async analyzeUnderstanding(params: {
    userId: string;
    userResponse: string;
    concepts: string[];
  }): Promise<{
    understandingLevel: number;
    misunderstandings: string[];
    recommendations: string[];
  }> {
    try {
      logger.debug('Analyzing user understanding', { 
        userId: params.userId, 
        concepts: params.concepts,
        responseLength: params.userResponse.length
      });
      
      const response = await this.client.post('/api/teacher/analyze', params);
      
      logger.debug('Received understanding analysis', {
        understandingLevel: response.data.understandingLevel,
        misunderstandingsCount: response.data.misunderstandings?.length || 0,
        recommendationsCount: response.data.recommendations?.length || 0
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to analyze understanding', { 
        error: (error as Error).message,
        userId: params.userId,
      });
      
      throw new Error(`Failed to analyze understanding: ${(error as Error).message}`);
    }
  }

  /**
   * Submit feedback about an AI teacher interaction
   */
  async submitFeedback(params: {
    userId: string;
    interactionId: string;
    rating: number;
    comment?: string;
  }): Promise<boolean> {
    try {
      logger.debug('Submitting feedback for AI interaction', params);
      
      const response = await this.client.post('/api/teacher/feedback', params);
      
      logger.debug('Feedback submitted', {
        success: response.status === 200,
        status: response.status
      });
      
      return response.status === 200;
    } catch (error) {
      logger.error('Failed to submit feedback', { 
        error: (error as Error).message,
        userId: params.userId,
        interactionId: params.interactionId 
      });
      
      return false; // Return false instead of throwing - feedback failure shouldn't break the app
    }
  }

  /**
   * Check the health of the API with robust retry logic
   */
  async checkHealth(options: { 
    timeout?: number; 
    retry?: boolean; 
    maxRetries?: number; 
    retryDelay?: number; 
    forceRefresh?: boolean; 
  } = {}): Promise<{
    available: boolean;
    status: string;
    timestamp: string;
    nodeEnv: string;
    deepSeekConfigured: boolean;
    services?: {
      database?: boolean;
      ai?: boolean;
      memory?: boolean;
    };
  }> {
    const {
      timeout = 5000,
      retry = false,
      maxRetries = 2,
      retryDelay = 1500,
      forceRefresh = false,
    } = options;
    
    const now = Date.now();
    
    // Use cached result if it's recent and not forcing refresh
    if (!forceRefresh && this.cachedHealthStatus && now - this.lastHealthCheckTime < this.healthCheckCacheMs) {
      logger.debug('Using cached health check result', { 
        cachedTime: new Date(this.lastHealthCheckTime).toISOString(),
        age: now - this.lastHealthCheckTime
      });
      return this.cachedHealthStatus;
    }
    
    let attempt = 0;
    const makeRequest = async (): Promise<AxiosResponse> => {
      try {
        logger.debug('Checking API health', { 
          attempt: attempt + 1, 
          maxRetries: retry ? maxRetries : 0,
          timeout
        });
        
        // Use a shorter timeout for health checks
        const response = await this.client.get('/api/health', { 
          timeout 
        });
        
        return response;
      } catch (error) {
        attempt++;
        
        if (retry && attempt <= maxRetries) {
          logger.debug('Retrying health check after failure', { 
            attempt, 
            maxRetries,
            delay: retryDelay,
            error: (error as Error).message
          });
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return makeRequest();
        }
        
        logger.error('Health check failed after retries', {
          error: axios.isAxiosError(error) 
            ? `${error.code}: ${error.message}` 
            : (error as Error).message,
          status: axios.isAxiosError(error) ? error.response?.status : undefined,
        });
        
        throw error;
      }
    };
    
    try {
      const response = await makeRequest();
      
      logger.info('API health check successful', { 
        status: response.data.status,
        deepSeekConfigured: response.data.deepSeekConfigured,
        timestamp: response.data.timestamp
      });
      
      // Add available flag if not present in response
      const healthData = {
        ...response.data,
        available: true
      };
      
      // Cache the result
      this.lastHealthCheckTime = now;
      this.cachedHealthStatus = healthData;
      
      return healthData;
    } catch (error) {
      const healthData = {
        available: false,
        status: 'error',
        timestamp: new Date().toISOString(),
        nodeEnv: 'unknown',
        deepSeekConfigured: false
      };
      
      // Handle specific error cases
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          healthData.status = 'timeout';
        } else if (!error.response) {
          healthData.status = 'unreachable';
        } else {
          healthData.status = `error_${error.response.status}`;
        }
      }
      
      // Cache the negative result but for a shorter time
      this.lastHealthCheckTime = now;
      this.cachedHealthStatus = healthData;
      
      logger.warn('API health check returned negative status', healthData);
      
      return healthData;
    }
  }

  /**
   * Process a chat request through the teacher API
   */
  async processChat(request: ChatRequest): Promise<ChatResponse> {
    try {
      logger.debug('Processing chat request', { 
        userId: request.userId,
        sessionId: request.sessionId,
        messageCount: request.previousMessages?.length || 0
      });
      
      const response = await this.client.post<TeachingResponse>('/api/teacher/chat', request);
      
      // Convert TeachingResponse to ChatResponse
      const result: ChatResponse = {
        message: {
          role: 'assistant',
          content: response.data.content
        },
        detectedConcepts: response.data.conceptsCovered || [],
        suggestedFollowups: response.data.followupQuestions || []
      };
      
      return result;
    } catch (error) {
      logger.error('Error processing chat', { 
        error: (error as Error).message,
        userId: request.userId,
        sessionId: request.sessionId
      });
      
      // Create a fallback response
      return {
        message: {
          role: 'assistant',
          content: "I'm sorry, I couldn't process your message. Please try again later."
        },
        detectedConcepts: [],
        suggestedFollowups: []
      };
    }
  }

  /**
   * Direct interaction with the teaching API
   */
  async interact(
    userId: string,
    message: string,
    context?: TeachingContext
  ): Promise<TeachingResponse> {
    try {
      logger.debug('Interacting with teach API', { 
        userId, 
        messageLength: message.length,
        hasContext: !!context
      });
      
      const response = await this.client.post<TeachingResponse>('/api/teacher/interact', {
        userId,
        message,
        context
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error interacting with teaching API', { 
        error: (error as Error).message,
        userId
      });
      
      throw new Error(`Failed to interact with teaching API: ${(error as Error).message}`);
    }
  }

  /**
   * Get available teaching strategies
   */
  async getTeachingStrategies(): Promise<TeachingStrategy[]> {
    try {
      logger.debug('Fetching teaching strategies');
      
      const response = await this.client.get<TeachingStrategy[]>('/api/teacher/strategies');
      return response.data;
    } catch (error) {
      logger.error('Error fetching teaching strategies', { error: (error as Error).message });
      throw new Error(`Failed to fetch teaching strategies: ${(error as Error).message}`);
    }
  }

  /**
   * Update user learning style
   */
  async updateLearningStyle(
    userId: string,
    learningStyle: { primary: string; secondary?: string }
  ): Promise<{ success: boolean; message: string }> {
    try {
      logger.debug('Updating learning style', { userId, learningStyle });
      
      const response = await this.client.post('/api/teacher/learning-style', {
        userId,
        learningStyle
      });
      
      return response.data;
    } catch (error) {
      logger.error('Error updating learning style', { 
        error: (error as Error).message,
        userId
      });
      
      throw new Error(`Failed to update learning style: ${(error as Error).message}`);
    }
  }

  /**
   * Get learning analytics for a user
   */
  async getLearningAnalytics(userId: string): Promise<LearningAnalytics> {
    try {
      logger.debug('Getting learning analytics', { userId });
      
      // In production, this would call the backend API
      const response = await this.client.get<LearningAnalytics>(`/api/teacher/analytics/${userId}`);
      
      logger.debug('Received learning analytics', {
        masteredCount: response.data.masteredConcepts?.length || 0,
        struggleCount: response.data.struggleConcepts?.length || 0,
        learningRate: response.data.learningRate
      });
      
      return response.data;
    } catch (error) {
      // For development, return mock data when the endpoint doesn't exist
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        logger.warn('Learning analytics endpoint not found, using mock data', { userId });
        
        // Return mock data for development
        const mockData: LearningAnalytics = {
          masteredConcepts: ['JavaScript fundamentals', 'HTML DOM manipulation', 'CSS selectors', 'React component lifecycle'],
          struggleConcepts: ['React hooks', 'TypeScript generics', 'State management patterns'],
          learningRate: 0.68,
          recommendedReview: ['React state management', 'TypeScript interfaces', 'React performance optimization'],
          lastUpdated: new Date().toISOString(),
          totalConcepts: 15,
          proficiencyScore: 0.72
        };
        
        return mockData;
      }
      
      logger.error('Error getting learning analytics', { 
        error: (error as Error).message,
        userId
      });
      
      throw new Error(`Failed to get learning analytics: ${(error as Error).message}`);
    }
  }

  /**
   * Get concept relationships for a specific concept
   */
  async getConceptRelationships(userId: string, conceptId: string): Promise<ConceptRelationships> {
    try {
      logger.debug('Getting concept relationships', { userId, conceptId });
      
      // In production, this would call the backend API
      const response = await this.client.get<ConceptRelationships>(
        `/api/teacher/concepts/${conceptId}/relationships?userId=${userId}`
      );
      
      logger.debug('Received concept relationships', {
        relationshipTypes: Object.keys(response.data),
        conceptId
      });
      
      return response.data;
    } catch (error) {
      // For development, return mock data when the endpoint doesn't exist
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        logger.warn('Concept relationships endpoint not found, using mock data', { 
          userId, 
          conceptId 
        });
        
        // Return context-aware mock data based on the requested concept
        let mockData: ConceptRelationships = {};
        
        // Generate concept-specific relationships
        if (conceptId.toLowerCase().includes('react')) {
          mockData = {
            prerequisite: ['JavaScript', 'HTML', 'CSS', 'ES6 syntax'],
            related: ['Frontend frameworks', 'Component architecture', 'Virtual DOM'],
            builds_on: ['Web components', 'State management libraries'],
            examples: ['React Router', 'Redux', 'React Hooks'],
            applications: ['Single page applications', 'Mobile apps with React Native']
          };
        } else if (conceptId.toLowerCase().includes('typescript')) {
          mockData = {
            prerequisite: ['JavaScript', 'Basic type systems', 'OOP concepts'],
            related: ['Static type checking', 'Interfaces', 'Generics'],
            builds_on: ['JavaScript ecosystem', 'Transpilation'],
            examples: ['Interface vs Type', 'Union types', 'Utility types'],
            applications: ['Large-scale applications', 'Enterprise software']
          };
        } else {
          // Generic response for other concepts
          mockData = {
            prerequisite: ['Computer science fundamentals', 'Programming basics'],
            related: ['Software development', 'Web technologies'],
            builds_on: ['Algorithm design', 'Problem solving'],
            examples: ['Open source libraries', 'Programming paradigms']
          };
        }
        
        return mockData;
      }
      
      logger.error('Error getting concept relationships', { 
        error: (error as Error).message,
        userId,
        conceptId
      });
      
      throw new Error(`Failed to get concept relationships: ${(error as Error).message}`);
    }
  }

  /**
   * Get detected misconceptions for a user
   */
  async getMisconceptions(userId: string, conceptId?: string): Promise<Misconception[]> {
    try {
      logger.debug('Getting misconceptions', { userId, conceptId });
      
      // Build the endpoint URL
      const endpoint = conceptId 
        ? `/api/teacher/misconceptions/${userId}?conceptId=${conceptId}`
        : `/api/teacher/misconceptions/${userId}`;
      
      // In production, this would call the backend API
      const response = await this.client.get<Misconception[]>(endpoint);
      
      logger.debug('Received misconceptions', {
        count: response.data.length,
        userId,
        conceptId
      });
      
      return response.data;
    } catch (error) {
      // For development, return mock data when the endpoint doesn't exist
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        logger.warn('Misconceptions endpoint not found, using mock data', { 
          userId, 
          conceptId 
        });
        
        // Return mocked misconceptions
        const mockData: Misconception[] = [
          {
            misconception: "React hooks can only be used in functional components",
            correction: "This is actually correct - hooks can only be used in functional components, not class components.",
            confidenceLevel: 0.92,
            relatedConcept: "React hooks",
            detectedAt: new Date().toISOString()
          },
          {
            misconception: "TypeScript generics are just like Java generics",
            correction: "While similar, TypeScript generics have more powerful inference capabilities and work differently with type erasure.",
            confidenceLevel: 0.85,
            relatedConcept: "TypeScript generics",
            detectedAt: new Date().toISOString()
          }
        ];
        
        return mockData;
      }
      
      logger.error('Error getting misconceptions', { 
        error: (error as Error).message,
        userId,
        conceptId
      });
      
      throw new Error(`Failed to get misconceptions: ${(error as Error).message}`);
    }
  }
  
  /**
   * Get concept mastery information for a user
   */
  async getConceptMastery(userId: string): Promise<ConceptMastery[]> {
    try {
      logger.debug('Getting concept mastery', { userId });
      
      // In production, this would call the backend API
      const response = await this.client.get<ConceptMastery[]>(`/api/teacher/concepts/mastery/${userId}`);
      
      logger.debug('Received concept mastery data', {
        count: response.data.length,
        userId
      });
      
      return response.data;
    } catch (error) {
      // For development, return mock data when the endpoint doesn't exist
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        logger.warn('Concept mastery endpoint not found, using mock data', { userId });
        
        // Return mocked concept mastery data
        const mockData: ConceptMastery[] = [
          {
            concept: "JavaScript fundamentals",
            confidence: 0.85,
            lastUpdated: new Date().toISOString(),
            exposureCount: 12,
            category: "programming_fundamentals"
          },
          {
            concept: "React hooks",
            confidence: 0.42,
            lastUpdated: new Date().toISOString(),
            exposureCount: 5,
            category: "web_development",
            misconceptions: ["useState always causes re-render"]
          },
          {
            concept: "TypeScript generics",
            confidence: 0.35,
            lastUpdated: new Date().toISOString(),
            exposureCount: 3,
            category: "programming_fundamentals"
          },
          {
            concept: "HTML DOM manipulation",
            confidence: 0.92,
            lastUpdated: new Date().toISOString(),
            exposureCount: 15,
            category: "web_development"
          }
        ];
        
        return mockData;
      }
      
      logger.error('Error getting concept mastery', { 
        error: (error as Error).message,
        userId
      });
      
      throw new Error(`Failed to get concept mastery: ${(error as Error).message}`);
    }
  }
}

// Create and export a singleton instance
const teacherApi = new TeacherApiClient();
export default teacherApi; 