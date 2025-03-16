import { 
  ChatRequest, 
  ChatResponse, 
  TeachingContext, 
  TeachingResponse,
  TeachingStrategy
} from '../../shared/types';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api/teacher' 
  : 'http://localhost:3001/api/teacher';

/**
 * API client for interacting with the AI teacher backend
 */
export const teacherApi = {
  /**
   * Process a user message and get a teaching response
   */
  async interact(
    userId: string,
    message: string,
    context?: TeachingContext
  ): Promise<TeachingResponse> {
    try {
      const response = await fetch(`${API_URL}/interact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message,
          context
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error interacting with AI teacher:', error);
      return {
        content: "I'm sorry, I couldn't process your request due to a network error. Please try again later.",
        strategy: 'balanced',
        conceptsCovered: [],
        suggestedNextConcepts: [],
        messageType: 'error'
      };
    }
  },

  /**
   * Analyze the user's message to determine understanding
   */
  async analyzeUnderstanding(
    userId: string,
    message: string,
    concepts: string[]
  ): Promise<{
    isUnderstanding: boolean;
    confusedConcepts: string[];
    confidenceScore: number;
    suggestedApproach?: string;
  }> {
    try {
      const response = await fetch(`${API_URL}/analyze-understanding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message,
          concepts
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing understanding:', error);
      return {
        isUnderstanding: true, // Default to assuming understanding
        confusedConcepts: [],
        confidenceScore: 0.5
      };
    }
  },

  /**
   * Get all available teaching strategies
   */
  async getTeachingStrategies(): Promise<TeachingStrategy[]> {
    try {
      const response = await fetch(`${API_URL}/strategies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching teaching strategies:', error);
      return [];
    }
  },

  /**
   * Update user learning style
   */
  async updateLearningStyle(
    userId: string,
    learningStyle: { primary: string; secondary?: string }
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/learning-style`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          learningStyle
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating learning style:', error);
      return {
        success: false,
        message: 'Failed to update learning style due to a network error'
      };
    }
  },

  /**
   * Submit feedback on teaching effectiveness
   */
  async submitFeedback(
    userId: string,
    interactionId: string,
    rating: number,
    comment?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          interactionId,
          rating,
          comment
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return {
        success: false,
        message: 'Failed to submit feedback due to a network error'
      };
    }
  },

  /**
   * Process a chat message using the AI teacher
   * This is a convenience method that adapts the chat interface to the teacher API
   */
  async processChat(request: ChatRequest): Promise<ChatResponse> {
    try {
      // Convert ChatRequest to interact parameters
      const teachingContext: TeachingContext = {
        contextId: request.sessionId || `session-${Date.now()}`,
        courseId: request.courseId,
        moduleId: request.moduleId,
        relevantConcepts: request.concepts
      };

      // Call the interact method
      const teachingResponse = await this.interact(
        request.userId,
        request.message,
        teachingContext
      );

      // Convert TeachingResponse to ChatResponse
      return {
        role: 'assistant',
        content: teachingResponse.content,
        concepts: teachingResponse.conceptsCovered,
        suggestions: teachingResponse.suggestedNextConcepts,
        suggestedQuestions: teachingResponse.suggestedQuestions,
        interactionId: teachingResponse.interactionId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing chat:', error);
      return {
        role: 'assistant',
        content: "I'm sorry, I couldn't process your message. Please try again later.",
        concepts: [],
        timestamp: new Date().toISOString()
      };
    }
  }
}; 