import { UserMemoryManager } from '../memory/UserMemoryManager';
import { ConceptExtractor } from '../concepts/ConceptExtractor';
import { TeachingStrategist } from '../strategies/TeachingStrategist';
import { DeepSeekService } from '../llm/DeepSeekService';
import {
  TeachingContext,
  UserProfile,
  KnowledgeState,
  TeachingMessage,
  TeachingResponse,
  TeachingStrategy,
  Message
} from '../../../../../shared/types';

/**
 * Main AI Teacher service that orchestrates the teaching process by combining
 * concept extraction, teaching strategies, and memory management.
 */
export class AITeacher {
  private memoryManager: UserMemoryManager;
  private conceptExtractor: ConceptExtractor;
  private teachingStrategist: TeachingStrategist;
  private llmService: DeepSeekService;
  
  constructor() {
    this.memoryManager = new UserMemoryManager();
    this.conceptExtractor = new ConceptExtractor();
    this.teachingStrategist = new TeachingStrategist();
    this.llmService = new DeepSeekService();
  }
  
  /**
   * Process a learning interaction and generate an AI teacher response
   */
  async processInteraction(
    userId: string,
    message: string,
    context: TeachingContext
  ): Promise<TeachingResponse> {
    try {
      // 1. Get user memory and knowledge state
      const userMemory = await this.memoryManager.getUserMemory(userId);
      
      if (!userMemory) {
        throw new Error(`User memory not found for userId: ${userId}`);
      }
      
      // Extract user profile and knowledge state from memory
      const userProfile: UserProfile = {
        userId,
        learningStyle: userMemory.learningStyle || {
          primary: 'visual',
          secondary: 'reading'
        },
        preferences: userMemory.preferences || {},
        goals: context.goals || []
      };
      
      const knowledgeState: KnowledgeState = {
        conceptMastery: userMemory.conceptMastery || {},
        overallMastery: this.calculateOverallMastery(userMemory.conceptMastery || {}),
        currentConcepts: context.relevantConcepts || []
      };
      
      // 2. Extract concepts from the user message
      const extractedConcepts = await this.conceptExtractor.extractConcepts(message);
      
      // Add extracted concepts to context
      context.relevantConcepts = [
        ...(context.relevantConcepts || []),
        ...extractedConcepts
      ].filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
      
      // 3. Get relevant past interactions based on concepts
      const relevantInteractions = await this.memoryManager.getRelevantInteractions(
        userId, 
        extractedConcepts,
        5
      );
      
      // 4. Select teaching strategy based on user profile and knowledge state
      const strategy = this.teachingStrategist.getStrategy(userProfile, knowledgeState);
      
      // 5. Generate teaching response
      const response = await this.generateResponse(
        message,
        context,
        userProfile,
        knowledgeState,
        strategy,
        relevantInteractions
      );
      
      // 6. Update user memory with this interaction
      const interactionId = await this.memoryManager.recordInteraction({
        userId,
        timestamp: new Date().toISOString(),
        userMessage: message,
        aiResponse: response.content,
        concepts: extractedConcepts,
        contextId: context.contextId
      });
      
      // Add the interaction ID to the response for future feedback
      response.interactionId = interactionId;
      
      // 7. Update concept mastery based on interaction
      for (const concept of extractedConcepts) {
        // For now, slightly increase mastery for each concept encountered
        // In a real implementation, this would be more sophisticated
        const currentMastery = knowledgeState.conceptMastery[concept]?.confidenceLevel || 0;
        await this.memoryManager.updateConceptMastery({
          userId,
          concept,
          confidenceLevel: Math.min(currentMastery + 0.05, 1),
          lastUpdated: new Date().toISOString()
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error in AI Teacher processing:', error);
      return {
        content: "I'm sorry, I encountered an error while processing your request. Could you please try again?",
        strategy: 'balanced',
        conceptsCovered: [],
        suggestedNextConcepts: [],
        messageType: 'error'
      };
    }
  }
  
  /**
   * Calculate overall mastery level based on concept mastery
   */
  private calculateOverallMastery(conceptMastery: Record<string, { confidenceLevel: number }>): number {
    const concepts = Object.values(conceptMastery);
    if (concepts.length === 0) return 0;
    
    const sum = concepts.reduce((acc, concept) => acc + concept.confidenceLevel, 0);
    return sum / concepts.length;
  }
  
  /**
   * Generate a teaching response
   */
  private async generateResponse(
    userMessage: string,
    context: TeachingContext,
    userProfile: UserProfile,
    knowledgeState: KnowledgeState,
    strategy: TeachingStrategy,
    relevantInteractions: any[]
  ): Promise<TeachingResponse> {
    try {
      // Ensure we have relevant concepts
      const relevantConcepts = context.relevantConcepts || [];
      const mainConcept = relevantConcepts.length > 0 ? relevantConcepts[0] : 'the topic';
      
      // Generate a teaching prompt based on the selected strategy
      const teachingPrompt = this.teachingStrategist.generateTeachingPrompt(
        strategy,
        mainConcept,
        knowledgeState
      );
      
      // Convert relevant interactions to message history if available
      const previousMessages: Message[] = relevantInteractions
        .slice(0, 3) // Only use the 3 most recent relevant interactions
        .map(interaction => [
          { role: 'user', content: interaction.userMessage },
          { role: 'assistant', content: interaction.aiResponse }
        ])
        .flat();
        
      // Determine user learning style description
      const learningStyleDescription = this.getLearningStyleDescription(userProfile.learningStyle);
      
      // Use the DeepSeek API to generate a teaching response
      let responseContent: string;
      
      try {
        responseContent = await this.llmService.generateTeachingResponse(
          userMessage,
          teachingPrompt,
          relevantConcepts,
          learningStyleDescription,
          previousMessages
        );
      } catch (llmError) {
        console.error('LLM response generation failed, falling back to template:', llmError);
        
        // Fallback to template response
        responseContent = `${teachingPrompt}
        
In AI learning, ${mainConcept} is a fundamental concept that involves understanding how machines can learn patterns from data. 

Here's a simple explanation that matches your learning style:

${this.generateExampleBasedOnStrategy(strategy, mainConcept)}

Would you like to explore this concept further or learn about related concepts?`;
      }
      
      // Generate follow-up questions
      let suggestedQuestions: string[] = [];
      try {
        suggestedQuestions = await this.llmService.generateFollowUpQuestions(
          responseContent,
          relevantConcepts
        );
      } catch (error) {
        console.error('Failed to generate follow-up questions:', error);
        // Use defaults
        suggestedQuestions = [
          `Can you explain how ${mainConcept} works in your own words?`,
          `What's an example of ${mainConcept} in real-world applications?`,
          `How does ${mainConcept} relate to other concepts you've learned?`
        ];
      }
      
      // Get related concepts for suggestions
      const relatedConcepts = relevantConcepts.length > 0 
        ? await this.conceptExtractor.getRelatedConcepts(relevantConcepts[0])
        : [];
      
      return {
        content: responseContent,
        strategy: strategy.name,
        conceptsCovered: relevantConcepts,
        suggestedNextConcepts: relatedConcepts,
        suggestedQuestions,
        messageType: 'teaching'
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        content: "I'm sorry, I had trouble generating a response. Let's try a different approach to explain this concept.",
        strategy: 'balanced',
        conceptsCovered: context.relevantConcepts || [],
        suggestedNextConcepts: [],
        messageType: 'fallback'
      };
    }
  }
  
  /**
   * Get a description of the user's learning style for the LLM
   */
  private getLearningStyleDescription(learningStyle: any): string {
    const primary = learningStyle.primary || 'balanced';
    const secondary = learningStyle.secondary || '';
    
    const styleDescriptions: Record<string, string> = {
      'visual': 'prefers visual explanations, diagrams, and imagery',
      'auditory': 'learns best through spoken explanations and discussions',
      'reading': 'prefers text-based explanations and definitions',
      'kinesthetic': 'learns through practical examples and hands-on activities',
      'theoretical': 'appreciates conceptual understanding and abstract reasoning',
      'practical': 'prefers real-world applications and examples',
      'balanced': 'has a balanced learning style'
    };
    
    const primaryDesc = styleDescriptions[primary] || styleDescriptions['balanced'];
    const secondaryDesc = secondary ? ` with elements of ${styleDescriptions[secondary]}` : '';
    
    return `${primaryDesc}${secondaryDesc}`;
  }
  
  /**
   * Generate an example based on teaching strategy
   */
  private generateExampleBasedOnStrategy(strategy: TeachingStrategy, concept: string): string {
    // Examples for different strategy types
    const examples: Record<string, string> = {
      'Visual Learning': `Imagine ${concept} as a tree where the root is the training data, the branches are decision paths, and the leaves are predictions.`,
      
      'Reading/Writing Learning': `${concept} can be defined as the process where algorithms improve their performance at a task with experience. It has three main components: representation, evaluation, and optimization.`,
      
      'Kinesthetic Learning': `Let's try a hands-on example: Think of how you would classify emails as spam or not spam. You would first collect examples of both, extract features like certain words or patterns, train a model, and then test it on new emails.`,
      
      'Conceptual Learning': `The theoretical foundation of ${concept} is rooted in statistical learning theory, which provides a framework for understanding how learning from data is possible.`,
      
      'Practical Learning': `In real-world applications, ${concept} is used to solve problems like fraud detection by learning patterns from historical transaction data to identify suspicious activities.`,
      
      'Socratic Learning': `What do you think would happen if we applied ${concept} to a dataset without proper preprocessing? How might this affect the model's performance?`
    };
    
    // Return the example for the matching strategy name or a default
    return examples[strategy.name] || `${concept} involves learning patterns from data to make predictions or decisions without explicit programming.`;
  }
  
  /**
   * Get available teaching strategies
   */
  async getTeachingStrategies(): Promise<TeachingStrategy[]> {
    return this.teachingStrategist.getAllStrategies();
  }
  
  /**
   * Update user learning style
   */
  async updateLearningStyle(
    userId: string, 
    learningStyle: { primary: string; secondary?: string }
  ): Promise<void> {
    await this.memoryManager.updateUserLearningProfile({
      userId,
      learningStyle,
      lastUpdated: new Date().toISOString()
    });
  }
  
  /**
   * Record feedback on teaching effectiveness
   */
  async recordFeedback(
    userId: string,
    interactionId: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    await this.memoryManager.recordEffectivenessFeedback({
      userId,
      interactionId,
      rating,
      comment,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Analyze user's message to determine understanding level
   */
  async analyzeUnderstanding(
    userId: string, 
    message: string, 
    conceptsBeingTaught: string[]
  ): Promise<{
    isUnderstanding: boolean;
    confusedConcepts: string[];
    confidenceScore: number;
  }> {
    try {
      // Use the LLM to analyze understanding
      return await this.llmService.analyzeUnderstanding(message, conceptsBeingTaught);
    } catch (error) {
      console.error('Error analyzing understanding:', error);
      // Return a default analysis in case of error
      return {
        isUnderstanding: true,
        confusedConcepts: [],
        confidenceScore: 0.5
      };
    }
  }
} 