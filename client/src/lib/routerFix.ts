/**
 * Router Fix Utility
 * 
 * This utility helps prevent router-related issues when a page
 * regains visibility after being inactive.
 */

import { visibilityManager } from './visibilityManager';
import { History } from 'history';

/**
 * Apply fixes to prevent React Router from losing state or refreshing
 * when a page becomes visible again after being inactive.
 * 
 * @param history The history object from React Router
 */
export function applyRouterFixes(history: History): () => void {
  let lastLocation = history.location;
  
  // Store current location when navigation occurs
  const unlisten = history.listen(({ location }) => {
    lastLocation = location;
  });
  
  // Register with visibility manager
  const unregisterVisibility = visibilityManager.register(
    'router-history-fix', 
    (isVisible) => {
      if (isVisible) {
        // When page becomes visible again, ensure we're still at the correct location
        // This prevents "lost" navigation state which can cause refreshes
        const currentLocation = history.location;
        
        if (
          currentLocation.pathname !== lastLocation.pathname ||
          currentLocation.search !== lastLocation.search
        ) {
          console.log('Fixing router location after visibility change');
          
          // Push the correct location (using replace to avoid adding to history)
          history.replace(lastLocation);
        }
      }
    }
  );
  
  // Return cleanup function
  return () => {
    unlisten();
    unregisterVisibility();
  };
}

/**
 * Check if a URL change would cause a full page refresh
 * instead of a client-side navigation
 */
export function wouldCauseRefresh(currentUrl: string, newUrl: string): boolean {
  try {
    // Parse URLs to compare domains and origins
    const currentLocation = new URL(currentUrl, window.location.origin);
    const newLocation = new URL(newUrl, window.location.origin);
    
    // Different origins always cause a full refresh
    if (currentLocation.origin !== newLocation.origin) {
      return true;
    }
    
    // Same page anchors don't cause refreshes
    if (
      currentLocation.pathname === newLocation.pathname &&
      currentLocation.search === newLocation.search &&
      newLocation.hash
    ) {
      return false;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking URL refresh behavior:', error);
    return true;
  }
} 