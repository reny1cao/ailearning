import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import teacherRoutes from './api/routes/teacher';
import logsRoutes from './api/routes/logs';
import healthRoutes from './api/routes/health';
import { env } from './config/env';
import logger, { httpLogStream, contextLogger } from './utils/logger';

// Initialize express app
const app = express();
const PORT = env.PORT || 3001;

// Create logs directory if it doesn't exist
import fs from 'fs';
import path from 'path';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Apply middleware
app.use(helmet()); // Security headers

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Request ID middleware
app.use((req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// JSON parsing
app.use(express.json());

// Request logging
app.use(morgan('combined', { stream: httpLogStream }));

// Detailed request logging for debugging
app.use((req, res, next) => {
  const reqLogger = contextLogger({ requestId: req.id });
  reqLogger.debug(`${req.method} ${req.originalUrl}`, {
    headers: req.headers,
    query: req.query,
    ip: req.ip,
  });
  
  // Add response logging
  const originalSend = res.send;
  res.send = function(body) {
    reqLogger.debug(`Response: ${res.statusCode}`, {
      contentLength: body?.length,
      responseTime: Date.now() - req.startTime,
    });
    return originalSend.call(this, body);
  };
  
  // Track request timing
  req.startTime = Date.now();
  next();
});

// API Routes
app.use('/api/teacher', teacherRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/health', healthRoutes);

// Legacy health check endpoint (for backwards compatibility)
app.get('/health', (req, res) => {
  const reqLogger = contextLogger({ requestId: req.id });
  reqLogger.info('Legacy health check requested');
  
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    nodeEnv: env.NODE_ENV,
    deepSeekConfigured: env.hasDeepSeekApiKey(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
  
  reqLogger.debug('Health check response', healthData);
  res.json(healthData);
});

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`, {
    requestId: req.id,
    ip: req.ip,
  });
  
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    requestId: req.id,
    path: req.originalUrl,
    method: req.method,
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
    requestId: req.id
  });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    nodeEnv: env.NODE_ENV,
    apiUrl: `http://localhost:${PORT}`,
    deepSeekConfigured: env.hasDeepSeekApiKey(),
  });
  
  logger.info(`API Documentation: http://localhost:${PORT}/api-docs`);
});

// Add graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// For TypeScript
declare global {
  namespace Express {
    interface Request {
      id: string;
      startTime: number;
    }
  }
} 