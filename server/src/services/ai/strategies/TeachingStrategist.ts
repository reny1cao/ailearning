import { 
  TeachingStrategy, 
  LearningStyle, 
  TeachingApproach,
  UserProfile,
  KnowledgeState
} from '../../../../../shared/types';

/**
 * Service for managing teaching strategies based on user learning profiles and content.
 */
export class TeachingStrategist {
  private strategies: Map<TeachingApproach, TeachingStrategy>;
  
  constructor() {
    this.strategies = new Map();
    this.initializeStrategies();
  }
  
  /**
   * Initialize default teaching strategies
   */
  private initializeStrategies(): void {
    // Visual learning strategy
    this.strategies.set('visual', {
      name: 'Visual Learning',
      description: 'Uses diagrams, charts, and visual examples',
      techniques: [
        'diagram-based explanations',
        'visual metaphors',
        'color-coded information',
        'mind mapping',
        'visual comparisons'
      ],
      bestFor: ['visual'],
      examplePrompt: 'Imagine this concept as a diagram where {concept} is represented by {visual metaphor}.'
    });
    
    // Auditory learning strategy
    this.strategies.set('auditory', {
      name: 'Auditory Learning',
      description: 'Uses spoken explanations and auditory cues',
      techniques: [
        'spoken explanations',
        'rhythmic patterns',
        'question-answer format',
        'verbal analogies',
        'storytelling'
      ],
      bestFor: ['auditory'],
      examplePrompt: 'Let me explain this concept as if we were having a conversation about {concept}.'
    });
    
    // Reading/writing learning strategy
    this.strategies.set('reading', {
      name: 'Reading/Writing Learning',
      description: 'Uses text-based explanations and writing exercises',
      techniques: [
        'text-based explanations',
        'definition lists',
        'written summaries',
        'note-taking suggestions',
        'keyword highlighting'
      ],
      bestFor: ['reading'],
      examplePrompt: 'Let\'s define {concept} clearly and break it down into key components.'
    });
    
    // Kinesthetic learning strategy
    this.strategies.set('kinesthetic', {
      name: 'Kinesthetic Learning',
      description: 'Uses practical examples and hands-on activities',
      techniques: [
        'hands-on exercises',
        'real-world applications',
        'step-by-step tutorials',
        'interactive coding examples',
        'practice problems'
      ],
      bestFor: ['kinesthetic'],
      examplePrompt: 'Let\'s work through a practical example of {concept} step by step.'
    });
    
    // Conceptual learning strategy
    this.strategies.set('conceptual', {
      name: 'Conceptual Learning',
      description: 'Focuses on theoretical understanding and concept relationships',
      techniques: [
        'abstract explanations',
        'concept mapping',
        'theoretical foundations',
        'first principles',
        'concept comparisons'
      ],
      bestFor: ['theoretical', 'analytical'],
      examplePrompt: 'The fundamental concept behind {concept} is {theoretical foundation}.'
    });
    
    // Practical learning strategy
    this.strategies.set('practical', {
      name: 'Practical Learning',
      description: 'Focuses on practical applications and real-world use cases',
      techniques: [
        'case studies',
        'industry examples',
        'practical applications',
        'implementation details',
        'code examples'
      ],
      bestFor: ['practical', 'applied'],
      examplePrompt: 'In real-world scenarios, {concept} is used to solve {problem} by {application}.'
    });
    
    // Socratic learning strategy
    this.strategies.set('socratic', {
      name: 'Socratic Learning',
      description: 'Uses questions to guide learners to discover concepts themselves',
      techniques: [
        'guiding questions',
        'thought experiments',
        'reflective questions',
        'problem-solving questions',
        'comparative analysis'
      ],
      bestFor: ['reflective', 'analytical'],
      examplePrompt: 'What do you think would happen if we applied {concept} to {scenario}?'
    });
  }
  
  /**
   * Get appropriate teaching strategy based on user profile and knowledge state
   */
  getStrategy(userProfile: UserProfile, knowledgeState: KnowledgeState): TeachingStrategy {
    try {
      // Extract the user's learning style
      const { learningStyle } = userProfile;
      
      // Choose a strategy based on learning style
      // Start with primary learning style
      let strategy: TeachingStrategy | undefined;
      
      if (learningStyle.primary) {
        // Try to find a direct match for primary learning style
        this.strategies.forEach((s) => {
          if (s.bestFor.includes(learningStyle.primary as string)) {
            strategy = s;
          }
        });
      }
      
      // If we still don't have a strategy, use a default one
      if (!strategy) {
        // Default to conceptual for beginners and practical for advanced
        if (knowledgeState.overallMastery < 0.4) {
          strategy = this.strategies.get('conceptual');
        } else {
          strategy = this.strategies.get('practical');
        }
      }
      
      // Final fallback
      if (!strategy) {
        strategy = this.strategies.get('reading')!;
      }
      
      return strategy;
    } catch (error) {
      console.error('Error selecting teaching strategy:', error);
      
      // Return a default strategy if something goes wrong
      return {
        name: 'Balanced Learning',
        description: 'A balanced approach using multiple techniques',
        techniques: [
          'clear explanations',
          'examples',
          'visual aids',
          'practice problems'
        ],
        bestFor: ['balanced'],
        examplePrompt: 'Let me explain {concept} with a clear definition and examples.'
      };
    }
  }
  
  /**
   * Generate a teaching prompt based on strategy, concept, and user knowledge
   */
  generateTeachingPrompt(
    strategy: TeachingStrategy,
    concept: string,
    knowledgeState: KnowledgeState
  ): string {
    try {
      // Get mastery level for the concept
      const masteryLevel = knowledgeState.conceptMastery[concept]?.confidenceLevel || 0;
      
      // Adjust approach based on mastery level
      let approach = '';
      if (masteryLevel < 0.3) {
        approach = 'Let me introduce the concept of';
      } else if (masteryLevel < 0.7) {
        approach = 'Let\'s explore more about';
      } else {
        approach = 'Let\'s dive deeper into the advanced aspects of';
      }
      
      // Get techniques from the strategy
      const { techniques } = strategy;
      
      // Randomly select techniques to include in the prompt
      const selectedTechniques = techniques
        .sort(() => 0.5 - Math.random())
        .slice(0, 2)
        .join(' and ');
      
      // Generate the teaching prompt
      return `${approach} ${concept}. I'll use ${selectedTechniques} to help you understand this better.`;
    } catch (error) {
      console.error('Error generating teaching prompt:', error);
      return `Let me explain ${concept} clearly with examples.`;
    }
  }
  
  /**
   * Get all available teaching strategies
   */
  getAllStrategies(): TeachingStrategy[] {
    return Array.from(this.strategies.values());
  }
  
  /**
   * Get a specific teaching strategy by approach
   */
  getStrategyByApproach(approach: TeachingApproach): TeachingStrategy | undefined {
    return this.strategies.get(approach);
  }
} 