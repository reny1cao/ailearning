/**
 * Shared type definitions for the AI Teacher system
 * This file provides local copies of shared types to avoid import issues
 */

/**
 * Teaching style options for the AI teacher
 */
export type TeachingStyle = "conversational" | "academic" | "socratic" | "example-based";

/**
 * Message interface for chat conversations
 */
export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  id?: string;
  streaming?: boolean;
  error?: boolean;
  lastUpdate?: number;
}

export interface ChatRequest {
  userId: string;
  sessionId: string;
  message: string;
  previousMessages?: Message[];
  context?: TeachingContext;
}

export interface ChatResponse {
  message: Message;
  detectedConcepts?: string[];
  suggestedFollowups?: string[];
}

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
  moduleContent?: string;
  moduleTitle?: string;
}

export interface KnowledgeState {
  masteredConcepts?: string[];
  weakConcepts?: string[];
  exposedConcepts?: string[];
  suggestedNextConcepts?: string[];
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

/**
 * Learning analytics data structure
 */
export interface LearningAnalytics {
  lastUpdated: Date;
  totalConcepts: number;
  proficiencyScore: number;
  conceptsLearned: number;
  strongConcepts: string[];
  weakConcepts: string[];
  masteredConcepts: string[];
  suggestedTopics?: string[];
  strugglingConcepts?: string[];
  struggleConcepts?: string[];
  learningRate?: number;
  recommendedReview?: string[];
}

/**
 * Misconception data structure
 */
export interface Misconception {
  concept: string;
  description: string;
  relatedConcept?: string;
  detectedAt: Date;
  recommendedResources?: string[];
}

/**
 * Relationship between concepts
 */
export interface ConceptRelationships {
  [key: string]: string[]; // e.g., "prerequisite": ["concept1", "concept2"]
}

/**
 * Concept mastery information
 */
export interface ConceptMastery {
  concept: string;
  confidence: number; // 0-1 range
  lastAssessed?: Date;
  trend?: "improving" | "declining" | "stable";
  category?: "core" | "applied" | "advanced" | "supplementary";
} 