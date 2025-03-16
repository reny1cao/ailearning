import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
  isSessionExpired: () => boolean;
  sessionExpiresAt: () => number | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  
  setUser: (user) => set({ user, loading: false }),
  
  setSession: (session) => {
    // If the session changes, also update the user
    if (session?.user) {
      set({ session, user: session.user, loading: false });
    } else {
      set({ session, loading: false });
    }
  },
  
  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Failed to refresh session:', error);
        return;
      }
      
      if (data.session) {
        set({ session: data.session, user: data.session.user, loading: false });
      } else {
        // If no session is returned, keep current session data
        // This prevents unnecessary logouts on network issues
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },
  
  isSessionExpired: () => {
    const { session } = get();
    if (!session) return true;
    
    // Check if session is expired
    const expiresAt = session.expires_at ? session.expires_at * 1000 : null; // convert to ms
    if (!expiresAt) return false;
    
    return Date.now() >= expiresAt;
  },
  
  sessionExpiresAt: () => {
    const { session } = get();
    if (!session || !session.expires_at) return null;
    return session.expires_at * 1000; // convert to ms
  }
}));