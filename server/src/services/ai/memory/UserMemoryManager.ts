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
 */
export class UserMemoryManager {
  /**
   * Retrieves the complete memory state for a user
   */
  async getUserMemory(userId: string): Promise<UserMemory | null> {
    try {
      return await memoryDb.getUserMemory(userId);
    } catch (error) {
      console.error('Error retrieving user memory:', error);
      return null;
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
  async updateConceptMastery(conceptInfo: ConceptMasteryInfo): Promise<void> {
    try {
      await memoryDb.updateConceptMastery(conceptInfo);
      console.log(`Updated mastery for concept ${conceptInfo.concept} for user ${conceptInfo.userId}`);
    } catch (error) {
      console.error('Error updating concept mastery:', error);
      throw new Error('Failed to update concept mastery');
    }
  }
  
  /**
   * Records a new interaction between the user and the AI
   */
  async recordInteraction(interaction: LearningInteraction): Promise<string> {
    try {
      const interactionId = await memoryDb.recordInteraction(interaction);
      console.log(`Recorded interaction ${interactionId} for user ${interaction.userId}`);
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
  ): Promise<InteractionHistory[]> {
    try {
      return await memoryDb.getRelevantInteractions(userId, concepts, limit);
    } catch (error) {
      console.error('Error retrieving relevant interactions:', error);
      return [];
    }
  }
} 