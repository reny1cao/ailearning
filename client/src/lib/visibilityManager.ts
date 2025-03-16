/**
 * Global Visibility Manager
 * 
 * This singleton handles all visibility change events across the application
 * to prevent race conditions and multiple refreshes.
 */

type VisibilityHandler = (isVisible: boolean) => void;

class VisibilityManager {
  private handlers: Map<string, VisibilityHandler> = new Map();
  private lastVisible: boolean = true;
  private debounceTimers: Map<string, number> = new Map();
  private isInitialized: boolean = false;
  private lastVisibilityChange: number = Date.now();

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized || typeof document === 'undefined') return;
    
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.isInitialized = true;
    console.log('VisibilityManager initialized');
  }

  private handleVisibilityChange = () => {
    const isVisible = document.visibilityState === 'visible';
    const now = Date.now();
    
    // Ignore rapid visibility changes (debounce them)
    if (now - this.lastVisibilityChange < 300) {
      console.log('Ignoring rapid visibility change');
      return;
    }
    
    this.lastVisibilityChange = now;
    
    // Only trigger handlers if visibility actually changed
    if (this.lastVisible !== isVisible) {
      this.lastVisible = isVisible;
      console.log(`Visibility changed to: ${isVisible ? 'visible' : 'hidden'}`);
      
      // Execute all handlers
      this.handlers.forEach((handler, id) => {
        // Clear any existing debounce timer for this handler
        if (this.debounceTimers.has(id)) {
          window.clearTimeout(this.debounceTimers.get(id));
        }
        
        // Add delay for visibility:true events to prevent race conditions
        if (isVisible) {
          const delay = Math.random() * 300 + 100; // Stagger handlers between 100-400ms
          this.debounceTimers.set(id, window.setTimeout(() => {
            handler(isVisible);
            this.debounceTimers.delete(id);
          }, delay));
        } else {
          // Execute immediately for visibility:false events
          handler(isVisible);
        }
      });
    }
  }

  /**
   * Register a handler for visibility changes
   * @param id Unique identifier for this handler
   * @param handler Function to call when visibility changes
   * @returns Function to unregister the handler
   */
  public register(id: string, handler: VisibilityHandler): () => void {
    if (!this.isInitialized) {
      this.initialize();
    }
    
    this.handlers.set(id, handler);
    console.log(`Registered visibility handler: ${id}`);
    
    return () => {
      this.handlers.delete(id);
      if (this.debounceTimers.has(id)) {
        window.clearTimeout(this.debounceTimers.get(id));
        this.debounceTimers.delete(id);
      }
      console.log(`Unregistered visibility handler: ${id}`);
    };
  }

  /**
   * Check if the page is currently visible
   */
  public isVisible(): boolean {
    if (typeof document === 'undefined') return true;
    return document.visibilityState === 'visible';
  }

  /**
   * Clean up all handlers and listeners
   */
  public cleanup() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.handlers.clear();
    
    // Clear all debounce timers
    this.debounceTimers.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    this.debounceTimers.clear();
    
    this.isInitialized = false;
    console.log('VisibilityManager cleaned up');
  }
}

// Export singleton instance
export const visibilityManager = new VisibilityManager(); 