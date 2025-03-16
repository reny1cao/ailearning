import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with automatic retries and better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'llm-course-platform'
    }
  },
  db: {
    schema: 'public'
  }
});

// Retry configuration
const RETRY_DELAYS = [1000, 2000, 4000]; // Retry delays in milliseconds
const MAX_RETRIES = 3;

// Helper function to retry failed requests
export async function retryableQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  retries = MAX_RETRIES
): Promise<{ data: T | null; error: any }> {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await queryFn();
      if (!result.error) {
        return result;
      }

      // If it's not a network error, don't retry
      if (result.error.message !== 'Failed to fetch') {
        return result;
      }

      // Wait before retrying
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[i]));
      }
    } catch (error) {
      if (i === retries - 1) {
        return { data: null, error };
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[i]));
    }
  }
  return { data: null, error: new Error('Max retries reached') };
}

// Add request interceptor for better error handling
const originalFetch = supabase.rest.headers['headers']?.fetch || window.fetch;
supabase.rest.headers['headers'] = {
  ...supabase.rest.headers['headers'],
  fetch: async (...args) => {
    try {
      const response = await originalFetch(...args);
      if (!response.ok) {
        // Only log non-404 errors to avoid noise from health checks
        if (response.status !== 404) {
          console.warn('Supabase request failed:', {
            status: response.status,
            statusText: response.statusText,
            url: args[0]
          });
        }
      }
      return response;
    } catch (error) {
      console.warn('Supabase network error:', error);
      throw error;
    }
  }
};

// Connection status monitoring
let isConnected = true;
let connectionCheckInterval: number;

export function startConnectionMonitoring() {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }

  connectionCheckInterval = window.setInterval(async () => {
    try {
      // Use a simple query to check connection status
      const { error } = await supabase
        .from('courses')
        .select('count')
        .limit(1)
        .single();

      const newConnectionStatus = !error;
      
      if (newConnectionStatus !== isConnected) {
        isConnected = newConnectionStatus;
        window.dispatchEvent(new CustomEvent('supabase-connection-change', {
          detail: { connected: isConnected }
        }));
      }
    } catch (error) {
      if (isConnected) {
        isConnected = false;
        window.dispatchEvent(new CustomEvent('supabase-connection-change', {
          detail: { connected: false }
        }));
      }
    }
  }, 30000); // Check every 30 seconds
}

export function stopConnectionMonitoring() {
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
  }
}

// Initialize connection monitoring
startConnectionMonitoring();