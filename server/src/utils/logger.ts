import winston from 'winston';
import { env } from '../config/env';

// Define log levels and colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Determine log level based on environment
const level = () => {
  return env.NODE_ENV === 'development' ? 'debug' : 'info';
};

// Add colors to Winston
winston.addColors(colors);

// Create format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] ${info.level}: ${info.message}${info.data ? ` - ${JSON.stringify(info.data)}` : ''}`
  )
);

// Create format for JSON output (for production)
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format: env.NODE_ENV === 'development' ? consoleFormat : jsonFormat,
  transports: [
    // Console transport
    new winston.transports.Console(),
    
    // File transports
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
  // Don't exit on uncaught errors
  exitOnError: false,
});

// Helper function to add request context to logs
export function contextLogger(context: Record<string, any> = {}) {
  return {
    error: (message: string, data: any = {}) => {
      logger.error(message, { ...context, data });
    },
    warn: (message: string, data: any = {}) => {
      logger.warn(message, { ...context, data });
    },
    info: (message: string, data: any = {}) => {
      logger.info(message, { ...context, data });
    },
    http: (message: string, data: any = {}) => {
      logger.http(message, { ...context, data });
    },
    debug: (message: string, data: any = {}) => {
      logger.debug(message, { ...context, data });
    },
  };
}

// Stream for Morgan HTTP logger
export const httpLogStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

export default logger; 