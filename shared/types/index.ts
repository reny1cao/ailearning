/**
 * Shared type definitions for the AI learning platform
 */

export * from './memory';
export * from './teaching';

/**
 * Common message type used for API communication
 */
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * API request for AI chat
 */
export interface ChatRequest {
  messages: Message[];
  userId: string;
  sessionId: string;
  moduleId?: string;
  courseId?: string;
  contextType?: 'course' | 'module' | 'general';
}

/**
 * API response for AI chat
 */
export interface ChatResponse {
  message: Message;
  suggestedFollowups?: string[];
  detectedConcepts?: string[];
  recommendedConcepts?: string[];
}

/**
 * User profile shared between client and server
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: Date;
}

/**
 * Course information shared between client and server
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  authorId: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Module information shared between client and server
 */
export interface Module {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  estimatedMinutes: number;
  createdAt: Date;
  updatedAt: Date;
} 