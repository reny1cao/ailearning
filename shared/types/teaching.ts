/**
 * Shared type definitions for the AI teacher teaching system
 */

export interface TeachingContext {
  contextId: string;
  courseId?: string;
  moduleId?: string;
  goals?: string[];
  relevantConcepts?: string[];
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
  conceptMastery: Record<string, { confidenceLevel: number }>;
  overallMastery: number;
  currentConcepts: string[];
}

export interface TeachingStrategy {
  name: string;
  description: string;
  techniques: string[];
  bestFor: string[];
  examplePrompt: string;
}

export interface TeachingResponse {
  content: string;
  strategy: string;
  conceptsCovered: string[];
  suggestedNextConcepts: string[];
  suggestedQuestions?: string[];
  interactionId?: string;
  messageType: 'teaching' | 'error' | 'fallback';
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