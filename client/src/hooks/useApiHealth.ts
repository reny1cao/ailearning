import { useState, useEffect, useCallback, useRef } from 'react';
import teacherApi from '../api/teacherApi';
import logger from '../lib/logger';

/**
 * Possible health check statuses
 */
export type HealthStatus = 'checking' | 'available' | 'unavailable' | 'partial' | 'error';

/**
 * Hook for monitoring API health with advanced retry logic
 */
export function useApiHealth(
  checkIntervalMs: number = 30000,
  maxRetries: number = 2,
  retryDelayMs: number = 1500
) {
  // State for tracking API health status
  const [status, setStatus] = useState<HealthStatus>('checking');
  
  // Refs for tracking retries and intervals
  const retryCountRef = useRef(0);
  const checkIntervalRef = useRef<number | null>(null);
  const retryTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const lastSuccessfulCheckRef = useRef<number | null>(null);
  
  /**
   * Perform health check with retries
   */
  const checkHealth = useCallback(async (): Promise<HealthStatus> => {
    // Reset retry counter when explicitly requested
    retryCountRef.current = 0;
    
    // Clear any existing retry timeout
    if (retryTimeoutRef.current !== null) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    return attemptCheck();
  }, []);
  
  /**
   * Single attempt of health check with retry logic
   */
  const attemptCheck = useCallback(async (): Promise<HealthStatus> => {
    if (!isMountedRef.current) return 'error';
    
    setStatus('checking');
    logger.debug('Checking API health', { 
      attempt: retryCountRef.current + 1,
      maxRetries 
    });
    
    try {
      const healthData = await teacherApi.checkHealth();
      
      // If the component has unmounted during the request, don't update
      if (!isMountedRef.current) return 'error';
      
      if (!healthData) {
        logger.warn('Health check returned no data');
        return handleCheckFailure('API health check returned no data');
      }
      
      // Successful check
      lastSuccessfulCheckRef.current = Date.now();
      
      // Determine the API status based on response
      let newStatus: HealthStatus;
      
      if (healthData.status === 'ok') {
        if (healthData.deepSeekConfigured) {
          newStatus = 'available';
          logger.info('API is fully available');
        } else {
          newStatus = 'partial';
          logger.info('API is available but with limited functionality (DeepSeek not configured)');
        }
      } else {
        newStatus = 'partial';
        logger.warn('API reported unhealthy status', { status: healthData.status });
      }
      
      setStatus(newStatus);
      return newStatus;
    } catch (error) {
      // If the component has unmounted during the request, don't update
      if (!isMountedRef.current) return 'error';
      
      return handleCheckFailure(`Health check failed: ${(error as Error).message}`);
    }
  }, [maxRetries]);
  
  /**
   * Handle health check failure with retry logic
   */
  const handleCheckFailure = useCallback((errorMsg: string): HealthStatus => {
    if (retryCountRef.current < maxRetries) {
      // Increment retry counter
      retryCountRef.current++;
      
      logger.warn(`API health check failed, retrying (${retryCountRef.current}/${maxRetries})`, { 
        error: errorMsg 
      });
      
      // Schedule retry with exponential backoff
      const backoffDelay = retryDelayMs * Math.pow(2, retryCountRef.current - 1);
      
      retryTimeoutRef.current = window.setTimeout(() => {
        // Only retry if still mounted
        if (isMountedRef.current) {
          attemptCheck();
        }
      }, backoffDelay);
      
      // During retry, maintain previous status or set to checking
      if (status !== 'checking') {
        setStatus('checking');
      }
      
      return 'checking';
    }
    
    // Check if we had a successful check recently (within 2 minutes)
    const hasRecentSuccess = lastSuccessfulCheckRef.current && 
      (Date.now() - lastSuccessfulCheckRef.current < 2 * 60 * 1000);
    
    // All retries exhausted
    const newStatus = hasRecentSuccess ? 'partial' : 'unavailable';
    
    logger.error('API health check failed after retries', { 
      error: errorMsg,
      attempts: retryCountRef.current + 1,
      newStatus
    });
    
    setStatus(newStatus);
    return newStatus;
  }, [maxRetries, retryDelayMs, status]);
  
  /**
   * Start periodically monitoring API health
   */
  const startMonitoring = useCallback(() => {
    // Initial health check
    checkHealth();
    
    // Set up interval for periodic checks
    checkIntervalRef.current = window.setInterval(() => {
      checkHealth();
    }, checkIntervalMs);
    
    logger.info('Started API health monitoring', { 
      checkIntervalMs 
    });
    
    // Cleanup function that stops monitoring
    return () => {
      isMountedRef.current = false;
      
      if (checkIntervalRef.current !== null) {
        window.clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
      
      if (retryTimeoutRef.current !== null) {
        window.clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      logger.debug('Stopped API health monitoring');
    };
  }, [checkHealth, checkIntervalMs]);
  
  /**
   * Determine if the API is available for use
   */
  const isAvailable = status === 'available' || status === 'partial';
  
  // Automatically perform health check when parameters change
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  return {
    status,
    checkHealth,
    startMonitoring,
    isAvailable,
  };
}

export default useApiHealth; 