import axios from 'axios';
import { Message } from '../../../../../shared/types';
import env from '../../../config/env';

/**
 * Service for interacting with the DeepSeek API to generate AI responses
 */
export class DeepSeekService {
  private apiKey: string;
  private apiUrl: string;
  private model: string = 'deepseek-chat';

  constructor() {
    this.apiKey = env.DEEPSEEK_API_KEY;
    this.apiUrl = env.DEEPSEEK_API_URL;
    
    if (!this.apiKey) {
      console.warn('DeepSeek API key is not set. LLM functionality will not work.');
    }
  }

  /**
   * Generate a response using the DeepSeek API
   */
  async generateResponse(
    messages: Message[],
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('DeepSeek API key is not configured');
      }

      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: this.model,
          messages,
          temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content;
      } else {
        throw new Error('No response from DeepSeek API');
      }
    } catch (error) {
      console.error('Error generating response from DeepSeek API:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error('DeepSeek API error details:', error.response.data);
        throw new Error(`DeepSeek API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      
      throw new Error('Failed to generate response from DeepSeek API');
    }
  }

  /**
   * Generate a teaching response with customized system prompt
   */
  async generateTeachingResponse(
    userMessage: string,
    teachingPrompt: string,
    conceptsToExplain: string[],
    userLearningStyle: string,
    previousMessages: Message[] = []
  ): Promise<string> {
    // Create a system message with teaching instructions
    const systemMessage: Message = {
      role: 'system',
      content: `You are an expert AI teaching assistant specialized in teaching AI concepts. 
      ${teachingPrompt}
      
      Focus on explaining these concepts: ${conceptsToExplain.join(', ')}.
      
      The student's learning style is: ${userLearningStyle}.
      
      Your explanations should be:
      - Clear and concise
      - Tailored to the student's learning style
      - Include relevant examples
      - Build on concepts the student already understands
      - Ask reflective questions to check understanding
      
      Avoid:
      - Being too technical without explanation
      - Using jargon without defining it
      - Providing incorrect information`
    };
    
    // Combine system message, previous messages, and current user message
    const messages: Message[] = [
      systemMessage,
      ...previousMessages,
      { role: 'user', content: userMessage }
    ];
    
    // Generate response with slightly lower temperature for more focused teaching
    return this.generateResponse(messages, 0.5, 1500);
  }
  
  /**
   * Extract concepts from text using the DeepSeek API
   */
  async extractConcepts(text: string): Promise<string[]> {
    const systemMessage: Message = {
      role: 'system',
      content: `You are an AI concept extraction assistant. 
      Analyze the provided text and extract key AI-related concepts mentioned in it.
      Return only a JSON array of strings representing the concepts, without any additional text or explanations.
      Focus on technical concepts, algorithms, methods, and frameworks.`
    };
    
    const userMessage: Message = {
      role: 'user',
      content: text
    };
    
    try {
      const response = await this.generateResponse([systemMessage, userMessage], 0.3, 500);
      
      // Try to parse the response as a JSON array
      try {
        // First, try to extract JSON if it's wrapped in backticks
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : response;
        
        // Parse the JSON array
        const concepts = JSON.parse(jsonStr);
        
        if (Array.isArray(concepts)) {
          return concepts.map(concept => concept.toLowerCase().trim());
        } else {
          console.error('Extracted concepts is not an array:', concepts);
          return [];
        }
      } catch (parseError) {
        console.error('Failed to parse concepts from response:', parseError);
        console.error('Raw response:', response);
        return [];
      }
    } catch (error) {
      console.error('Error extracting concepts:', error);
      return [];
    }
  }
  
  /**
   * Analyze the user's understanding based on their message
   */
  async analyzeUnderstanding(
    userMessage: string,
    conceptsBeingTaught: string[]
  ): Promise<{
    isUnderstanding: boolean;
    confusedConcepts: string[];
    confidenceScore: number;
    suggestedApproach?: string;
  }> {
    const systemMessage: Message = {
      role: 'system',
      content: `You are an AI education assessment assistant.
      Analyze the student's message to determine their level of understanding of the concepts.
      Return a JSON object with the following properties:
      - isUnderstanding: boolean indicating if the student demonstrates understanding
      - confusedConcepts: array of specific concepts the student seems confused about
      - confidenceScore: number from 0 to 1 indicating confidence in student's mastery
      - suggestedApproach: optional string with a suggested teaching approach for clarification`
    };
    
    const userPrompt: Message = {
      role: 'user',
      content: `Assess the student's understanding of these concepts: ${conceptsBeingTaught.join(', ')}
      
      Student's message: "${userMessage}"`
    };
    
    try {
      const response = await this.generateResponse([systemMessage, userPrompt], 0.3, 500);
      
      // Try to parse the response as a JSON object
      try {
        // Extract JSON if it's wrapped in backticks
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : response;
        
        // Parse the JSON object
        return JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('Failed to parse understanding analysis from response:', parseError);
        console.error('Raw response:', response);
        
        // Return a default analysis
        return {
          isUnderstanding: true,
          confusedConcepts: [],
          confidenceScore: 0.5
        };
      }
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
  
  /**
   * Generate follow-up questions based on the teaching context
   */
  async generateFollowUpQuestions(
    teachingContent: string,
    conceptsCovered: string[]
  ): Promise<string[]> {
    const systemMessage: Message = {
      role: 'system',
      content: `You are an AI teaching assistant specialized in generating follow-up questions.
      Generate 3 follow-up questions that would help reinforce learning and check understanding.
      Return only a JSON array of strings representing the questions, without any additional text.
      The questions should:
      - Check understanding of key concepts
      - Encourage critical thinking
      - Help the student connect different concepts together
      - Range from easier to more challenging`
    };
    
    const userPrompt: Message = {
      role: 'user',
      content: `Generate follow-up questions for this teaching content:
      
      Content: "${teachingContent}"
      
      Concepts covered: ${conceptsCovered.join(', ')}`
    };
    
    try {
      const response = await this.generateResponse([systemMessage, userPrompt], 0.7, 500);
      
      // Try to parse the response as a JSON array
      try {
        // Extract JSON if it's wrapped in backticks
        const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : response;
        
        // Parse the JSON array
        const questions = JSON.parse(jsonStr);
        
        if (Array.isArray(questions)) {
          return questions;
        } else {
          console.error('Generated questions is not an array:', questions);
          return [];
        }
      } catch (parseError) {
        console.error('Failed to parse questions from response:', parseError);
        console.error('Raw response:', response);
        
        // If parsing fails, try to extract questions using regex
        const questionRegex = /\d+\.\s+(.*?)(?=\d+\.|$)/g;
        const matches = response.matchAll(questionRegex);
        const questions = Array.from(matches).map(match => match[1].trim());
        
        return questions.length > 0 ? questions : [
          "Can you explain how this concept works in your own words?",
          "What are some practical applications of what we just discussed?",
          "How does this concept relate to what you already know?"
        ];
      }
    } catch (error) {
      console.error('Error generating follow-up questions:', error);
      
      // Return default questions in case of error
      return [
        "Can you explain how this concept works in your own words?",
        "What are some practical applications of what we just discussed?",
        "How does this concept relate to what you already know?"
      ];
    }
  }
} 