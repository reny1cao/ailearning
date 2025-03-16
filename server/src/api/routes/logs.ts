import express from 'express';
import logger, { contextLogger } from '../../utils/logger';

// Create the router
const router = express.Router();

/**
 * POST /api/logs
 * Endpoint to receive client-side logs
 */
router.post('/', (req, res) => {
  try {
    const { logs, applicationId, userAgent, url } = req.body;
    
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid log format',
        message: 'Logs must be a non-empty array'
      });
    }
    
    // Create logger with client context
    const clientLogger = contextLogger({
      source: 'client',
      requestId: req.id,
      applicationId,
      userAgent,
      url,
    });
    
    // Process each log entry
    logs.forEach(log => {
      const { level, message, data, timestamp } = log;
      
      // Map client log levels to server log levels
      switch (level) {
        case 0: // ERROR
          clientLogger.error(`[CLIENT] ${message}`, { ...data, timestamp });
          break;
        case 1: // WARN
          clientLogger.warn(`[CLIENT] ${message}`, { ...data, timestamp });
          break;
        case 2: // INFO
          clientLogger.info(`[CLIENT] ${message}`, { ...data, timestamp });
          break;
        case 3: // DEBUG
          clientLogger.debug(`[CLIENT] ${message}`, { ...data, timestamp });
          break;
        default:
          clientLogger.info(`[CLIENT] ${message}`, { ...data, timestamp, unknownLevel: level });
      }
    });
    
    res.status(200).json({ 
      success: true, 
      processed: logs.length 
    });
  } catch (error) {
    logger.error('Error processing client logs', { 
      error: (error as Error).message,
      stack: (error as Error).stack,
      requestId: req.id,
    });
    
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to process logs'
    });
  }
});

export default router; 