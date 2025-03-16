import { createParser } from 'eventsource-parser';

// Define message types for the DeepSeek API
export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface DeepSeekCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
}

export interface DeepSeekStreamingCompletionResponse {
  id: string;
  choices: Array<{
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
}

// Get environment variables
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';

/**
 * Send a completion request to the DeepSeek API
 */
export async function deepseekCompletion(
  messages: Message[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    onMessage?: (content: string) => void;
  } = {}
): Promise<string> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API key is not configured');
  }

  const {
    model = 'deepseek-chat',
    temperature = 0.7,
    max_tokens = 1000,
    stream = false,
    onMessage
  } = options;

  const url = `${DEEPSEEK_API_URL}/chat/completions`;
  
  const requestBody: DeepSeekCompletionRequest = {
    model,
    messages,
    temperature,
    max_tokens,
    stream
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  if (stream) {
    return handleStreamingResponse(response, onMessage);
  } else {
    const data = await response.json() as DeepSeekCompletionResponse;
    return data.choices[0].message.content;
  }
}

/**
 * Handle streaming response from DeepSeek API
 */
async function handleStreamingResponse(
  response: Response, 
  onMessage?: (content: string) => void
): Promise<string> {
  if (!response.body) {
    throw new Error('No response body');
  }

  // Create parser for server-sent events
  const parser = createParser((event) => {
    if (event.type === 'event' && event.data !== '[DONE]') {
      try {
        const data = JSON.parse(event.data) as DeepSeekStreamingCompletionResponse;
        const content = data.choices[0].delta.content || '';
        onMessage?.(content);
        return content;
      } catch (error) {
        console.error('Error parsing streaming response:', error);
        return '';
      }
    }
    return '';
  });

  // Set up streaming response handling
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      parser.feed(chunk);
      result += chunk;
    }
  } catch (error) {
    console.error('Error reading stream:', error);
    throw error;
  }

  return result;
}

/**
 * Get a system prompt based on the type of interaction
 */
export function getSystemPrompt(type: string): string {
  switch (type) {
    case 'explain':
      return `You are an expert teacher who excels at explaining complex concepts in simple terms. 
              Your goal is to help students understand difficult topics by breaking them down into 
              clear, digestible explanations. Use analogies and simple examples where appropriate.`;
    
    case 'example':
      return `You are an expert at providing practical, real-world examples to illustrate concepts. 
              Your examples should be concrete, relatable, and help students understand how theoretical 
              knowledge applies in practice.`;
    
    case 'highlight':
      return `You are an expert at identifying and explaining key concepts. When presented with text, 
              highlight the most important points and explain why they are significant. Focus on 
              fundamental ideas that students need to understand.`;
    
    case 'question':
      return `You are a supportive teacher who helps students by answering their questions clearly 
              and thoroughly. Provide detailed explanations while maintaining a friendly and 
              encouraging tone. If a question is unclear, ask for clarification.`;
    
    case 'tutor':
      return `You are a highly skilled AI tutor, specialized in providing personalized learning assistance.
              Your goal is to help students master new concepts, clarify their understanding, and develop
              critical thinking skills. You can explain concepts, provide examples, answer questions,
              create practice exercises, and offer constructive feedback. You are patient, encouraging,
              and adapt your teaching approach to match the student's needs.`;
    
    default:
      return `You are a helpful AI teaching assistant, focused on helping students learn effectively.`;
  }
}

/**
 * Format a user prompt for different interaction types
 */
export function formatUserPrompt(prompt: string, type: string, context?: string): string {
  const contextInfo = context ? `\nContext: ${context}` : '';
  
  switch (type) {
    case 'explain':
      return `Please explain this concept in simple terms: "${prompt}"${contextInfo}`;
    
    case 'example':
      return `Please provide a practical, real-world example to illustrate this concept: "${prompt}"${contextInfo}`;
    
    case 'highlight':
      return `Please explain why this is an important concept and what key points students should understand: "${prompt}"${contextInfo}`;
    
    case 'question':
      return `${prompt}${contextInfo}`;
    
    default:
      return prompt;
  }
} 