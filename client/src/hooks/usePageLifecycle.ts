import { useEffect, useRef } from 'react';
import { visibilityManager } from '../lib/visibilityManager';

/**
 * Hook to provide page lifecycle events and prevent unwanted refreshes
 * when a page becomes visible again.
 * 
 * @param options Configuration options
 * @returns Object with page lifecycle state and utilities
 */
export function usePageLifecycle(options: {
  pageId: string;
  preventRefresh?: boolean;
  onVisibilityChange?: (isVisible: boolean) => void;
}) {
  const { pageId, preventRefresh = true, onVisibilityChange } = options;
  const visibilityUnregisterRef = useRef<(() => void) | null>(null);
  const lastVisibleTimeRef = useRef<number>(Date.now());
  const hiddenTimeRef = useRef<number | null>(null);
  
  // Keep track of network conditions
  const networkStatusRef = useRef<'online' | 'offline'>(
    typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline'
  );
  
  useEffect(() => {
    // Handle beforeunload event to prevent refreshes
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Only prevent unload if document is visible and preventRefresh is true
      if (preventRefresh && document.visibilityState === 'visible') {
        // Check if this was triggered by a visibility change within 500ms
        if (hiddenTimeRef.current && Date.now() - hiddenTimeRef.current < 500) {
          // This is likely an unwanted refresh after regaining visibility
          event.preventDefault();
          // Use returnValue for older browsers
          event.returnValue = '';
          return '';
        }
      }
    };
    
    // Network status change handler
    const handleNetworkChange = () => {
      const isOnline = navigator.onLine;
      networkStatusRef.current = isOnline ? 'online' : 'offline';
      
      // If we're coming back online and the page is visible,
      // make sure we don't refresh unnecessarily
      if (isOnline && document.visibilityState === 'visible') {
        // Just log for now, but this is where we'd handle any network resumption
        console.log('Network connection restored, checking state...');
      }
    };
    
    // Register with visibility manager
    visibilityUnregisterRef.current = visibilityManager.register(
      `page-lifecycle-${pageId}`,
      (isVisible) => {
        if (!isVisible) {
          // Page is hidden
          hiddenTimeRef.current = Date.now();
        } else {
          // Page is visible again
          lastVisibleTimeRef.current = Date.now();
          hiddenTimeRef.current = null;
        }
        
        // Call user-provided callback if any
        if (onVisibilityChange) {
          onVisibilityChange(isVisible);
        }
      }
    );
    
    // Set up event listeners
    if (preventRefresh) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }
    
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    
    return () => {
      // Clean up all event listeners and registrations
      if (visibilityUnregisterRef.current) {
        visibilityUnregisterRef.current();
        visibilityUnregisterRef.current = null;
      }
      
      if (preventRefresh) {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
      
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, [pageId, preventRefresh, onVisibilityChange]);
  
  return {
    isVisible: visibilityManager.isVisible(),
    networkStatus: networkStatusRef.current,
    timeSinceLastVisible: () => Date.now() - lastVisibleTimeRef.current,
    hiddenTime: hiddenTimeRef.current ? Date.now() - hiddenTimeRef.current : null
  };
} 