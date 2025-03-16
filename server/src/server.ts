import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import teacherRoutes from './api/routes/teacher';
import env from './config/env';

// Initialize express app
const app = express();
const PORT = env.PORT;

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: env.CORS_ORIGIN
})); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Request logging

// API Routes
app.use('/api/teacher', teacherRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '1.0.0',
    env: {
      nodeEnv: env.NODE_ENV,
      deepSeekApiConfigured: env.hasDeepSeekApiKey()
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`AI Teacher API server running on port ${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  
  // Log DeepSeek API configuration status
  if (env.hasDeepSeekApiKey()) {
    console.log('DeepSeek API configured ✅');
  } else {
    console.warn('⚠️ DeepSeek API not configured. Set DEEPSEEK_API_KEY in .env file.');
  }
});

export default app; 