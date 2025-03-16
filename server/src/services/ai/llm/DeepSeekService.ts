import axios from 'axios';
import { env } from '../../../config/env';
import { Message } from '../../../../../shared/types';
import { createParser } from 'eventsource-parser';
import logger from '../../../utils/logger';

/**
 * Service for interacting with the DeepSeek API
 */
export class DeepSeekService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;
  private isConfiguredStatus: boolean;

  constructor() {
    this.apiKey = env.DEEPSEEK_API_KEY;
    const baseUrl = env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
    this.apiUrl = `${baseUrl}/chat/completions`;
    this.model = env.DEEPSEEK_MODEL || 'deepseek-chat';
    this.isConfiguredStatus = !!this.apiKey;
    
    if (!this.apiKey) {
      console.warn('DeepSeek API key not configured. Using fallback responses.');
    } else {
      console.log(`DeepSeek API configured with URL: ${this.apiUrl} and model: ${this.model}`);
    }
  }

  /**
   * Generate a response from the DeepSeek API
   * @param prompt The prompt to send to the API
   * @returns The generated response
   */
  async generateResponse(prompt: string | Message[]): Promise<string> {
    if (!this.isConfiguredStatus) {
      return this.generateFallbackResponse(prompt);
    }
    
    try {
      // Format messages for the API
      const messages = this.formatMessages(prompt);
      
      console.log(`Making API request to ${this.apiUrl} with model ${this.model}`);
      
      // Make the API request
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 30000 // 30 second timeout
        }
      );
      
      // Extract and return the response content
      const generatedContent = response.data.choices[0]?.message?.content;
      
      if (!generatedContent) {
        console.warn('Empty response from DeepSeek API, using fallback');
        return this.generateFallbackResponse(prompt);
      }
      
      return generatedContent;
    } catch (error) {
      console.error('Error generating response from DeepSeek API:', error);
      
      // Provide more specific error information
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('API response error:', error.response.data);
          // Temporarily disable this API endpoint if we're getting consistent errors
          if (error.response.status === 404 || error.response.status === 401) {
            console.error('Disabling DeepSeek API due to authentication/configuration issues');
            this.isConfiguredStatus = false;
          }
        } else if (error.request) {
          console.error('API request error (no response):', error.request);
        }
      }
      
      // Always fall back to local response generation
      return this.generateFallbackResponse(prompt);
    }
  }

  /**
   * Generate a streaming response from DeepSeek API
   * With improved handling of SSE events to avoid duplicates
   */
  async generateStreamingResponse(
    prompt: string,
    onChunk: (chunk: string) => void,
    onComplete?: () => void
  ): Promise<void> {
    try {
      // Ensure we have an API key configured
      if (!this.isConfigured()) {
        logger.error('DeepSeek API not configured, cannot generate streaming response');
        onChunk(JSON.stringify({
          content: "I'm sorry, the AI service is not configured properly. Please contact support."
        }));
        if (onComplete) onComplete();
        return;
      }

      logger.info('Generating streaming response with DeepSeek API', {
        model: this.model,
        promptLength: prompt.length
      });

      // Create request options
      const requestOptions = this.createRequestOptions(prompt, true);
      
      // Fetch from DeepSeek API with streaming enabled
      const response = await fetch(this.apiUrl, requestOptions);
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.error('DeepSeek API error', {
          status: response.status,
          error: errorText
        });
        
        // Send error to client
        onChunk(JSON.stringify({
          content: `Error from AI service: ${response.status}. Please try again later.`
        }));
        
        if (onComplete) onComplete();
        return;
      }
      
      // Ensure we have a body
      if (!response.body) {
        throw new Error('Response body is null');
      }
      
      // Process the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let isFirstChunk = true;
      
      try {
        // Read chunks until done
        while (true) {
          const { value, done } = await reader.read();
          
          if (done) {
            logger.debug('Streaming response complete');
            // Process any remaining data in buffer
            if (buffer.trim()) {
              processDataChunk(buffer);
            }
            break;
          }
          
          // Decode the chunk and add to buffer
          const textChunk = decoder.decode(value, { stream: true });
          buffer += textChunk;
          
          // Split on double newlines (standard SSE format)
          const parts = buffer.split('\n\n');
          
          // Process all complete parts except the last one (which might be incomplete)
          for (let i = 0; i < parts.length - 1; i++) {
            processDataChunk(parts[i]);
          }
          
          // Keep the last part in the buffer
          buffer = parts[parts.length - 1];
        }
      } catch (streamError) {
        logger.error('Error reading stream', {
          error: (streamError as Error).message
        });
        throw streamError;
      } finally {
        // Always call onComplete at the end
        if (onComplete) onComplete();
      }
      
      // Function to process individual data events
      function processDataChunk(chunk: string) {
        // Only process data: lines
        if (chunk.startsWith('data:')) {
          // Extract data part (remove 'data: ' prefix)
          const data = chunk.substring(5).trim();
          
          // Skip empty data
          if (!data) return;
          
          // Special handling for first chunk
          if (isFirstChunk) {
            // Some clients might need the 'data: ' prefix to correctly identify SSE
            // In this case, we pass the raw chunk
            onChunk(chunk);
            isFirstChunk = false;
            return;
          }
          
          // Pass data to callback
          onChunk(data);
        }
      }
    } catch (error) {
      logger.error('Error in DeepSeek streaming response', {
        error: (error as Error).message,
        trace: (error as Error).stack
      });
      
      // Send error to client
      onChunk(JSON.stringify({
        content: `An error occurred while generating the response: ${(error as Error).message}`
      }));
      
      // Always call onComplete even on error
      if (onComplete) onComplete();
    }
  }

  /**
   * Handle fallback streaming when the API fails
   */
  private async handleFallbackStreaming(
    prompt: string | Message[],
    onChunk: (chunk: string) => void,
    onComplete?: () => void
  ): Promise<void> {
    console.log('Using fallback streaming response due to API error');
    
    const fallbackResponse = this.generateFallbackResponse(prompt);
    
    try {
      // Simulate streaming by breaking the response into chunks
      const words = fallbackResponse.split(' ');
      const chunkSize = 5; // Words per chunk
      
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunk = words.slice(i, i + chunkSize).join(' ') + ' ';
        onChunk(chunk);
        // Simulate streaming delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error('Error in fallback streaming:', error);
    } finally {
      // Ensure onComplete is called to signal that streaming is complete
      if (onComplete) {
        console.log('Fallback streaming complete, calling onComplete callback');
        onComplete();
      }
    }
  }

  /**
   * Helper method to format messages consistently
   */
  private formatMessages(prompt: string | Message[]): Message[] {
    if (typeof prompt === 'string') {
      return [
        { role: 'system', content: 'You are a helpful AI teacher specializing in explaining complex topics clearly and accurately.' },
        { role: 'user', content: prompt }
      ];
    } else {
      // If already formatted as messages, make sure there's a system message
      if (!prompt.some(msg => msg.role === 'system')) {
        return [
          { role: 'system', content: 'You are a helpful AI teacher specializing in explaining complex topics clearly and accurately.' },
          ...prompt
        ];
      } else {
        return [...prompt];
      }
    }
  }

  /**
   * Generate a fallback response when the API is not available
   */
  private generateFallbackResponse(promptOrMessages: string | Message[]): string {
    console.log('Generating fallback response (API not configured)');
    
    let userMessage = '';
    
    // Extract the user's message from the prompt
    if (typeof promptOrMessages === 'string') {
      userMessage = promptOrMessages;
    } else if (Array.isArray(promptOrMessages)) {
      // Find the last user message
      for (let i = promptOrMessages.length - 1; i >= 0; i--) {
        if (promptOrMessages[i].role === 'user') {
          userMessage = promptOrMessages[i].content;
          break;
        }
      }
    }
    
    // Extract keywords to make the response more relevant
    const keywords = this.extractKeywords(userMessage);
    
    // Generate a contextually appropriate response based on the keywords
    const topic = keywords[0] || 'the topic';
    
    return `I understand you're asking about ${topic}. Since I'm running in fallback mode without API access, I can provide some general information.

${topic} is an important concept in the field of artificial intelligence and machine learning. It involves the application of computational techniques to solve problems that typically require human intelligence.

Some key points about ${topic}:

1. It's a fundamental concept that builds upon various mathematical and computational principles
2. Understanding ${topic} requires familiarity with related concepts like algorithms, data structures, and problem-solving approaches
3. There are practical applications of ${topic} in various domains including software development, data analysis, and system design
4. Learning ${topic} effectively involves both theoretical understanding and hands-on practice

I recommend exploring resources like textbooks, online courses, and programming exercises to deepen your understanding of ${topic}.

Would you like to know more about:
1. The fundamental principles of ${topic}?
2. Practical applications of ${topic}?
3. How to get started learning about ${topic}?

Feel free to ask more specific questions and I'll try to provide the best guidance I can in fallback mode.

[Note: I'm currently operating in fallback mode without access to the DeepSeek API. For more detailed or accurate information, please try again when API access is restored.]`;
  }

  /**
   * Extract keywords from a message to generate more relevant fallback responses
   */
  private extractKeywords(message: string): string[] {
    // Simple keyword extraction based on common programming and AI terms
    const keywords: string[] = [];
    
    // List of potential topics to detect in the message
    const topics = [
      'programming', 'python', 'javascript', 'java', 'c++', 'go', 'rust',
      'machine learning', 'deep learning', 'neural networks', 'ai', 'artificial intelligence',
      'data science', 'algorithms', 'data structures', 'web development', 'software engineering',
      'database', 'sql', 'nosql', 'frontend', 'backend', 'fullstack', 'cloud computing',
      'devops', 'version control', 'git', 'api', 'frameworks', 'libraries',
      'tensorflow', 'pytorch', 'react', 'angular', 'vue', 'node.js',
      'computer science', 'software design', 'object oriented programming'
    ];
    
    // Check for each topic in the message
    const messageLower = message.toLowerCase();
    for (const topic of topics) {
      if (messageLower.includes(topic.toLowerCase())) {
        keywords.push(topic);
      }
    }
    
    // If no specific topics found, add general technology keywords
    if (keywords.length === 0) {
      // Try to extract nouns as potential keywords
      const words = messageLower.split(/\W+/);
      for (const word of words) {
        if (word.length > 3 && !['what', 'when', 'where', 'which', 'with', 'this', 'that', 'there', 'about'].includes(word)) {
          keywords.push(word);
        }
      }
      
      // If still empty, add technology as default
      if (keywords.length === 0) {
        keywords.push('technology');
        keywords.push('programming');
        keywords.push('software development');
      }
    }
    
    return keywords;
  }

  /**
   * Analyze user understanding based on their response
   */
  async analyzeUnderstanding(
    message: string,
    concepts: string[]
  ): Promise<{
    isUnderstanding: boolean;
    confusedConcepts: string[];
    confidenceScore: number;
  }> {
    if (!this.isConfiguredStatus) {
      // Fallback understanding analysis
      return this.fallbackUnderstandingAnalysis(message, concepts);
    }
    
    try {
      const prompt = `
Analyze whether the user understands the following concepts based on their message.
Concepts: ${concepts.join(', ')}

User message: "${message}"

Return your analysis as a JSON object with the following structure:
{
  "isUnderstanding": boolean,
  "confusedConcepts": string[],
  "confidenceScore": number (between 0 and 1)
}

Where:
- isUnderstanding: true if the user seems to understand the concepts, false otherwise
- confusedConcepts: array of concepts the user seems confused about
- confidenceScore: your confidence level in the user's understanding (0 = no understanding, 1 = complete understanding)
`;

      const response = await this.generateResponse(prompt);
      
      try {
        // Try to parse the JSON response
        const jsonStr = response.trim()
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        
        const result = JSON.parse(jsonStr);
        
        return {
          isUnderstanding: !!result.isUnderstanding,
          confusedConcepts: Array.isArray(result.confusedConcepts) ? result.confusedConcepts : [],
          confidenceScore: typeof result.confidenceScore === 'number' ? result.confidenceScore : 0.5
        };
      } catch (parseError) {
        console.error('Error parsing understanding analysis:', parseError);
        return this.fallbackUnderstandingAnalysis(message, concepts);
      }
    } catch (error) {
      console.error('Error analyzing understanding:', error);
      return this.fallbackUnderstandingAnalysis(message, concepts);
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
   * Check if the DeepSeek API is properly configured
   * @returns True if the API key is configured
   */
  isConfigured(): boolean {
    return this.isConfiguredStatus;
  }

  /**
   * Create request options for the DeepSeek API
   */
  private createRequestOptions(prompt: string, stream: boolean = false): RequestInit {
    // Format the messages for the API
    const messages = Array.isArray(prompt) 
      ? prompt 
      : [
          { role: 'system', content: 'You are a helpful AI teacher.' },
          { role: 'user', content: prompt }
        ];
    
    return {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        stream
      })
    };
  }
}