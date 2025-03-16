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
import { memoryDb } from '../../../db/memoryDb';
import { env } from '../../../config/env';
import logger from '../../../utils/logger';

/**
 * Main AI Teacher service that orchestrates the teaching process
 * - Manages user memory and knowledge state
 * - Extracts concepts from interactions
 * - Selects appropriate teaching strategies
 * - Generates personalized responses
 */
export class AITeacher {
  private memoryManager: UserMemoryManager;
  private conceptExtractor: ConceptExtractor;
  private teachingStrategist: TeachingStrategist;
  private llmService: DeepSeekService;
  
  constructor() {
    this.llmService = new DeepSeekService();
    this.memoryManager = new UserMemoryManager();
    this.conceptExtractor = new ConceptExtractor(this.llmService);
    this.teachingStrategist = new TeachingStrategist(this.llmService);

    console.log('AI Teacher initialized');
    if (env.hasDeepSeekApiKey()) {
      console.log('DeepSeek API is configured and ready for use');
    } else {
      console.warn('DeepSeek API is not configured. Using fallback teaching methods.');
    }
  }
  
  /**
   * Process a user interaction and generate a teaching response
   */
  async processInteraction(
    userId: string,
    sessionId: string,
    message: string,
    previousMessages: Message[] = []
  ): Promise<TeachingResponse> {
    try {
      console.log(`Processing interaction for user ${userId}, session ${sessionId}`);
      
      // Step 1: Extract key concepts from the user's message
      console.log('Extracting concepts from user message');
      const concepts = await this.conceptExtractor.extractConcepts(message);
      console.log('Extracted concepts:', concepts);
      
      // Step 2: Retrieve user memory
      console.log('Retrieving user memory');
      const userMemory = await this.memoryManager.getUserMemory(userId);
      if (!userMemory) {
        console.warn(`No memory found for user ${userId}`);
      }
      
      // Step 3: Build teaching context
      const context: TeachingContext = {
        userId,
        sessionId,
        userMessage: message,
        conceptsToTeach: concepts,
        previousMessages,
        userProfile: userMemory ? {
          learningStyle: userMemory.learningStyle,
          knowledgeState: this.buildKnowledgeState(userMemory)
        } : undefined,
        previousInteractions: [] // We'll implement this later
      };
      
      // Step 4: Select teaching strategy
      console.log('Selecting teaching strategy');
      const strategy = await this.teachingStrategist.selectStrategy(context);
      console.log('Selected strategy:', strategy.approach);
      
      // Step 5: Generate teaching response
      console.log('Generating teaching response');
      const response = await this.generateResponse(context, strategy);
      
      // Step 6: Record interaction
      console.log('Recording interaction in memory');
      await this.memoryManager.recordInteraction({
        userId,
        sessionId,
        id: `interaction_${Date.now()}`,
        question: message,
        answer: response.content,
        concepts,
        createdAt: new Date()
      });
      
      // Step 7: Update concept mastery (we'll improve this with feedback later)
      for (const concept of concepts) {
        await this.memoryManager.updateConceptMastery({
          userId,
          concept,
          confidenceLevel: 0.5, // Default increase - will be refined with feedback
          lastUpdated: new Date().toISOString()
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error processing interaction:', error);
      
      // Provide a fallback response
      return {
        content: "I'm sorry, I encountered an issue while processing your question. Could you please rephrase or try asking something else?",
        strategyUsed: {
          approach: 'explanatory',
          adaptations: [],
          rationale: 'Fallback due to error',
          confidenceLevel: 0.1
        },
        relatedConcepts: [],
        followupQuestions: []
      };
    }
  }
  
  /**
   * Process a user interaction and stream a teaching response
   * @param userId User identifier
   * @param sessionId Session identifier
   * @param message User message
   * @param previousMessages Previous messages in the conversation
   * @param onChunk Callback for each chunk of the response
   * @param onComplete Callback when processing is complete
   * @param onError Callback if an error occurs
   */
  async processInteractionStream(
    userId: string,
    sessionId: string,
    message: string,
    previousMessages: Message[] = [],
    onChunk: (chunk: string) => void,
    onComplete: (response: TeachingResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      logger.info('Processing streaming interaction', { userId, sessionId });
      
      // Safety check - ensure services are available
      if (!this.llmService || !this.memoryManager) {
        throw new Error('Required services not initialized');
      }

      // Get user memory or initialize
      let userMemory = await this.memoryManager.getUserMemory(userId);
      if (!userMemory) {
        logger.info('Initializing new user memory', { userId });
        userMemory = {
          conceptMastery: {},
          learningStyle: {
            preferredExamples: [],
            comprehensionSpeed: 0.5,
            visualLearner: false,
            technicalLevel: 3,
            preferredFormat: 'text'
          },
          interactionHistory: {
            commonQuestions: [],
            responseEffectiveness: {}
          }
        };
        
        // Don't wait for initialization to complete
        this.memoryManager.initializeUserMemory(userId, userMemory).catch(err => {
          logger.error('Failed to initialize user memory', { userId, error: err });
        });
      }

      // Build knowledge state
      const knowledgeState = this.buildKnowledgeState(userMemory);
      
      // Extract concepts
      const detectedConcepts = await this.conceptExtractor.extractConcepts(message);
      logger.debug('Extracted concepts from message', { concepts: detectedConcepts });
      
      // Determine teaching strategy
      const strategy = await this.teachingStrategist.selectStrategy({
        userId,
        sessionId,
        userMessage: message,
        conceptsToTeach: detectedConcepts,
        previousMessages,
        userProfile: {
          learningStyle: userMemory.learningStyle,
          knowledgeState
        }
      });
      
      // Build context
      const context: TeachingContext = {
        userId,
        sessionId,
        userMessage: message,
        conceptsToTeach: detectedConcepts,
        previousMessages,
        userProfile: {
          learningStyle: userMemory.learningStyle,
          knowledgeState
        }
      };
      
      // Build prompt
      const prompt = this.buildTeachingPrompt(context, strategy);
      
      // Clear output for streaming
      let completeResponse = '';
      
      // Create a promise to ensure streaming completes before processing metadata
      await new Promise<void>((resolveStreaming, rejectStreaming) => {
        // Stream LLM response - pass raw chunks directly to the client
        this.llmService.generateStreamingResponse(
          prompt, 
          // Chunk handler - IMPORTANT: Pass the raw chunk directly without processing
          (chunk) => {
            try {
              // Pass the raw DeepSeek chunk directly to the client without any modifications
              onChunk(chunk);
              
              // Only for our internal processing, we'll still track complete content
              if (typeof chunk === 'string' && chunk.startsWith('{')) {
                try {
                  const jsonData = JSON.parse(chunk);
                  if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
                    completeResponse += jsonData.choices[0].delta.content;
                  }
                } catch (jsonError) {
                  // If parsing fails, just append the raw chunk for our tracking
                  completeResponse += chunk;
                }
              } else {
                completeResponse += chunk;
              }
            } catch (chunkError) {
              logger.error('Error processing chunk', { error: chunkError });
            }
          },
          // Completion handler
          () => {
            logger.debug('Streaming completed successfully');
            resolveStreaming();
          }
        ).catch(error => {
          logger.error('Error in streaming generation', { error });
          rejectStreaming(error);
        });
      });
      
      // Now that streaming is complete, send metadata to the client
      try {
        // Extract followup questions from the complete response
        const followupQuestions = this.parseFollowupQuestions(completeResponse);
        
        // Send metadata as a special formatted message that the client can parse
        const metadataChunk = `data: METADATA:${JSON.stringify({
          concepts: detectedConcepts,
          followupQuestions
        })}`;
        
        onChunk(metadataChunk);
      } catch (metadataError) {
        logger.error('Error sending metadata', { error: metadataError });
      }
      
      // Create teaching response object for onComplete callback
      const responseContent = this.extractResponseContent(completeResponse);
      const followupQuestions = this.parseFollowupQuestions(completeResponse);
      const response: TeachingResponse = {
        content: responseContent,
        strategy: strategy.name,
        strategyUsed: strategy,
        conceptsCovered: detectedConcepts,
        followupQuestions,
        messageType: 'teaching'
      };
      
      // Record the interaction in memory asynchronously
      const interactionPromise = this.memoryManager.recordInteraction({
        userId,
        sessionId,
        type: 'teaching',
        message,
        response: responseContent,
        concepts: detectedConcepts,
        timestamp: new Date().toISOString(),
        strategy: strategy.name
      });
      
      // Update concept mastery asynchronously
      detectedConcepts.forEach(concept => {
        this.memoryManager.updateConceptMastery({
          userId,
          concept,
          confidenceLevel: 0.1, // Initial exposure
          lastUpdated: new Date().toISOString(),
          exposureCount: 1
        }).catch(err => {
          logger.error('Failed to update concept mastery', { concept, error: err });
        });
      });
      
      // Wait for interaction record to get ID
      try {
        const interactionId = await interactionPromise;
        response.interactionId = interactionId;
      } catch (err) {
        logger.error('Failed to record interaction', { error: err });
      }
      
      // Send the complete response back
      onComplete(response);
    } catch (error) {
      logger.error('Error in processInteractionStream', { error, userId });
      
      // Handle error case
      try {
        const fallbackResponse = `I apologize, but I encountered an issue while processing your request. Could you please try again or rephrase your question?`;
        
        onError(error instanceof Error ? error : new Error('Unknown error in processInteractionStream'));
        
        // Provide a fallback response with basic metadata
        onComplete({
          content: fallbackResponse,
          conceptsCovered: [],
          followupQuestions: [],
          messageType: 'fallback'
        });
      } catch (fallbackError) {
        logger.error('Failed to generate fallback response', { error: fallbackError });
      }
    }
  }
  
  /**
   * Calculate overall mastery level from concept mastery
   */
  private calculateOverallMastery(conceptMastery: Record<string, { confidenceLevel: number }>): number {
    const concepts = Object.values(conceptMastery);
    if (concepts.length === 0) return 0;
    
    const sum = concepts.reduce((total, concept) => total + concept.confidenceLevel, 0);
    return sum / concepts.length;
  }
  
  /**
   * Generate a personalized teaching response
   */
  private async generateResponse(
    context: TeachingContext,
    strategy: any // Using 'any' temporarily to avoid type issues
  ): Promise<TeachingResponse> {
    try {
      const prompt = this.buildTeachingPrompt(context, strategy);
      const rawResponse = await this.llmService.generateResponse(prompt);
      
      // Extract the main content
      const content = this.extractResponseContent(rawResponse);
      
      // Extract or generate follow-up questions
      const followupQuestions = await this.generateFollowupQuestions(
        context.userMessage,
        content,
        context.conceptsToTeach
      );
      
      return {
        content,
        strategyUsed: strategy,
        relatedConcepts: context.conceptsToTeach,
        followupQuestions
      };
    } catch (error) {
      console.error('Error generating teaching response:', error);
      
      // Provide a basic fallback response
      return {
        content: "I'm sorry, I'm having trouble generating a detailed response right now. Let's try a simpler approach to your question.",
        strategyUsed: strategy,
        relatedConcepts: context.conceptsToTeach,
        followupQuestions: []
      };
    }
  }
  
  /**
   * Build a knowledge state object from user memory
   */
  private buildKnowledgeState(userMemory: any): KnowledgeState {
    const knowledgeState: KnowledgeState = {
      conceptMastery: {},
      recentInteractions: []
    };
    
    // Extract concept mastery information
    if (userMemory.conceptMastery) {
      Object.entries(userMemory.conceptMastery).forEach(([concept, data]: [string, any]) => {
        knowledgeState.conceptMastery[concept] = {
          confidence: data.confidence || 0,
          lastReviewed: data.lastReviewed || new Date().toISOString()
        };
      });
    }
    
    // Extract recent interactions
    if (Array.isArray(userMemory.interactionHistory)) {
      knowledgeState.recentInteractions = userMemory.interactionHistory.slice(-5).map((interaction: any) => ({
        question: interaction.question,
        concepts: interaction.concepts,
        timestamp: interaction.timestamp
      }));
    }
    
    return knowledgeState;
  }
  
  /**
   * Build a prompt for teaching based on context and strategy
   */
  private buildTeachingPrompt(context: TeachingContext, strategy: any): string {
    const { approach, adaptations } = strategy;
    const conceptsToTeach = context.conceptsToTeach.join(', ');
    
    let promptInstructions = `
You are an AI teacher specialized in explaining ${conceptsToTeach}.
The user's question is: "${context.userMessage}"

Based on their profile and the concepts involved, use the following teaching approach:
- Primary approach: ${approach}
`;

    // Add adaptations to the prompt
    if (adaptations && adaptations.length > 0) {
      promptInstructions += `
Specific adaptations to make:
${adaptations.map(a => `- ${a}`).join('\n')}
`;
    }

    // Add information about user's knowledge state if available
    if (context.userProfile && context.userProfile.knowledgeState) {
      const { knowledgeState } = context.userProfile;
      
      // Add information about concept mastery
      if (Object.keys(knowledgeState.conceptMastery).length > 0) {
        promptInstructions += `
The user's familiarity with relevant concepts:
`;
        Object.entries(knowledgeState.conceptMastery).forEach(([concept, mastery]) => {
          promptInstructions += `- ${concept}: ${this.describeConfidenceLevel(mastery.confidence)}\n`;
          
          // Add known misconceptions if available
          if (mastery.misconceptions && mastery.misconceptions.length > 0) {
            promptInstructions += `  Potential misconceptions: ${mastery.misconceptions.join(', ')}\n`;
          }
        });
      }
      
      // Add info about mastered concepts
      if (knowledgeState.masteredConcepts && knowledgeState.masteredConcepts.length > 0) {
        promptInstructions += `
Concepts the user has mastered:
${knowledgeState.masteredConcepts.map(c => `- ${c}`).join('\n')}
`;
      }
      
      // Add info about struggling concepts
      if (knowledgeState.struggleConcepts && knowledgeState.struggleConcepts.length > 0) {
        promptInstructions += `
Concepts the user is struggling with:
${knowledgeState.struggleConcepts.map(c => `- ${c}`).join('\n')}
`;
      }
      
      // Add learning analytics
      if (knowledgeState.learningAnalytics) {
        const { learningRate } = knowledgeState.learningAnalytics;
        
        let learningRateDescription = "moderate";
        if (learningRate < 0.3) learningRateDescription = "slower";
        if (learningRate > 0.7) learningRateDescription = "faster";
        
        promptInstructions += `
Learning analytics:
- Learning rate: ${learningRateDescription}
`;

        // Include concepts that need review
        if (knowledgeState.learningAnalytics.recommendedReview && 
            knowledgeState.learningAnalytics.recommendedReview.length > 0) {
          promptInstructions += `- Concepts needing review: ${knowledgeState.learningAnalytics.recommendedReview.join(', ')}\n`;
        }
      }
    }
    
    // Add learning style preferences if available
    if (context.userProfile && context.userProfile.learningStyle) {
      const { learningStyle } = context.userProfile;
      
      promptInstructions += `
Learning style preferences:
- Visual learner: ${learningStyle.visualLearner ? 'Yes' : 'No'}
- Technical level: ${learningStyle.technicalLevel}/5
- Comprehension speed: ${learningStyle.comprehensionSpeed}/5
- Preferred format: ${learningStyle.preferredFormat || 'text'}
- Preferred learning pace: ${learningStyle.preferredLearningPace || 'moderate'}
- Preferred communication style: ${learningStyle.preferredCommunicationStyle || 'conversational'}
`;

      if (learningStyle.preferredExamples && learningStyle.preferredExamples.length > 0) {
        promptInstructions += `- Effective examples previously used: ${learningStyle.preferredExamples.join(', ')}\n`;
      }
    }
    
    // Add knowledge graph relationships if available
    if (context.userProfile && 
        context.userProfile.knowledgeState && 
        context.userProfile.knowledgeState.knowledgeGraph) {
      
      const { knowledgeGraph } = context.userProfile.knowledgeState;
      
      // Find directly related concepts to the current ones
      const relatedConcepts: Record<string, string[]> = {};
      
      for (const concept of context.conceptsToTeach) {
        const relatedEdges = knowledgeGraph.edges.filter(edge => 
          edge.source === concept || edge.target === concept);
        
        if (relatedEdges.length > 0) {
          relatedConcepts[concept] = relatedEdges.map(edge => 
            edge.source === concept ? edge.target : edge.source);
        }
      }
      
      if (Object.keys(relatedConcepts).length > 0) {
        promptInstructions += `
Concept relationships from user's knowledge graph:
`;
        Object.entries(relatedConcepts).forEach(([concept, related]) => {
          promptInstructions += `- ${concept} is related to: ${related.join(', ')}\n`;
        });
      }
    }
    
    // Add previous effective interactions if available
    if (context.previousInteractions && context.previousInteractions.length > 0) {
      // Filter to relevant interactions with positive feedback
      const effectiveInteractions = context.previousInteractions.filter(
        interaction => 
          interaction.effectiveness >= 0.7 && 
          interaction.concepts.some(c => context.conceptsToTeach.includes(c))
      );
      
      if (effectiveInteractions.length > 0) {
        // Take the most recent effective interaction
        const mostRecentEffective = effectiveInteractions.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        
        promptInstructions += `
Previously effective teaching example:
User question: "${mostRecentEffective.question}"
AI response that was effective: "${mostRecentEffective.answer.substring(0, 200)}..."
`;
      }
    }

    // Add instructions for response format
    promptInstructions += `
Your response should:
1. Be clear, accurate, and well-structured
2. Focus on the concepts the user is asking about
3. Adapt to their learning style and knowledge level
4. Include examples or analogies where helpful
5. Break down complex ideas into manageable parts
6. Connect new information to concepts they've already mastered
7. Directly address any misconceptions they might have
8. Pace the explanation according to their preferred learning speed
9. Match their preferred communication style

Conclude with 2-3 specific follow-up questions that would help deepen their understanding.

Respond directly without meta-commentary. Don't label your teaching approach or reference this prompt.
`;

    return promptInstructions;
  }
  
  /**
   * Generate follow-up questions based on the context and response
   */
  private async generateFollowupQuestions(
    userMessage: string,
    responseContent: string,
    concepts: string[]
  ): Promise<string[]> {
    try {
      const prompt = `
Based on this exchange, generate 2-3 thoughtful follow-up questions to deepen the user's understanding:

User question: ${userMessage}

Your explanation:
${responseContent.substring(0, 500)}${responseContent.length > 500 ? '...' : ''}

Key concepts: ${concepts.join(', ')}

Generate questions that:
- Check understanding of what was just explained
- Encourage deeper exploration of concepts
- Connect to related ideas or applications
- Help identify misconceptions

Format your response as a JSON array of strings, each string being a question.
Example: ["How would you explain X to someone new to the field?", "Can you think of a real-world example of Y?"]
`;
      
      const response = await this.llmService.generateResponse(prompt);
      return this.parseFollowupQuestions(response);
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      
      // Return default follow-up questions
      return [
        'How would you explain this concept in a real-world scenario?',
        'What aspect of this explanation was most helpful to you?',
        'What questions do you still have about this topic?'
      ];
    }
  }
  
  /**
   * Extract the main content from the LLM response
   */
  private extractResponseContent(response: string): string {
    // For now, just return the raw response
    // Later, we could enhance this to handle structured responses
    return response.trim();
  }
  
  /**
   * Parse follow-up questions from the LLM response
   */
  private parseFollowupQuestions(response: string): string[] {
    try {
      // Check if response is empty or very short
      if (!response || response.trim().length < 5) {
        console.log('Response too short to extract follow-up questions, using defaults');
        return this.getDefaultFollowupQuestions();
      }
      
      // First attempt: try to extract a JSON array from the response
      try {
        // Find JSON-like array patterns
        const jsonMatch = response.match(/\[\s*"[^"]*"\s*(?:,\s*"[^"]*"\s*)*\]/);
        if (jsonMatch && jsonMatch[0]) {
          const questions = JSON.parse(jsonMatch[0]);
          if (Array.isArray(questions) && questions.length > 0 && 
              questions.every(q => typeof q === 'string')) {
            return questions.map(q => q.trim()).filter(q => q.length > 0);
          }
        }
      } catch (jsonError) {
        console.log('Could not extract JSON array of questions, trying alternative methods');
      }
      
      // Second attempt: try to find question-like patterns in the text
      const questionPatterns = [
        /(?:^|\n)(?:\d+\.\s*|\*\s*|Q\d+:\s*|Question \d+:\s*)(.*?\?)/g,  // Numbered or bulleted questions
        /"([^"]+\?)/g,  // Questions in quotes
        /([A-Z][^.!?]*\?)/g  // Sentences ending with question marks
      ];
      
      for (const pattern of questionPatterns) {
        const matches = Array.from(response.matchAll(pattern)).map(m => m[1].trim());
        if (matches.length > 0) {
          return matches
            .filter(q => q.length > 10 && q.length < 150) // Filter out very short or very long matches
            .slice(0, 5); // Limit to 5 questions
        }
      }
      
      // If we still can't find questions, fall back to default questions
      console.log('Could not extract questions using patterns, using defaults');
      return this.getDefaultFollowupQuestions();
    } catch (error) {
      console.error('Error parsing follow-up questions:', error);
      
      // Return default questions if parsing fails
      return this.getDefaultFollowupQuestions();
    }
  }
  
  /**
   * Get default follow-up questions when none can be extracted
   */
  private getDefaultFollowupQuestions(): string[] {
    return [
      'How would you apply this concept in a real-world scenario?',
      'What aspect of this explanation was most helpful to you?',
      'What questions do you still have about this topic?'
    ];
  }
  
  /**
   * Convert a confidence level to a descriptive string
   */
  private describeConfidenceLevel(confidence: number): string {
    if (confidence >= 0.8) return 'highly familiar';
    if (confidence >= 0.6) return 'familiar';
    if (confidence >= 0.4) return 'somewhat familiar';
    if (confidence >= 0.2) return 'slightly familiar';
    return 'unfamiliar';
  }
  
  /**
   * Get all available teaching strategies
   */
  async getTeachingStrategies(): Promise<TeachingStrategy[]> {
    return this.teachingStrategist.getAllStrategies();
  }
  
  /**
   * Update a user's learning style
   */
  async updateLearningStyle(
    userId: string, 
    learningStyle: { primary: string; secondary?: string }
  ): Promise<void> {
    try {
      const userMemory = await this.memoryManager.getUserMemory(userId);
      
      // Create or update the user learning profile
      await this.memoryManager.updateUserLearningProfile({
        id: '',
        userId,
        learningStyle: {
          preferredFormat: learningStyle.primary as any,
          visualLearner: learningStyle.secondary === 'visual',
          preferredExamples: [],
          comprehensionSpeed: 3,
          technicalLevel: 3
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`Updated learning style for user ${userId}`);
    } catch (error) {
      console.error('Error updating learning style:', error);
      throw new Error('Failed to update learning style');
    }
  }
  
  /**
   * Record feedback about teaching effectiveness
   */
  async recordFeedback(
    userId: string,
    interactionId: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    try {
      // Record the feedback
      await this.memoryManager.recordEffectivenessFeedback({
        userId,
        interactionId,
        rating,
        comment,
        timestamp: new Date().toISOString()
      });
      
      // Adjust concept mastery based on feedback
      // Higher ratings indicate better understanding
      const interaction = await memoryDb.getInteraction(interactionId);
      
      if (interaction && interaction.concepts) {
        for (const concept of interaction.concepts) {
          const currentMastery = await memoryDb.getConceptMastery(userId, concept);
          const confidenceAdjustment = (rating - 3) / 10; // -0.2 to +0.2 adjustment
          
          const newConfidence = Math.max(0.1, Math.min(1.0, 
            (currentMastery?.confidenceLevel || 0.3) + confidenceAdjustment
          ));
          
          await this.memoryManager.updateConceptMastery({
            concept,
            userId,
            confidenceLevel: newConfidence,
            lastUpdated: new Date().toISOString()
          });
        }
      }
      
      console.log(`Recorded feedback for interaction ${interactionId}`);
    } catch (error) {
      console.error('Error recording feedback:', error);
      throw new Error('Failed to record feedback');
    }
  }
  
  /**
   * Analyze whether the user understands the concepts being taught
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
      if (env.hasDeepSeekApiKey()) {
        // Use DeepSeek to analyze understanding
        return await this.llmService.analyzeUnderstanding(
          message,
          conceptsBeingTaught
        );
      } else {
        // Simple fallback analysis based on keywords
        return this.fallbackUnderstandingAnalysis(message, conceptsBeingTaught);
      }
    } catch (error) {
      console.error('Error analyzing understanding:', error);
      
      // Default to assuming understanding if analysis fails
      return {
        isUnderstanding: true,
        confusedConcepts: [],
        confidenceScore: 0.5
      };
    }
  }
  
  /**
   * Simple keyword-based understanding analysis as fallback
   */
  private fallbackUnderstandingAnalysis(
    message: string, 
    concepts: string[]
  ): {
    isUnderstanding: boolean;
    confusedConcepts: string[];
    confidenceScore: number;
  } {
    // Convert to lowercase for matching
    const lowerMessage = message.toLowerCase();
    
    // Look for confusion indicators
    const confusionKeywords = [
      'confused', 'don\'t understand', 'unclear', 'lost',
      'what do you mean', 'not sure', 'difficult', 'explain again'
    ];
    
    const hasConfusionIndicators = confusionKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
    
    // Check which concepts are mentioned in confusion context
    const confusedConcepts = concepts.filter(concept => {
      const lowerConcept = concept.toLowerCase();
      
      // Check if concept is mentioned near confusion keywords
      for (const keyword of confusionKeywords) {
        if (lowerMessage.includes(keyword) && 
            lowerMessage.indexOf(lowerConcept) !== -1) {
          return true;
        }
      }
      
      return false;
    });
    
    // Determine confidence score
    let confidenceScore = 0.5;
    
    if (hasConfusionIndicators) {
      confidenceScore = 0.3;
    } else if (lowerMessage.includes('understand') || 
               lowerMessage.includes('got it') || 
               lowerMessage.includes('makes sense')) {
      confidenceScore = 0.8;
    }
    
    return {
      isUnderstanding: !hasConfusionIndicators,
      confusedConcepts,
      confidenceScore
    };
  }
  
  /**
   * Check if DeepSeek API is configured
   */
  isDeepSeekConfigured(): boolean {
    return this.llmService.isConfigured();
  }
} 