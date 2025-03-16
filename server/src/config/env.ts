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

/**
 * Environment configuration for the application
 */
interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  CORS_ORIGIN: string;
  DEEPSEEK_API_KEY: string;
  DEEPSEEK_API_URL: string;
  DEEPSEEK_MODEL: string;
  hasDeepSeekApiKey: () => boolean;
}

/**
 * Environment configuration with default values
 */
export const env: EnvConfig = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || '',
  DEEPSEEK_API_URL: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
  DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
  
  /**
   * Check if the DeepSeek API key is configured
   */
  hasDeepSeekApiKey: function(): boolean {
    return !!this.DEEPSEEK_API_KEY;
  }
};

// Validate required environment variables in production
if (env.NODE_ENV === 'production') {
  const requiredEnvVars = ['DEEPSEEK_API_KEY'];
  const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
  }
}

export default env; 