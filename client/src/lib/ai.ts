import { createParser } from 'eventsource-parser';
import { deepseekCompletion, getSystemPrompt as getDSSystemPrompt, formatUserPrompt as formatDSUserPrompt, Message } from './deepseek';

interface AIResponse {
  content: string;
  type: 'explanation' | 'example' | 'insight' | 'question';
}

// Keep mock responses for fallback and testing purposes
const mockResponses = {
  explain: [
    "Let me break this down into simpler terms. {concept} is fundamentally about {explanation}. Think of it like {analogy}.",
    "Here's a simple way to understand this: {concept} works by {explanation}. It's similar to {analogy}.",
    "The key to understanding {concept} is to recognize that {explanation}. In everyday terms, it's like {analogy}."
  ],
  example: [
    "Here's a practical example: {example}. This shows how {concept} works in the real world.",
    "Let me illustrate this with a real-world scenario: {example}. This demonstrates {concept} in action.",
    "Consider this example: {example}. It's a perfect illustration of how {concept} applies in practice."
  ],
  highlight: [
    "This is a crucial concept because {importance}. The key points to remember are: {points}",
    "Understanding this is essential because {importance}. Make sure to focus on: {points}",
    "This concept is fundamental because {importance}. The main takeaways are: {points}"
  ],
  question: [
    "Great question! {answer}. Does this help clarify your understanding?",
    "Let me address that: {answer}. Would you like me to elaborate on any part?",
    "Here's what you need to know: {answer}. Feel free to ask follow-up questions!"
  ]
};

function getRandomResponse(type: string): string {
  const responses = mockResponses[type as keyof typeof mockResponses] || mockResponses.question;
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateMockResponse(prompt: string, type: string): string {
  const template = getRandomResponse(type);
  
  // Simple template filling
  return template
    .replace('{concept}', prompt.substring(0, 30))
    .replace('{explanation}', 'it provides a systematic approach to solving problems')
    .replace('{analogy}', 'building blocks that fit together to create something bigger')
    .replace('{example}', 'when you\'re organizing information in a database')
    .replace('{importance}', 'it forms the foundation for more advanced topics')
    .replace('{points}', '1) core principles, 2) practical applications, 3) common patterns')
    .replace('{answer}', 'this concept helps us understand how systems work together');
}

export async function getAIResponse(
  prompt: string,
  type: 'explain' | 'example' | 'highlight' | 'question',
  context?: string
): Promise<AIResponse> {
  try {
    // Try to use DeepSeek API
    const messages: Message[] = [
      { 
        role: 'system', 
        content: getDSSystemPrompt(type) 
      },
      { 
        role: 'user', 
        content: formatDSUserPrompt(prompt, type, context) 
      }
    ];

    let content: string;
    try {
      // Use DeepSeek API
      content = await deepseekCompletion(messages, {
        temperature: 0.7,
        max_tokens: 800
      });
    } catch (apiError) {
      console.error('DeepSeek API Error:', apiError);
      // Fallback to mock responses if API fails
      content = generateMockResponse(prompt, type);
    }
    
    return {
      content,
      type: type === 'explain' ? 'explanation' : 
            type === 'example' ? 'example' :
            type === 'highlight' ? 'insight' : 'question'
    };
  } catch (error) {
    console.error('AI Response Error:', error);
    return {
      content: 'I apologize, but I encountered an error processing your request. Please try again.',
      type: 'question'
    };
  }
}

export async function getAIChatResponse(
  messages: {role: 'system' | 'user' | 'assistant', content: string}[],
  onUpdate?: (content: string) => void
): Promise<string> {
  try {
    // Convert to Message format
    const apiMessages: Message[] = messages.map(m => ({
      role: m.role,
      content: m.content
    }));

    try {
      // Use DeepSeek API with streaming
      return await deepseekCompletion(apiMessages, {
        temperature: 0.7,
        max_tokens: 1000,
        stream: !!onUpdate,
        onMessage: onUpdate
      });
    } catch (apiError) {
      console.error('DeepSeek API Chat Error:', apiError);
      // Fallback to a simple message if API fails
      return "I'm having trouble connecting to my knowledge base right now. Please try again later.";
    }
  } catch (error) {
    console.error('AI Chat Response Error:', error);
    return "I apologize, but I encountered an error processing your message. Please try again.";
  }
}

// Keep these utility functions for when we implement the real API
function getSystemPrompt(type: string): string {
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
    
    default:
      return `You are a helpful AI teaching assistant, focused on helping students learn effectively.`;
  }
}

function formatUserPrompt(prompt: string, type: string, context?: string): string {
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