/**
 * Shared type definitions for the AI teacher teaching system
 */

export interface TeachingContext {
  contextId?: string;
  userId?: string;
  sessionId?: string;
  courseId?: string;
  moduleId?: string;
  userMessage?: string;
  conceptsToTeach?: string[];
  goals?: string[];
  relevantConcepts?: string[];
  previousMessages?: Message[];
  userProfile?: {
    learningStyle?: any;
    knowledgeState?: KnowledgeState;
  };
  previousInteractions?: any[];
}

export interface UserProfile {
  userId: string;
  learningStyle: {
    primary: string;
    secondary?: string;
  };
  preferences?: Record<string, any>;
  goals?: string[];
}

export interface KnowledgeState {
  conceptMastery?: Record<string, { confidence: number, lastReviewed?: string }>;
  overallMastery?: number;
  currentConcepts?: string[];
  recentInteractions?: any[];
}

export interface TeachingStrategy {
  name?: string;
  approach?: string;
  description?: string;
  techniques?: string[];
  bestFor?: string[];
  adaptations?: string[];
  rationale?: string;
  confidenceLevel?: number;
  examplePrompt?: string;
}

export interface TeachingResponse {
  content: string;
  strategy?: string;
  strategyUsed?: TeachingStrategy;
  conceptsCovered?: string[];
  relatedConcepts?: string[];
  suggestedNextConcepts?: string[];
  followupQuestions?: string[];
  interactionId?: string;
  messageType?: 'teaching' | 'error' | 'fallback';
}

export interface ConceptRelationship {
  sourceConcept: string;
  targetConcept: string;
  relationshipType: 'prerequisite' | 'related' | 'builds-on' | 'example-of';
  strength: number; // 0-1, with 1 being strongest
}

export interface TeachingMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  concepts?: string[];
  isUnderstanding?: boolean;
  needsReinforcementOn?: string[];
  followUpQuestions?: string[];
}

export interface LearningContext {
  courseId: string;
  moduleId: string;
  currentConcept: string;
  relatedConcepts: string[];
  prerequisites: string[];
  learningObjectives: string[];
}

export type TeachingApproach = 
  | 'visual' 
  | 'auditory'
  | 'reading'
  | 'kinesthetic'
  | 'conceptual'
  | 'practical'
  | 'socratic'; 