import express from 'express';
import { AITeacher } from '../../services/ai/teacher/AITeacher';
import { TeachingContext, TeachingResponse } from '../../../../shared/types';

const router = express.Router();
const aiTeacher = new AITeacher();

/**
 * Process a user message and generate a teaching response
 * POST /api/teacher/interact
 */
router.post('/interact', async (req, res) => {
  try {
    const { userId, message, context } = req.body;
    
    // Validate required fields
    if (!userId || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId and message are required' 
      });
    }
    
    // Process the interaction
    const teachingContext: TeachingContext = context || {
      contextId: `context-${Date.now()}`,
      courseId: req.body.courseId,
      moduleId: req.body.moduleId,
      goals: req.body.goals || [],
      relevantConcepts: req.body.relevantConcepts || []
    };
    
    const response = await aiTeacher.processInteraction(
      userId,
      message,
      teachingContext
    );
    
    res.json(response);
  } catch (error) {
    console.error('Error in teacher interaction endpoint:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing your request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Analyze user understanding based on their message
 * POST /api/teacher/analyze-understanding
 */
router.post('/analyze-understanding', async (req, res) => {
  try {
    const { userId, message, concepts } = req.body;
    
    // Validate required fields
    if (!userId || !message || !concepts || !Array.isArray(concepts)) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, message, and concepts array are required' 
      });
    }
    
    const analysis = await aiTeacher.analyzeUnderstanding(
      userId,
      message,
      concepts
    );
    
    res.json(analysis);
  } catch (error) {
    console.error('Error in understanding analysis endpoint:', error);
    res.status(500).json({ 
      error: 'An error occurred while analyzing understanding',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get available teaching strategies
 * GET /api/teacher/strategies
 */
router.get('/strategies', async (req, res) => {
  try {
    const strategies = await aiTeacher.getTeachingStrategies();
    res.json(strategies);
  } catch (error) {
    console.error('Error fetching teaching strategies:', error);
    res.status(500).json({ 
      error: 'An error occurred while fetching teaching strategies',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Update user learning style
 * PUT /api/teacher/learning-style
 */
router.put('/learning-style', async (req, res) => {
  try {
    const { userId, learningStyle } = req.body;
    
    // Validate required fields
    if (!userId || !learningStyle || !learningStyle.primary) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId and learningStyle.primary are required' 
      });
    }
    
    await aiTeacher.updateLearningStyle(userId, learningStyle);
    
    res.json({ 
      success: true,
      message: 'Learning style updated successfully'
    });
  } catch (error) {
    console.error('Error updating learning style:', error);
    res.status(500).json({ 
      error: 'An error occurred while updating learning style',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Submit feedback on teaching effectiveness
 * POST /api/teacher/feedback
 */
router.post('/feedback', async (req, res) => {
  try {
    const { userId, interactionId, rating, comment } = req.body;
    
    // Validate required fields
    if (!userId || !interactionId || rating === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, interactionId, and rating are required' 
      });
    }
    
    // Validate rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }
    
    await aiTeacher.recordFeedback(userId, interactionId, rating, comment);
    
    res.json({ 
      success: true,
      message: 'Feedback recorded successfully'
    });
  } catch (error) {
    console.error('Error recording feedback:', error);
    res.status(500).json({ 
      error: 'An error occurred while recording feedback',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 