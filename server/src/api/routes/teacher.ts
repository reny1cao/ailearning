import express from 'express';
import { AITeacher } from '../../services/ai/teacher/AITeacher';
import { 
  ChatRequest, 
  ChatResponse, 
  TeachingResponse,
  Message
} from '../../../../shared/types';
import logger, { contextLogger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Create the router
const router = express.Router();

// Initialize the AI teacher service
const aiTeacher = new AITeacher();

/**
 * POST /api/teacher/chat
 * Process a chat message and return an AI teacher response
 */
router.post('/chat', async (req, res) => {
  const requestId = req.id;
  const reqLogger = contextLogger({ requestId });
  
  try {
    const { userId, sessionId, message, previousMessages = [], moduleContent, moduleTitle } = req.body;
    
    // Validate required fields
    if (!userId || !sessionId || !message) {
      reqLogger.warn('Missing required fields in chat request', { 
        userId, sessionId, hasMessage: !!message 
      });
      
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userId, sessionId, and message are required'
      });
    }

    reqLogger.info('Processing chat message', { 
      userId, 
      sessionId, 
      messageLength: message.length,
      prevMessagesCount: previousMessages.length,
      hasModuleContent: !!moduleContent,
    });
    
    // Process the message with the AI teacher
    const response = await aiTeacher.processInteraction(
      userId,
      sessionId,
      message,
      previousMessages
    );
    
    reqLogger.debug('Generated AI teacher response', { 
      responseLength: response.content.length,
      conceptsCovered: response.conceptsCovered?.length || 0,
      followupQuestions: response.followupQuestions?.length || 0,
    });
    
    // Return the response
    const chatResponse: ChatResponse = {
      message: {
        role: 'assistant',
        content: response.content
      },
      detectedConcepts: response.conceptsCovered || [],
      suggestedFollowups: response.followupQuestions || []
    };
    
    res.json(chatResponse);
  } catch (error) {
    reqLogger.error('Error processing chat message', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    
    // Handle common error scenarios
    if ((error as Error).message.includes('DeepSeek API is not configured')) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'AI service is not fully configured. Try again later.'
      });
    }
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message || 'Failed to process message',
      requestId
    });
  }
});

/**
 * POST /api/teacher/chat/stream
 * Stream a chat message response from the AI teacher
 */
router.post('/chat/stream', async (req, res) => {
  const requestId = req.id;
  const reqLogger = contextLogger({ requestId });
  
  try {
    const { userId, sessionId, message, previousMessages = [], moduleContent, moduleTitle } = req.body;
    
    // Validate required fields
    if (!userId || !sessionId || !message) {
      reqLogger.warn('Missing required fields in streaming chat request', { 
        userId, sessionId, hasMessage: !!message 
      });
      
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userId, sessionId, and message are required'
      });
    }
    
    reqLogger.info('Processing streaming chat message', { 
      userId, 
      sessionId, 
      messageLength: message.length,
      prevMessagesCount: previousMessages.length,
      hasModuleContent: !!moduleContent,
    });
    
    // Set headers for SSE streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send a connection confirmation
    res.write(`data: {"type":"connected","requestId":"${requestId}"}\n\n`);
    
    // Check if DeepSeek is configured - if not, we'll use a non-streaming approach
    const isDeepSeekConfigured = aiTeacher.isDeepSeekConfigured();
    
    // Process the message with streaming
    if (aiTeacher.processInteractionStream && isDeepSeekConfigured) {
      // If the streaming method is available and DeepSeek is configured, use it
      reqLogger.debug('Using streaming processing with DeepSeek');
      await aiTeacher.processInteractionStream(
        userId,
        sessionId,
        message,
        previousMessages,
        // Handle chunk
        (chunk: string) => {
          // Pass raw chunk directly without wrapping it in SSE format
          // The chunk already comes in SSE format from DeepSeek
          res.write(chunk);
        },
        // Handle completion
        (response: TeachingResponse) => {
          // Send metadata about the response
          if (response.conceptsCovered || response.followupQuestions) {
            const metadata = JSON.stringify({
              concepts: response.conceptsCovered || [],
              followupQuestions: response.followupQuestions || [],
            });
            res.write(`data: METADATA:${metadata}\n\n`);
          }
          
          // Send completion message
          res.write(`data: {"type":"complete"}\n\n`);
          res.end();
          
          reqLogger.debug('Streaming response complete', {
            responseLength: response.content.length,
            conceptsCovered: response.conceptsCovered?.length || 0,
            followupQuestions: response.followupQuestions?.length || 0,
          });
        },
        // Handle error
        (error: Error) => {
          reqLogger.error('Error during streaming response', {
            error: error.message,
            stack: error.stack,
          });
          
          res.write(`data: {"type":"error","message":"${error.message}"}\n\n`);
          res.end();
        }
      );
    } else {
      // Fallback for servers that don't support streaming or DeepSeek not configured
      reqLogger.warn('Using non-streaming fallback', {
        streamingSupported: !!aiTeacher.processInteractionStream,
        deepSeekConfigured: isDeepSeekConfigured
      });
      
      try {
        // Process the interaction normally (non-streaming)
        const response = await aiTeacher.processInteraction(
          userId,
          sessionId, 
          message,
          previousMessages
        );
        
        // Send metadata first
        if (response.conceptsCovered || response.followupQuestions) {
          const metadata = JSON.stringify({
            concepts: response.conceptsCovered || [],
            followupQuestions: response.followupQuestions || [],
          });
          res.write(`data: METADATA:${metadata}\n\n`);
        }
        
        // Simulate streaming by breaking the content into chunks
        if (response.content) {
          // Split the content into chunks to simulate streaming
          const words = response.content.split(' ');
          const chunkSize = 10; // Words per chunk
          
          for (let i = 0; i < words.length; i += chunkSize) {
            const chunk = words.slice(i, i + chunkSize).join(' ') + ' ';
            res.write(`data: ${chunk}\n\n`);
            
            // Small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        // Send completion
        res.write(`data: {"type":"complete"}\n\n`);
        res.end();
        
        reqLogger.debug('Non-streaming fallback response sent', {
          responseLength: response.content.length,
          conceptsCovered: response.conceptsCovered?.length || 0,
          followupQuestions: response.followupQuestions?.length || 0,
        });
      } catch (error) {
        reqLogger.error('Error in non-streaming fallback', {
          error: (error as Error).message,
          stack: (error as Error).stack,
        });
        
        res.write(`data: {"type":"error","message":"${(error as Error).message}"}\n\n`);
        res.end();
      }
    }
  } catch (error) {
    reqLogger.error('Error setting up streaming', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    
    // If headers haven't been sent yet, send a JSON error
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: (error as Error).message || 'Failed to process streaming message',
        requestId
      });
    } else {
      // Otherwise, send an error event
      res.write(`data: {"type":"error","message":"${(error as Error).message}"}\n\n`);
      res.end();
    }
  }
});

/**
 * POST /api/teacher/analyze
 * Analyze user understanding of concepts
 */
router.post('/analyze', async (req, res) => {
  const requestId = req.id;
  const reqLogger = contextLogger({ requestId });
  
  try {
    const { userId, userResponse, concepts } = req.body;
    
    // Validate required fields
    if (!userId || !userResponse || !concepts) {
      reqLogger.warn('Missing required fields in analyze request', { 
        userId, 
        hasUserResponse: !!userResponse,
        hasConcepts: !!concepts,
      });
      
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userId, userResponse, and concepts are required'
      });
    }
    
    reqLogger.info('Analyzing user understanding', { 
      userId, 
      responseLength: userResponse.length,
      conceptsCount: concepts.length,
    });
    
    // Analyze user understanding
    const analysis = await aiTeacher.analyzeUnderstanding(userId, userResponse, concepts);
    
    reqLogger.debug('Analysis complete', analysis);
    
    res.json({
      understandingLevel: analysis.confidenceScore,
      misunderstandings: analysis.confusedConcepts,
      recommendations: [],
    });
  } catch (error) {
    reqLogger.error('Error analyzing understanding', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message || 'Failed to analyze understanding',
      requestId
    });
  }
});

/**
 * POST /api/teacher/feedback
 * Submit feedback about an AI teaching interaction
 */
router.post('/feedback', async (req, res) => {
  const requestId = req.id;
  const reqLogger = contextLogger({ requestId });
  
  try {
    const { userId, interactionId, rating, comment } = req.body;
    
    // Validate required fields
    if (!userId || !interactionId || rating === undefined) {
      reqLogger.warn('Missing required fields in feedback request', { 
        userId, 
        interactionId,
        hasRating: rating !== undefined,
      });
      
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userId, interactionId, and rating are required'
      });
    }
    
    reqLogger.info('Recording feedback', { 
      userId, 
      interactionId,
      rating,
      hasComment: !!comment,
    });
    
    await aiTeacher.recordFeedback(userId, interactionId, rating, comment);
    
    res.json({
      success: true,
      message: 'Feedback recorded successfully'
    });
  } catch (error) {
    reqLogger.error('Error recording feedback', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
    });
    
    res.status(500).json({
      error: 'Internal Server Error',
      message: (error as Error).message || 'Failed to record feedback',
      requestId
    });
  }
});

/**
 * GET /api/teacher/health
 * Check the health of the AI teacher service
 */
router.get('/health', (req, res) => {
  try {
    // Check if the DeepSeek API is configured
    const isConfigured = aiTeacher.isDeepSeekConfigured();
    
    res.json({
      status: 'ok',
      deepseekConfigured: isConfigured,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking health:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 