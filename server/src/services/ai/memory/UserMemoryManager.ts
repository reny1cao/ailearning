import { 
  UserMemory, 
  ConceptMasteryInfo, 
  LearningStyle, 
  InteractionHistory,
  UserLearningProfile,
  ConceptMastery,
  LearningInteraction
} from '../../../../../shared/types';
import { memoryDb } from '../../../db/memoryDb';

/**
 * Manages user memory including learning styles, concept mastery, and interaction history.
 * Provides enhanced memory capabilities for the AI teacher.
 */
export class UserMemoryManager {
  /**
   * Retrieves the complete memory state for a user
   */
  async getUserMemory(userId: string): Promise<UserMemory | null> {
    try {
      const memory = await memoryDb.getUserMemory(userId);
      
      if (!memory) {
        console.log(`No memory found for user ${userId}, creating default memory`);
        // Create default memory if none exists
        const defaultMemory: UserMemory = {
          conceptMastery: {},
          learningStyle: {
            preferredExamples: [],
            comprehensionSpeed: 3,
            visualLearner: false,
            technicalLevel: 3,
            preferredFormat: 'text',
            preferredLearningPace: 'moderate',
            preferredCommunicationStyle: 'conversational'
          },
          interactionHistory: [],
          knowledgeGraph: {
            nodes: [],
            edges: []
          }
        };
        
        // Store the default memory for future use
        await this.initializeUserMemory(userId, defaultMemory);
        
        return defaultMemory;
      }
      
      return memory;
    } catch (error) {
      console.error('Error retrieving user memory:', error);
      return null;
    }
  }
  
  /**
   * Initializes a new user memory record
   */
  private async initializeUserMemory(userId: string, memory: UserMemory): Promise<void> {
    try {
      // Instead of using the non-existent createUserMemory method,
      // use updateUserLearningProfile which will also create the user memory
      await memoryDb.updateUserLearningProfile({
        id: '',
        userId: userId,
        learningStyle: memory.learningStyle,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Additionally, initialize some basic concept mastery if needed
      if (Object.keys(memory.conceptMastery).length > 0) {
        for (const [concept, mastery] of Object.entries(memory.conceptMastery)) {
          await memoryDb.updateConceptMastery({
            userId,
            concept,
            confidence: mastery.confidence,
            lastUpdated: (mastery.lastReviewed instanceof Date) 
              ? mastery.lastReviewed.toISOString() 
              : (typeof mastery.lastReviewed === 'string')
                ? mastery.lastReviewed
                : new Date().toISOString()
          });
        }
      }
      
      console.log(`Initialized memory for user ${userId}`);
    } catch (error) {
      console.error('Error initializing user memory:', error);
    }
  }
  
  /**
   * Creates or updates a user's learning profile
   */
  async updateUserLearningProfile(profile: UserLearningProfile): Promise<void> {
    try {
      await memoryDb.updateUserLearningProfile(profile);
      console.log(`Updated learning profile for user ${profile.userId}`);
    } catch (error) {
      console.error('Error updating user learning profile:', error);
      throw new Error('Failed to update user learning profile');
    }
  }
  
  /**
   * Updates the mastery level for a specific concept
   */
  async updateConceptMastery(conceptInfo: {
    userId: string;
    concept: string;
    confidenceLevel: number;
    lastUpdated: string;
    misconceptions?: string[];
    exposureCount?: number;
  }): Promise<void> {
    try {
      const { 
        userId, 
        concept, 
        confidenceLevel, 
        lastUpdated,
        misconceptions = [],
        exposureCount
      } = conceptInfo;
      
      // Ensure confidence level is between 0 and 1
      const normalizedConfidence = Math.max(0, Math.min(1, confidenceLevel));
      
      // Update the concept mastery in the database
      await memoryDb.updateConceptMastery({
        userId,
        concept,
        confidence: normalizedConfidence,
        lastUpdated,
        misconceptions,
        exposureCount
      });
      
      // Update the knowledge graph with this concept
      await this.updateKnowledgeGraph(userId, concept, misconceptions);
      
      console.log(`Updated mastery for concept "${concept}" for user ${userId} to ${normalizedConfidence}`);
    } catch (error) {
      console.error('Error updating concept mastery:', error);
      throw new Error('Failed to update concept mastery');
    }
  }
  
  /**
   * Updates the knowledge graph with new concept relationships
   */
  private async updateKnowledgeGraph(
    userId: string, 
    concept: string, 
    misconceptions: string[] = []
  ): Promise<void> {
    try {
      // Get the current knowledge graph
      const memory = await this.getUserMemory(userId);
      if (!memory || !memory.knowledgeGraph) return;
      
      const graph = memory.knowledgeGraph;
      
      // Check if concept already exists as a node
      const existingNodeIndex = graph.nodes.findIndex(node => node.id === concept);
      
      if (existingNodeIndex === -1) {
        // Add new concept node
        graph.nodes.push({
          id: concept,
          type: 'concept',
          label: concept
        });
      }
      
      // Add misconception relationships
      for (const misconception of misconceptions) {
        // Add misconception as a node if it doesn't exist
        if (!graph.nodes.some(node => node.id === misconception)) {
          graph.nodes.push({
            id: misconception,
            type: 'misconception',
            label: misconception
          });
        }
        
        // Add edge between concept and misconception if it doesn't exist
        if (!graph.edges.some(edge => 
          edge.source === concept && edge.target === misconception)) {
          graph.edges.push({
            source: concept,
            target: misconception,
            type: 'has_misconception'
          });
        }
      }
      
      // Save updated graph
      await memoryDb.updateKnowledgeGraph(userId, graph);
    } catch (error) {
      console.error('Error updating knowledge graph:', error);
    }
  }
  
  /**
   * Records a new interaction between the user and the AI
   */
  async recordInteraction(interaction: LearningInteraction): Promise<string> {
    try {
      // Ensure we have a valid timestamp (handle both Date objects and ISO strings)
      const timestamp = interaction.timestamp || interaction.createdAt;
      const timestampStr = typeof timestamp === 'string' 
        ? timestamp 
        : timestamp instanceof Date 
          ? timestamp.toISOString()
          : new Date().toISOString();
      
      // Convert to the format expected by memoryDb
      const dbInteraction = {
        userId: interaction.userId,
        userMessage: interaction.question || interaction.message,
        aiResponse: interaction.answer || interaction.response,
        concepts: interaction.concepts || [],
        timestamp: timestampStr,
        contextId: interaction.sessionId,
        effectiveness: interaction.effectiveness || 0.5,
        userFeedback: interaction.userFeedback
      };
      
      const interactionId = await memoryDb.recordInteraction(dbInteraction);
      console.log(`Recorded interaction ${interactionId} for user ${interaction.userId}`);
      
      // Update concept exposure counts
      try {
        for (const concept of (interaction.concepts || [])) {
          try {
            // Try to get existing mastery info, but don't fail if it doesn't exist
            let exposureCount = 1;
            let confidenceLevel = 0.1;
            
            try {
              const existingMastery = await memoryDb.getConceptMastery(interaction.userId, concept);
              if (existingMastery) {
                exposureCount = (existingMastery.exposureCount || 0) + 1;
                confidenceLevel = existingMastery.confidenceLevel;
              }
            } catch (masteryError) {
              console.warn(`Could not retrieve concept mastery for ${concept}:`, masteryError);
              // Continue with defaults
            }
            
            await this.updateConceptMastery({
              userId: interaction.userId,
              concept,
              confidenceLevel,
              lastUpdated: timestampStr,
              exposureCount
            });
          } catch (conceptError) {
            console.error(`Error updating concept mastery for ${concept}:`, conceptError);
          }
        }
      } catch (conceptsError) {
        console.error('Error updating concept masteries:', conceptsError);
      }
      
      return interactionId;
    } catch (error) {
      console.error('Error recording interaction:', error);
      throw new Error('Failed to record interaction');
    }
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
    try {
      await memoryDb.recordEffectivenessFeedback(feedback);
      console.log(`Recorded feedback for interaction ${feedback.interactionId}`);
      
      // Update concept mastery based on feedback
      const interaction = await memoryDb.getInteraction(feedback.interactionId);
      if (interaction && interaction.concepts) {
        for (const concept of interaction.concepts) {
          const currentMastery = await memoryDb.getConceptMastery(feedback.userId, concept);
          if (currentMastery) {
            // Adjust confidence based on feedback rating (normalize from 0-5 to 0-1)
            const adjustedConfidence = 
              currentMastery.confidence + ((feedback.rating / 5) - 0.5) * 0.2;
            
            await this.updateConceptMastery({
              userId: feedback.userId,
              concept,
              confidenceLevel: adjustedConfidence,
              lastUpdated: feedback.timestamp
            });
          }
        }
      }
    } catch (error) {
      console.error('Error recording effectiveness feedback:', error);
      throw new Error('Failed to record effectiveness feedback');
    }
  }
  
  /**
   * Retrieves similar past interactions based on concepts or content
   */
  async getRelevantInteractions(
    userId: string,
    concepts: string[],
    limit: number = 5
  ): Promise<any[]> {
    try {
      return await memoryDb.getRelevantInteractions(userId, concepts, limit);
    } catch (error) {
      console.error('Error retrieving relevant interactions:', error);
      return [];
    }
  }
  
  /**
   * Gets learning analytics for a user
   */
  async getLearningAnalytics(userId: string): Promise<{
    masteredConcepts: string[];
    struggleConcepts: string[];
    learningRate: number;
    recommendedReview: string[];
  }> {
    try {
      // Get all concept mastery for user
      const conceptMasteries = await memoryDb.getAllConceptMastery(userId);
      
      // Identify mastered and struggle concepts
      const masteredConcepts = conceptMasteries
        .filter(c => c.confidence >= 0.8)
        .map(c => c.concept);
      
      const struggleConcepts = conceptMasteries
        .filter(c => c.confidence < 0.4 && c.exposureCount >= 2)
        .map(c => c.concept);
      
      // Calculate learning rate (average change in confidence over time)
      const interactionHistory = await memoryDb.getInteractionHistory(userId, 20);
      const learningRate = this.calculateLearningRate(interactionHistory, conceptMasteries);
      
      // Identify concepts for review
      const recommendedReview = conceptMasteries
        .filter(c => {
          const lastReviewed = new Date(c.lastUpdated).getTime();
          const daysSinceReview = (Date.now() - lastReviewed) / (1000 * 60 * 60 * 24);
          return daysSinceReview > 7 && c.confidence < 0.9 && c.confidence > 0.5;
        })
        .map(c => c.concept);
      
      return {
        masteredConcepts,
        struggleConcepts,
        learningRate,
        recommendedReview
      };
    } catch (error) {
      console.error('Error getting learning analytics:', error);
      return {
        masteredConcepts: [],
        struggleConcepts: [],
        learningRate: 0,
        recommendedReview: []
      };
    }
  }
  
  /**
   * Calculates the user's learning rate based on interaction history
   */
  private calculateLearningRate(
    interactions: any[],
    conceptMasteries: any[]
  ): number {
    if (interactions.length < 2 || conceptMasteries.length === 0) {
      return 0.5; // Default middle value
    }
    
    // Get oldest and newest confidence levels for concepts
    const confidenceDiffs: number[] = [];
    
    for (const mastery of conceptMasteries) {
      if (mastery.exposureCount >= 2) {
        const conceptInteractions = interactions
          .filter(i => i.concepts.includes(mastery.concept))
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        if (conceptInteractions.length >= 2) {
          // Calculate confidence change rate
          const oldestInteraction = conceptInteractions[0];
          const newestInteraction = conceptInteractions[conceptInteractions.length - 1];
          
          const timeDiff = (new Date(newestInteraction.timestamp).getTime() - 
                           new Date(oldestInteraction.timestamp).getTime()) / (1000 * 60 * 60 * 24);
          
          // If we have meaningful time difference, calculate rate
          if (timeDiff > 0) {
            const confidenceChange = mastery.confidence / timeDiff;
            confidenceDiffs.push(confidenceChange);
          }
        }
      }
    }
    
    // Return average learning rate if we have data
    if (confidenceDiffs.length > 0) {
      return confidenceDiffs.reduce((sum, val) => sum + val, 0) / confidenceDiffs.length;
    }
    
    return 0.5; // Default middle value
  }
} 