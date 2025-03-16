/**
 * Client-side logging utility
 * Provides structured logging with different levels
 * and the ability to send critical logs to the server
 */

// Log levels
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// Logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  sendToServer: boolean;
  serverEndpoint?: string;
  applicationId: string;
}

// Default configuration
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN,
  sendToServer: import.meta.env.PROD,
  serverEndpoint: '/api/logs',
  applicationId: 'ai-learning-client',
};

// Current logger configuration
let config: LoggerConfig = { ...DEFAULT_CONFIG };

// Queue of logs to send to server
const logQueue: Array<{ level: LogLevel; message: string; data?: any; timestamp: string }> = [];
let queueTimer: number | null = null;

/**
 * Configure the logger
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Get log level as string
 */
function getLevelName(level: LogLevel): string {
  switch (level) {
    case LogLevel.ERROR: return 'ERROR';
    case LogLevel.WARN: return 'WARN';
    case LogLevel.INFO: return 'INFO';
    case LogLevel.DEBUG: return 'DEBUG';
    default: return 'UNKNOWN';
  }
}

/**
 * Get console method for log level
 */
function getConsoleMethod(level: LogLevel): keyof Console {
  switch (level) {
    case LogLevel.ERROR: return 'error';
    case LogLevel.WARN: return 'warn';
    case LogLevel.INFO: return 'info';
    case LogLevel.DEBUG: return 'debug';
    default: return 'log';
  }
}

/**
 * Format log message with timestamp and level
 */
function formatLogForConsole(level: LogLevel, message: string, data?: any): string {
  return `[${new Date().toISOString()}] [${getLevelName(level)}] ${message}`;
}

/**
 * Log message to console
 */
function logToConsole(level: LogLevel, message: string, data?: any): void {
  if (level > config.minLevel) return;
  
  const formattedMessage = formatLogForConsole(level, message, data);
  const method = getConsoleMethod(level);
  
  if (data) {
    // @ts-ignore - method dynamic access
    console[method](formattedMessage, data);
  } else {
    // @ts-ignore - method dynamic access
    console[method](formattedMessage);
  }
}

/**
 * Add log to server queue
 */
function addToServerQueue(level: LogLevel, message: string, data?: any): void {
  if (!config.sendToServer || level > LogLevel.WARN) return;
  
  // Don't log sensitive data to server
  const safeData = data ? sanitizeDataForServer(data) : undefined;
  
  logQueue.push({
    level,
    message,
    data: safeData,
    timestamp: new Date().toISOString(),
  });
  
  // Start queue processing if not already started
  if (logQueue.length === 1 && !queueTimer) {
    queueTimer = window.setTimeout(sendLogsToServer, 5000);
  }
}

/**
 * Remove sensitive information from data
 */
function sanitizeDataForServer(data: any): any {
  if (!data) return data;
  
  // Create a shallow copy
  const result = { ...data };
  
  // List of sensitive keys to redact
  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization'];
  
  // Recursively sanitize objects
  Object.keys(result).forEach(key => {
    const lowerKey = key.toLowerCase();
    
    // Check if key contains sensitive information
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      result[key] = '[REDACTED]';
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = sanitizeDataForServer(result[key]);
    }
  });
  
  return result;
}

/**
 * Send collected logs to server
 */
async function sendLogsToServer(): Promise<void> {
  if (!config.sendToServer || !config.serverEndpoint || logQueue.length === 0) {
    queueTimer = null;
    return;
  }
  
  const logs = [...logQueue];
  logQueue.length = 0;
  
  try {
    await fetch(config.serverEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        logs,
        applicationId: config.applicationId,
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
      // Don't wait for response if page is unloading
      keepalive: true,
    });
  } catch (error) {
    // Don't use logger here to avoid infinite loop
    console.error('Failed to send logs to server:', error);
    
    // Re-add critical logs to the queue
    logs
      .filter(log => log.level <= LogLevel.ERROR)
      .forEach(log => logQueue.push(log));
  }
  
  // Schedule next send if there are still logs
  if (logQueue.length > 0) {
    queueTimer = window.setTimeout(sendLogsToServer, 5000);
  } else {
    queueTimer = null;
  }
}

/**
 * Main logger object
 */
const logger = {
  /**
   * Log error message
   */
  error(message: string, data?: any): void {
    logToConsole(LogLevel.ERROR, message, data);
    addToServerQueue(LogLevel.ERROR, message, data);
    
    // Capture errors in monitoring tools if available
    if (window.ErrorCapture) {
      window.ErrorCapture.captureError(message, data);
    }
  },
  
  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    logToConsole(LogLevel.WARN, message, data);
    addToServerQueue(LogLevel.WARN, message, data);
  },
  
  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    logToConsole(LogLevel.INFO, message, data);
    addToServerQueue(LogLevel.INFO, message, data);
  },
  
  /**
   * Log debug message
   */
  debug(message: string, data?: any): void {
    logToConsole(LogLevel.DEBUG, message, data);
    // Debug logs are not sent to server
  },
  
  /**
   * Log API request
   */
  logApiRequest(endpoint: string, method: string, data?: any): void {
    logger.debug(`API Request: ${method} ${endpoint}`, { data });
  },
  
  /**
   * Log API response
   */
  logApiResponse(endpoint: string, method: string, status: number, data?: any): void {
    if (status >= 400) {
      logger.warn(`API Response: ${method} ${endpoint} - ${status}`, { 
        status, 
        data,
        timestamp: new Date().toISOString(),
      });
    } else {
      logger.debug(`API Response: ${method} ${endpoint} - ${status}`, { status, data });
    }
  },
  
  /**
   * Log API error
   */
  logApiError(endpoint: string, method: string, error: any): void {
    logger.error(`API Error: ${method} ${endpoint}`, { 
      error: error.message || error,
      stack: error.stack,
      data: error.response?.data,
      status: error.response?.status,
    });
  },
  
  /**
   * Flush logs to server immediately
   */
  flush(): Promise<void> {
    if (queueTimer) {
      window.clearTimeout(queueTimer);
      queueTimer = null;
    }
    return sendLogsToServer();
  },
};

// Register window unload handler to attempt to send logs
window.addEventListener('beforeunload', () => {
  if (logQueue.length > 0 && config.sendToServer) {
    // Use sendBeacon if available for more reliable delivery
    if (navigator.sendBeacon && config.serverEndpoint) {
      const data = JSON.stringify({
        logs: logQueue,
        applicationId: config.applicationId,
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
      
      navigator.sendBeacon(config.serverEndpoint, data);
      logQueue.length = 0;
    } else {
      // Fallback to fetch with keepalive
      sendLogsToServer();
    }
  }
});

// Declaration merging for window object
declare global {
  interface Window {
    ErrorCapture?: {
      captureError: (message: string, data?: any) => void;
    };
  }
}

export default logger; 