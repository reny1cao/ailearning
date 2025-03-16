import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { AUTH_CONFIG } from './authConfig';

export const ADMIN_ROLE = 'admin';

interface AdminSession {
  lastActivity: number;
  loginAttempts: number;
  lockedUntil?: number;
}

const adminSessions = new Map<string, AdminSession>();

export async function checkAdminAccess(user: User | null): Promise<boolean> {
  if (!user) return false;

  try {
    // Check if user has admin role using the database function
    const { data, error } = await supabase
      .rpc('is_admin', { user_id: user.id });

    if (error) throw error;
    
    if (!data) return false;

    // Update session tracking
    const now = Date.now();
    const session = adminSessions.get(user.id) || {
      lastActivity: now,
      loginAttempts: 0
    };

    // Check for session timeout
    if (now - session.lastActivity > AUTH_CONFIG.SESSION.adminTimeoutMinutes * 60 * 1000) {
      adminSessions.delete(user.id);
      return false;
    }

    // Check for account lockout
    if (session.lockedUntil && now < session.lockedUntil) {
      throw new Error('Account temporarily locked. Please try again later.');
    }

    // Update session
    session.lastActivity = now;
    adminSessions.set(user.id, session);

    return data;
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

export async function logAdminAction(userId: string, action: string, details: any) {
  try {
    const { error } = await supabase
      .from('admin_audit_log')
      .insert({
        user_id: userId,
        action,
        details,
        ip_address: window.location.hostname
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging admin action:', error);
  }
}

export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_role', { user_id: userId });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}