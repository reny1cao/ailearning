import { 
  UserMemory, 
  ConceptMasteryInfo, 
  InteractionHistory, 
  UserLearningProfile,
  LearningInteraction
} from '../../../shared/types';

/**
 * In-memory database for the memory service.
 * Note: This is a temporary solution for development.
 * In production, this would be replaced with a real database.
 */
class MemoryDatabase {
  private userMemories: Map<string, UserMemory>;
  
  constructor() {
    this.userMemories = new Map();
    this.initializeMockData();
  }
  
  /**
   * Initialize mock data for development
   */
  private initializeMockData(): void {
    // Create a mock user
    const mockUserId = 'user-123';
    const mockUserMemory: UserMemory = {
      userId: mockUserId,
      learningStyle: {
        primary: 'visual',
        secondary: 'kinesthetic'
      },
      preferences: {
        detailLevel: 'medium',
        exampleFrequency: 'high',
        pace: 'moderate'
      },
      conceptMastery: {
        'neural-networks': {
          confidenceLevel: 0.7,
          lastUpdated: new Date().toISOString()
        },
        'deep-learning': {
          confidenceLevel: 0.5,
          lastUpdated: new Date().toISOString()
        },
        'backpropagation': {
          confidenceLevel: 0.3,
          lastUpdated: new Date().toISOString()
        }
      },
      interactionHistory: [
        {
          interactionId: 'interaction-1',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          userMessage: 'Can you explain neural networks?',
          aiResponse: 'Neural networks are computing systems inspired by biological neural networks...',
          concepts: ['neural-networks'],
          contextId: 'context-1'
        },
        {
          interactionId: 'interaction-2',
          timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
          userMessage: 'How does backpropagation work?',
          aiResponse: 'Backpropagation is an algorithm used to train neural networks...',
          concepts: ['backpropagation', 'neural-networks'],
          contextId: 'context-1'
        }
      ]
    };
    
    // Add mock user to database
    this.userMemories.set(mockUserId, mockUserMemory);
  }
  
  /**
   * Get user memory by user ID
   */
  async getUserMemory(userId: string): Promise<UserMemory | null> {
    return this.userMemories.get(userId) || null;
  }
  
  /**
   * Create or update user learning profile
   */
  async updateUserLearningProfile(profile: UserLearningProfile): Promise<void> {
    const memory = this.userMemories.get(profile.userId);
    
    if (memory) {
      // Update existing memory
      memory.learningStyle = profile.learningStyle;
      memory.preferences = profile.preferences || memory.preferences;
    } else {
      // Create new user memory
      this.userMemories.set(profile.userId, {
        userId: profile.userId,
        learningStyle: profile.learningStyle,
        preferences: profile.preferences || {},
        conceptMastery: {},
        interactionHistory: []
      });
    }
  }
  
  /**
   * Update concept mastery for a user
   */
  async updateConceptMastery(conceptInfo: ConceptMasteryInfo): Promise<void> {
    const memory = this.userMemories.get(conceptInfo.userId);
    
    if (!memory) {
      throw new Error(`User memory not found for userId: ${conceptInfo.userId}`);
    }
    
    if (!memory.conceptMastery) {
      memory.conceptMastery = {};
    }
    
    memory.conceptMastery[conceptInfo.concept] = {
      confidenceLevel: conceptInfo.confidenceLevel,
      lastUpdated: conceptInfo.lastUpdated
    };
  }
  
  /**
   * Record a new interaction between the user and the AI
   */
  async recordInteraction(interaction: LearningInteraction): Promise<string> {
    const memory = this.userMemories.get(interaction.userId);
    
    if (!memory) {
      throw new Error(`User memory not found for userId: ${interaction.userId}`);
    }
    
    if (!memory.interactionHistory) {
      memory.interactionHistory = [];
    }
    
    // Generate a unique interaction ID
    const interactionId = `interaction-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create interaction record
    const interactionRecord: InteractionHistory = {
      interactionId,
      timestamp: interaction.timestamp,
      userMessage: interaction.userMessage,
      aiResponse: interaction.aiResponse,
      concepts: interaction.concepts,
      contextId: interaction.contextId
    };
    
    // Add to history
    memory.interactionHistory.push(interactionRecord);
    
    return interactionId;
  }
  
  /**
   * Record feedback for AI effectiveness
   */
  async recordEffectivenessFeedback(feedback: {
    userId: string;
    interactionId: string;
    rating: number;
    comment?: string;
    timestamp: string;
  }): Promise<void> {
    const memory = this.userMemories.get(feedback.userId);
    
    if (!memory) {
      throw new Error(`User memory not found for userId: ${feedback.userId}`);
    }
    
    // Find the interaction
    const interaction = memory.interactionHistory?.find(
      i => i.interactionId === feedback.interactionId
    );
    
    if (!interaction) {
      throw new Error(`Interaction not found: ${feedback.interactionId}`);
    }
    
    // Add feedback to the interaction
    interaction.feedback = {
      rating: feedback.rating,
      comment: feedback.comment,
      timestamp: feedback.timestamp
    };
  }
  
  /**
   * Get relevant interactions based on concepts or content similarity
   */
  async getRelevantInteractions(
    userId: string,
    concepts: string[],
    limit: number = 5
  ): Promise<InteractionHistory[]> {
    const memory = this.userMemories.get(userId);
    
    if (!memory || !memory.interactionHistory) {
      return [];
    }
    
    // Filter interactions that contain any of the specified concepts
    const relevantInteractions = memory.interactionHistory.filter(interaction => {
      if (!interaction.concepts) return false;
      
      return interaction.concepts.some(concept => 
        concepts.includes(concept)
      );
    });
    
    // Sort by recency (newest first)
    relevantInteractions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Return the most recent relevant interactions
    return relevantInteractions.slice(0, limit);
  }
}

// Export singleton instance
export const memoryDb = new MemoryDatabase(); 