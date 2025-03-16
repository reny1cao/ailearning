import express, { Router } from 'express';
import logger, { contextLogger } from '../../utils/logger';
import { AITeacher } from '../../services/ai/teacher/AITeacher';
import * as memoryDb from '../../db/memoryDb';

// Create router
const router: Router = express.Router();

// Create AITeacher instance to check its health
const aiTeacher = new AITeacher();

// Shared utility for checking deep seek configuration
const isDeepSeekConfigured = (): boolean => {
  try {
    return aiTeacher.isDeepSeekConfigured?.() || false;
  } catch (error) {
    logger.error('Error checking DeepSeek configuration', { 
      error: (error as Error).message,
    });
    return false;
  }
};

/**
 * GET /api/health
 * Health check endpoint that verifies the API is running
 * and all required services are available
 */
router.get('/', async (req, res) => {
  const requestId = req.id;
  const reqLogger = contextLogger({ requestId });
  
  const startTime = Date.now();
  reqLogger.debug('Health check requested');
  
  try {
    // Check memory db health (it's in-memory, so should always be available if service is up)
    let dbStatus: 'ok' | 'error' = 'ok';
    let dbError: string | null = null;
    
    // In a real-world app, we would do a proper DB health check
    // For now, we assume memory DB is healthy if service is running
    
    // Check DeepSeek API configuration
    const deepSeekConfigured = isDeepSeekConfigured();
    
    // Record services health status
    const servicesStatus = {
      database: dbStatus === 'ok',
      ai: deepSeekConfigured
    };
    
    // Determine overall health status
    let status: string;
    if (dbStatus === 'ok' && deepSeekConfigured) {
      status = 'healthy';
    } else if (dbStatus === 'ok' || deepSeekConfigured) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }
    
    // Create final response
    const response = {
      status,
      available: status !== 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime().toFixed(2) + 's',
      services: servicesStatus,
      version: process.env.npm_package_version || 'unknown',
      nodeEnv: process.env.NODE_ENV || 'development',
      deepSeekConfigured
    };
    
    const responseTime = Date.now() - startTime;
    reqLogger.info('Health check completed', { 
      status, 
      responseTime: responseTime + 'ms',
      deepSeekConfigured,
      dbStatus
    });
    
    res.json(response);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    reqLogger.error('Health check failed', { 
      error: (error as Error).message,
      responseTime: responseTime + 'ms'
    });
    
    res.status(500).json({
      status: 'error',
      available: false,
      timestamp: new Date().toISOString(),
      error: (error as Error).message,
      requestId
    });
  }
});

/**
 * GET /api/health/db
 * Specifically check database health
 */
router.get('/db', (req, res) => {
  const requestId = req.id;
  const reqLogger = contextLogger({ requestId });
  
  reqLogger.debug('Database health check requested');
  
  try {
    // For in-memory database, just check if service is running
    const isHealthy = true;
    
    reqLogger.info('Database health check completed', { 
      status: isHealthy ? 'ok' : 'error'
    });
    
    res.json({
      status: 'ok',
      message: 'In-memory database is available',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    reqLogger.error('Database health check failed', { 
      error: (error as Error).message
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Database health check failed: ' + (error as Error).message,
      timestamp: new Date().toISOString(),
      requestId
    });
  }
});

/**
 * GET /api/health/ai
 * Specifically check AI service health
 */
router.get('/ai', (req, res) => {
  const requestId = req.id;
  const reqLogger = contextLogger({ requestId });
  
  reqLogger.debug('AI service health check requested');
  
  try {
    const deepSeekConfigured = isDeepSeekConfigured();
    
    reqLogger.info('AI service health check completed', { 
      deepSeekConfigured
    });
    
    if (deepSeekConfigured) {
      res.json({
        status: 'ok',
        message: 'AI service is configured and ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'warning',
        message: 'AI service is not fully configured',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    reqLogger.error('AI service health check failed', { 
      error: (error as Error).message
    });
    
    res.status(500).json({
      status: 'error',
      message: 'AI service health check failed: ' + (error as Error).message,
      timestamp: new Date().toISOString(),
      requestId
    });
  }
});

export default router; 