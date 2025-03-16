import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try to find the .env file in different locations
const potentialPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(process.cwd(), '../../.env')
];

let envPath: string | undefined;
for (const potentialPath of potentialPaths) {
  if (fs.existsSync(potentialPath)) {
    envPath = potentialPath;
    break;
  }
}

if (envPath) {
  dotenv.config({ path: envPath });
  console.log(`Loaded environment variables from ${envPath}`);
} else {
  console.warn('No .env file found. Using environment variables from the system.');
  dotenv.config();
}

// Define and export environment variables with types
export const env = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  
  // DeepSeek API configuration
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
  DEEPSEEK_API_URL: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
  
  // Database configuration (for future use)
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // JWT configuration (for future use)
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // Other configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Helper functions
  isProd: () => env.NODE_ENV === 'production',
  isDev: () => env.NODE_ENV === 'development',
  isTest: () => env.NODE_ENV === 'test',
  
  // API keys validation
  hasDeepSeekApiKey: () => !!env.DEEPSEEK_API_KEY,
  hasDatabase: () => !!env.DATABASE_URL
};

// Validate required environment variables in production
if (env.isProd()) {
  const requiredEnvVars = ['DEEPSEEK_API_KEY', 'JWT_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
  }
}

export default env; 