/**
 * Shared type definitions for the AI teacher memory system
 */

export interface UserMemory {
  conceptMastery: Record<string, ConceptMasteryInfo>;
  learningStyle: LearningStyle;
  interactionHistory: InteractionHistory;
}

export interface ConceptMasteryInfo {
  confidence: number;
  lastReviewed: Date;
  reviewCount: number;
  misconceptions: string[];
}

export interface LearningStyle {
  preferredExamples: string[];
  comprehensionSpeed: number;
  visualLearner: boolean;
  technicalLevel: 1 | 2 | 3 | 4 | 5; // 1=beginner, 5=expert
  preferredFormat: 'text' | 'code' | 'diagram' | 'analogy' | 'interactive';
}

export interface InteractionHistory {
  commonQuestions: string[];
  responseEffectiveness: Record<string, number>;
}

export interface UserLearningProfile {
  id: string;
  userId: string;
  learningStyle: LearningStyle;
  background?: string;
  interests?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConceptMastery {
  id: string;
  userId: string;
  conceptId: string;
  confidenceLevel: number;
  exposureCount: number;
  lastReviewed: Date;
  needsReinforcement: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningInteraction {
  id: string;
  userId: string;
  sessionId: string;
  question: string;
  answer: string;
  concepts: string[];
  effectivenessRating?: number;
  createdAt: Date;
}

export interface KnowledgeState {
  masteredConcepts: string[];
  weakConcepts: string[];
  exposedConcepts: string[];
  suggestedNextConcepts: string[];
} 