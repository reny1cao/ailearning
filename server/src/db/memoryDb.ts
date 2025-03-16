import { 
  UserMemory, 
  ConceptMasteryInfo, 
  InteractionHistory, 
  UserLearningProfile,
  LearningInteraction
} from '../../../shared/types';

/**
 * In-memory database for user memory management
 * This would be replaced with a real database in production
 */
class MemoryDatabase {
  private userMemories: Map<string, UserMemory> = new Map();
  private learningProfiles: Map<string, UserLearningProfile> = new Map();
  private interactions: Map<string, any[]> = new Map();
  private feedbacks: Map<string, any[]> = new Map();
  private interactionIdCounter: number = 0;

  /**
   * Retrieves the memory state for a user
   */
  async getUserMemory(userId: string): Promise<UserMemory | null> {
    return this.userMemories.get(userId) || null;
  }

  /**
   * Updates a user's learning profile
   */
  async updateUserLearningProfile(profile: UserLearningProfile): Promise<void> {
    this.learningProfiles.set(profile.userId, profile);
    
    // Update the learning style in the user memory if it exists
    const memory = this.userMemories.get(profile.userId);
    if (memory) {
      memory.learningStyle = profile.learningStyle;
      this.userMemories.set(profile.userId, memory);
    } else {
      // Create a new memory if it doesn't exist
      const newMemory: UserMemory = {
        conceptMastery: {},
        learningStyle: profile.learningStyle,
        interactionHistory: []
      };
      this.userMemories.set(profile.userId, newMemory);
    }
  }

  /**
   * Updates the mastery level for a specific concept
   */
  async updateConceptMastery(conceptInfo: {
    userId: string;
    concept: string;
    confidence: number;
    lastUpdated: string;
  }): Promise<void> {
    const { userId, concept, confidence, lastUpdated } = conceptInfo;
    
    // Get the user's memory
    let memory = this.userMemories.get(userId);
    
    // Create memory if it doesn't exist
    if (!memory) {
      memory = {
        conceptMastery: {},
        learningStyle: {
          preferredExamples: [],
          comprehensionSpeed: 3,
          visualLearner: false,
          technicalLevel: 3,
          preferredFormat: 'text'
        },
        interactionHistory: []
      };
    }
    
    // Update the concept mastery
    memory.conceptMastery[concept] = {
      confidence,
      lastReviewed: lastUpdated
    };
    
    // Save the updated memory
    this.userMemories.set(userId, memory);
  }

  /**
   * Gets the mastery information for a specific concept
   */
  async getConceptMastery(userId: string, concept: string): Promise<any | null> {
    const memory = this.userMemories.get(userId);
    if (!memory || !memory.conceptMastery) {
      return null;
    }
    
    const masteryInfo = memory.conceptMastery[concept];
    if (!masteryInfo) {
      return null;
    }
    
    // Convert the internal format to the format expected by the calling code
    return {
      confidenceLevel: masteryInfo.confidence,
      lastUpdated: masteryInfo.lastReviewed,
      exposureCount: masteryInfo.reviewCount || 0,
      concept
    };
  }

  /**
   * Records a new interaction between the user and the AI
   */
  async recordInteraction(interaction: {
    userId: string;
    userMessage: string;
    aiResponse: string;
    concepts: string[];
    timestamp: string;
    contextId: string;
  }): Promise<string> {
    const { userId } = interaction;
    
    // Generate an interaction ID
    const interactionId = `interaction_${++this.interactionIdCounter}`;
    
    // Get or create the user's interactions array
    const userInteractions = this.interactions.get(userId) || [];
    
    // Add the new interaction
    userInteractions.push({
      id: interactionId,
      ...interaction
    });
    
    // Save the updated interactions
    this.interactions.set(userId, userInteractions);
    
    // Update the user's memory to include the interaction in their history
    const memory = this.userMemories.get(userId);
    if (memory) {
      // Only keep the last 20 interactions in memory
      const currentTime = new Date(interaction.timestamp);
      memory.interactionHistory.push({
        question: interaction.userMessage,
        answer: interaction.aiResponse,
        concepts: interaction.concepts,
        timestamp: currentTime
      });
      
      // Limit the history size
      if (memory.interactionHistory.length > 20) {
        memory.interactionHistory = memory.interactionHistory.slice(-20);
      }
      
      this.userMemories.set(userId, memory);
    }
    
    return interactionId;
  }

  /**
   * Records feedback for a specific AI response
   */
  async recordEffectivenessFeedback(feedback: {
    userId: string;
    interactionId: string;
    rating: number;
    comment?: string;
    timestamp: string;
  }): Promise<void> {
    const { userId, interactionId } = feedback;
    
    // Get the user's feedbacks
    const userFeedbacks = this.feedbacks.get(userId) || [];
    
    // Add the new feedback
    userFeedbacks.push(feedback);
    
    // Save the updated feedbacks
    this.feedbacks.set(userId, userFeedbacks);
  }

  /**
   * Retrieves similar past interactions based on concepts
   * In a real implementation, this would use vector similarity search
   */
  async getRelevantInteractions(
    userId: string,
    concepts: string[],
    limit: number = 5
  ): Promise<any[]> {
    // Get the user's interactions
    const userInteractions = this.interactions.get(userId) || [];
    
    // Filter interactions that contain at least one of the specified concepts
    // In a real implementation, this would use embedding similarity
    const relevantInteractions = userInteractions.filter(interaction => {
      return interaction.concepts.some(concept => concepts.includes(concept));
    });
    
    // Return the most recent relevant interactions up to the limit
    return relevantInteractions.slice(-limit);
  }
}

// Create and export a singleton instance
export const memoryDb = new MemoryDatabase(); 