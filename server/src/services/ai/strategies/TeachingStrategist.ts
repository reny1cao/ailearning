import { 
  TeachingContext, 
  TeachingStrategy, 
  TeachingApproach,
  UserMemory,
  KnowledgeState
} from '../../../../../shared/types';
import { DeepSeekService } from '../llm/DeepSeekService';

/**
 * Service responsible for selecting appropriate teaching strategies
 * based on user profile and learning context
 */
export class TeachingStrategist {
  private deepSeekService: DeepSeekService;

  constructor(deepSeekService: DeepSeekService) {
    this.deepSeekService = deepSeekService;
  }

  /**
   * Selects the most appropriate teaching strategy based on the context
   * @param context The teaching context
   * @returns The selected teaching strategy
   */
  async selectStrategy(context: TeachingContext): Promise<TeachingStrategy> {
    try {
      console.log('Selecting teaching strategy based on user profile and context');
      
      // If previous interactions indicate certain strategies work better, prioritize those
      if (context.previousInteractions && context.previousInteractions.length > 0) {
        const effectiveStrategy = this.findMostEffectiveStrategy(context);
        if (effectiveStrategy) {
          console.log('Selected strategy based on previous effective interactions:', effectiveStrategy.approach);
          return effectiveStrategy;
        }
      }
      
      // If user has explicit preferences, use them
      if (context.userProfile && context.userProfile.learningStyle) {
        const preferenceBasedStrategy = this.createStrategyFromPreferences(context);
        if (preferenceBasedStrategy) {
          console.log('Selected strategy based on user preferences:', preferenceBasedStrategy.approach);
          return preferenceBasedStrategy;
        }
      }
      
      // Use DeepSeek to select strategy
      const prompt = this.buildStrategySelectionPrompt(context);
      const response = await this.deepSeekService.generateResponse(prompt);
      
      const llmStrategy = this.parseStrategyFromResponse(response, context);
      console.log('Selected strategy using LLM:', llmStrategy.approach);
      return llmStrategy;
    } catch (error) {
      console.error('Error selecting teaching strategy:', error);
      
      // Fallback to a default strategy
      return this.getDefaultStrategy(context);
    }
  }

  /**
   * Adapts the current strategy based on user feedback or changed context
   * @param currentStrategy The current teaching strategy
   * @param context The updated teaching context
   * @param feedback User feedback or indicators of effectiveness
   * @returns The adapted teaching strategy
   */
  async adaptStrategy(
    currentStrategy: TeachingStrategy,
    context: TeachingContext,
    feedback: {
      comprehension: number;
      engagement: number;
      comments?: string;
    }
  ): Promise<TeachingStrategy> {
    try {
      // Check if the current strategy is working well
      if (feedback.comprehension >= 0.7 && feedback.engagement >= 0.7) {
        console.log('Current strategy is effective, making minor adjustments');
        return {
          ...currentStrategy,
          confidenceLevel: Math.min(1, currentStrategy.confidenceLevel + 0.1)
        };
      }
      
      // Strategy isn't working well, adapt based on feedback
      const prompt = this.buildStrategyAdaptationPrompt(currentStrategy, context, feedback);
      const response = await this.deepSeekService.generateResponse(prompt);
      
      const adaptedStrategy = this.parseStrategyFromResponse(response, context);
      console.log('Adapted strategy based on feedback:', adaptedStrategy.approach);
      return adaptedStrategy;
    } catch (error) {
      console.error('Error adapting teaching strategy:', error);
      
      // Make simple adjustments based on feedback
      return this.makeSimpleAdjustments(currentStrategy, feedback);
    }
  }

  /**
   * Recommends the next concepts to focus on based on the user's knowledge state
   * @param knowledgeState The user's current knowledge state
   * @param targetConcepts The concepts being taught in the current session
   * @returns List of recommended next concepts with rationale
   */
  async recommendNextConcepts(
    knowledgeState: KnowledgeState,
    targetConcepts: string[]
  ): Promise<Array<{concept: string; rationale: string}>> {
    try {
      const prompt = this.buildNextConceptsPrompt(knowledgeState, targetConcepts);
      const response = await this.deepSeekService.generateResponse(prompt);
      
      return this.parseNextConceptsFromResponse(response);
    } catch (error) {
      console.error('Error recommending next concepts:', error);
      
      // Return default recommendations
      return [{
        concept: 'review-current-concepts',
        rationale: 'Continue practicing with the current concepts to build stronger understanding'
      }];
    }
  }

  /**
   * Find the most effective strategy based on previous interactions
   */
  private findMostEffectiveStrategy(context: TeachingContext): TeachingStrategy | null {
    if (!context.previousInteractions || context.previousInteractions.length === 0) {
      return null;
    }
    
    // Find interactions with high effectiveness ratings
    const effectiveInteractions = context.previousInteractions.filter(
      interaction => interaction.effectiveness && interaction.effectiveness >= 0.7
    );
    
    if (effectiveInteractions.length === 0) {
      return null;
    }
    
    // Count the frequency of each approach in effective interactions
    const approachCounts = new Map<TeachingApproach, number>();
    
    effectiveInteractions.forEach(interaction => {
      if (interaction.strategyUsed) {
        const count = approachCounts.get(interaction.strategyUsed.approach) || 0;
        approachCounts.set(interaction.strategyUsed.approach, count + 1);
      }
    });
    
    // Find the most commonly effective approach
    let bestApproach: TeachingApproach | null = null;
    let maxCount = 0;
    
    approachCounts.forEach((count, approach) => {
      if (count > maxCount) {
        maxCount = count;
        bestApproach = approach;
      }
    });
    
    if (!bestApproach) {
      return null;
    }
    
    // Build a strategy with this approach
    return {
      approach: bestApproach,
      adaptations: [],
      rationale: 'Selected based on previously effective interactions',
      confidenceLevel: 0.8
    };
  }

  /**
   * Create a strategy based on user preferences
   */
  private createStrategyFromPreferences(context: TeachingContext): TeachingStrategy | null {
    if (!context.userProfile || !context.userProfile.learningStyle) {
      return null;
    }
    
    const { learningStyle } = context.userProfile;
    
    // Determine the appropriate approach based on preferences
    let approach: TeachingApproach = 'explanatory';
    const adaptations: string[] = [];
    
    // Adjust based on visual preference
    if (learningStyle.visualLearner) {
      approach = 'visualization';
      adaptations.push('Include diagrams and visual representations');
    }
    
    // Adjust based on comprehension speed
    if (learningStyle.comprehensionSpeed <= 2) {
      adaptations.push('Break down complex concepts into smaller, manageable parts');
      adaptations.push('Use simple, concrete examples');
    } else if (learningStyle.comprehensionSpeed >= 4) {
      adaptations.push('Present information more efficiently with less repetition');
      adaptations.push('Include more advanced examples and connections');
    }
    
    // Adjust based on technical level
    if (learningStyle.technicalLevel <= 2) {
      adaptations.push('Use less technical jargon');
      adaptations.push('Focus on intuitive understanding rather than technical details');
    } else if (learningStyle.technicalLevel >= 4) {
      adaptations.push('Include technical details and precise terminology');
      adaptations.push('Reference relevant research or advanced concepts');
    }
    
    // Adjust based on preferred format
    if (learningStyle.preferredFormat === 'code') {
      adaptations.push('Include more code examples and practical implementations');
    } else if (learningStyle.preferredFormat === 'interactive') {
      adaptations.push('Design explanation as an interactive dialogue');
      adaptations.push('Include questions for the user to consider');
    }
    
    return {
      approach,
      adaptations,
      rationale: 'Selected based on user learning preferences',
      confidenceLevel: 0.7
    };
  }

  /**
   * Build prompt for strategy selection
   */
  private buildStrategySelectionPrompt(context: TeachingContext): string {
    const userProfile = context.userProfile || { learningStyle: {}, knowledgeState: {} };
    const conceptsBeingExplained = context.conceptsToTeach.join(', ');
    
    return `
Select the most appropriate teaching strategy for this learner based on their profile and the concepts being explained.

User profile:
${JSON.stringify(userProfile, null, 2)}

Concepts being explained: ${conceptsBeingExplained}

User question/context: ${context.userMessage}

Teaching objectives: ${context.objectives || 'Help the user understand the concepts'}

Response should be a JSON object with these fields:
- approach: One of "explanatory", "socratic", "examples-based", "analogy", "visualization", "problem-solving"
- adaptations: Array of specific adjustments to the teaching approach
- rationale: Why this strategy was selected
- confidenceLevel: Number between 0-1 indicating confidence in this strategy

Format example:
{
  "approach": "explanatory",
  "adaptations": ["Use more technical vocabulary", "Break down complex ideas"],
  "rationale": "User has technical background but is new to these concepts",
  "confidenceLevel": 0.8
}
`;
  }

  /**
   * Build prompt for strategy adaptation
   */
  private buildStrategyAdaptationPrompt(
    currentStrategy: TeachingStrategy,
    context: TeachingContext,
    feedback: {
      comprehension: number;
      engagement: number;
      comments?: string;
    }
  ): string {
    return `
The current teaching strategy needs adjustment based on user feedback. Please recommend changes.

Current strategy:
${JSON.stringify(currentStrategy, null, 2)}

User feedback:
- Comprehension: ${feedback.comprehension} (0-1 scale)
- Engagement: ${feedback.engagement} (0-1 scale)
- Comments: ${feedback.comments || 'No comments provided'}

User context:
${JSON.stringify(context, null, 2)}

Provide a JSON object with the adapted teaching strategy, including:
- approach: One of "explanatory", "socratic", "examples-based", "analogy", "visualization", "problem-solving"
- adaptations: Array of specific adjustments to the teaching approach
- rationale: Why these changes were made
- confidenceLevel: Number between 0-1 indicating confidence in this strategy
`;
  }

  /**
   * Build prompt for next concepts recommendation
   */
  private buildNextConceptsPrompt(
    knowledgeState: KnowledgeState,
    targetConcepts: string[]
  ): string {
    return `
Based on the user's current knowledge state and the concepts they've been learning, 
recommend the next concepts they should focus on.

Current knowledge state:
${JSON.stringify(knowledgeState, null, 2)}

Current concepts being learned: ${targetConcepts.join(', ')}

Provide a JSON array of objects, each with:
- concept: The name of the recommended concept
- rationale: Why this concept should be learned next

Format example:
[
  {
    "concept": "backpropagation",
    "rationale": "This builds naturally on their understanding of neural networks and would address their current knowledge gap in training processes"
  },
  {
    "concept": "gradient descent",
    "rationale": "This optimization method is essential for understanding how neural networks learn and would complement their knowledge of model training"
  }
]
`;
  }

  /**
   * Parse teaching strategy from LLM response
   */
  private parseStrategyFromResponse(response: string, context: TeachingContext): TeachingStrategy {
    try {
      // Clean the response to ensure it's valid JSON
      const jsonStr = response.trim()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      // Parse the JSON object
      const strategy = JSON.parse(jsonStr);
      
      // Validate the approach
      const validApproaches: TeachingApproach[] = [
        'explanatory', 'socratic', 'examples-based', 
        'analogy', 'visualization', 'problem-solving'
      ];
      
      if (!validApproaches.includes(strategy.approach)) {
        throw new Error(`Invalid teaching approach: ${strategy.approach}`);
      }
      
      // Validate adaptations
      if (!Array.isArray(strategy.adaptations)) {
        strategy.adaptations = [];
      }
      
      // Validate confidence level
      let confidenceLevel = parseFloat(strategy.confidenceLevel);
      if (isNaN(confidenceLevel) || confidenceLevel < 0 || confidenceLevel > 1) {
        confidenceLevel = 0.7; // Default to moderate confidence
      }
      
      return {
        approach: strategy.approach,
        adaptations: strategy.adaptations,
        rationale: strategy.rationale || 'No rationale provided',
        confidenceLevel
      };
    } catch (error) {
      console.error('Error parsing strategy from response:', error);
      
      // Fallback to default strategy
      return this.getDefaultStrategy(context);
    }
  }

  /**
   * Parse next concepts recommendations from LLM response
   */
  private parseNextConceptsFromResponse(response: string): Array<{concept: string; rationale: string}> {
    try {
      // Clean the response to ensure it's valid JSON
      const jsonStr = response.trim()
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      
      // Parse the JSON array
      const recommendations = JSON.parse(jsonStr);
      
      // Validate it's an array
      if (!Array.isArray(recommendations)) {
        throw new Error('Response is not a valid array');
      }
      
      // Validate each recommendation
      return recommendations
        .filter(rec => rec.concept && rec.rationale)
        .map(rec => ({
          concept: rec.concept,
          rationale: rec.rationale
        }));
    } catch (error) {
      console.error('Error parsing next concepts from response:', error);
      
      // Return default recommendation
      return [{
        concept: 'continue-current-learning',
        rationale: 'Continue with the current concepts to solidify understanding'
      }];
    }
  }

  /**
   * Make simple adjustments to a strategy based on feedback
   */
  private makeSimpleAdjustments(
    currentStrategy: TeachingStrategy,
    feedback: {
      comprehension: number;
      engagement: number;
      comments?: string;
    }
  ): TeachingStrategy {
    const strategy = { ...currentStrategy };
    
    // Adjust approach based on feedback
    if (feedback.comprehension < 0.5) {
      // If comprehension is low, try a different approach
      if (strategy.approach === 'explanatory') {
        strategy.approach = 'examples-based';
      } else if (strategy.approach === 'examples-based') {
        strategy.approach = 'analogy';
      } else {
        strategy.approach = 'explanatory';
      }
      
      strategy.adaptations = [
        ...strategy.adaptations,
        'Simplify explanations',
        'Use more basic terminology',
        'Add more step-by-step guidance'
      ];
    }
    
    if (feedback.engagement < 0.5) {
      // If engagement is low, make content more interactive
      if (strategy.approach === 'explanatory') {
        strategy.approach = 'socratic';
      } else if (strategy.approach === 'examples-based') {
        strategy.approach = 'problem-solving';
      } else {
        strategy.approach = 'visualization';
      }
      
      strategy.adaptations = [
        ...strategy.adaptations,
        'Add more engaging examples',
        'Include questions to maintain engagement',
        'Connect concepts to real-world applications'
      ];
    }
    
    // Lower confidence when making adjustments
    strategy.confidenceLevel = Math.max(0.3, currentStrategy.confidenceLevel - 0.2);
    strategy.rationale = 'Adjusted based on low feedback scores';
    
    return strategy;
  }

  /**
   * Get a default teaching strategy
   */
  private getDefaultStrategy(context: TeachingContext): TeachingStrategy {
    return {
      approach: 'explanatory',
      adaptations: [
        'Use clear, simple explanations',
        'Include practical examples',
        'Check understanding frequently'
      ],
      rationale: 'Default strategy for new users or when preferred strategy cannot be determined',
      confidenceLevel: 0.5
    };
  }

  /**
   * Get all available teaching strategies
   * @returns Array of teaching strategies
   */
  getAllStrategies(): TeachingStrategy[] {
    return [
      {
        name: 'Explanatory',
        approach: 'explanatory',
        description: 'Clear and direct explanations of concepts',
        techniques: ['Clear definitions', 'Step-by-step explanations', 'Logical flow'],
        bestFor: ['New concepts', 'Factual information', 'Process understanding'],
        adaptations: ['Use clear, simple explanations'],
        rationale: 'Provides direct and clear understanding of concepts',
        confidenceLevel: 0.9
      },
      {
        name: 'Socratic',
        approach: 'socratic',
        description: 'Teaching through guided questioning',
        techniques: ['Leading questions', 'Guided discovery', 'Critical thinking prompts'],
        bestFor: ['Deep understanding', 'Critical thinking', 'Self-discovery'],
        adaptations: ['Ask thought-provoking questions', 'Guide through discovery'],
        rationale: 'Develops critical thinking and deeper understanding',
        confidenceLevel: 0.8
      },
      {
        name: 'Examples-Based',
        approach: 'examples-based',
        description: 'Teaching through concrete examples and cases',
        techniques: ['Case studies', 'Code examples', 'Real-world applications'],
        bestFor: ['Practical application', 'Concrete concepts', 'Visual learners'],
        adaptations: ['Provide relevant examples', 'Connect to real-world applications'],
        rationale: 'Makes abstract concepts concrete and applicable',
        confidenceLevel: 0.9
      },
      {
        name: 'Analogy-Based',
        approach: 'analogy',
        description: 'Explaining new concepts through familiar ones',
        techniques: ['Metaphors', 'Analogies', 'Comparisons'],
        bestFor: ['Abstract concepts', 'Complex topics', 'Bridging knowledge gaps'],
        adaptations: ['Use familiar analogies', 'Connect to existing knowledge'],
        rationale: 'Connects new information to existing mental models',
        confidenceLevel: 0.7
      },
      {
        name: 'Visualization',
        approach: 'visualization',
        description: 'Using visual descriptions to explain concepts',
        techniques: ['Mental imagery', 'Descriptive visualization', 'Spatial relationships'],
        bestFor: ['Visual learners', 'Spatial concepts', 'Complex relationships'],
        adaptations: ['Describe concepts visually', 'Use spatial metaphors'],
        rationale: 'Helps visual learners and improves concept retention',
        confidenceLevel: 0.7
      }
    ];
  }
} 