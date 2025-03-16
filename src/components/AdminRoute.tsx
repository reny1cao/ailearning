import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useQuery } from '@tanstack/react-query';
import { checkAdminAccess, logAdminAction } from '../lib/adminAuth';
import { AUTH_CONFIG } from '../lib/authConfig';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  const { data: isAdmin, isLoading, error } = useQuery({
    queryKey: ['adminAccess', user?.id],
    queryFn: () => checkAdminAccess(user),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false
  });

  useEffect(() => {
    if (user && isAdmin) {
      logAdminAction(user.id, 'page_access', {
        path: location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }, [user, isAdmin, location.pathname]);

  // Session timeout check
  useEffect(() => {
    if (!user || !isAdmin) return;

    const checkSession = () => {
      const lastActivity = localStorage.getItem('lastAdminActivity');
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceActivity > AUTH_CONFIG.SESSION.adminTimeoutMinutes * 60 * 1000) {
          localStorage.removeItem('lastAdminActivity');
          window.location.href = '/auth';
        }
      }
    };

    const timer = setInterval(checkSession, 60000);
    return () => clearInterval(timer);
  }, [user, isAdmin]);

  // Update last activity timestamp
  useEffect(() => {
    if (user && isAdmin) {
      localStorage.setItem('lastAdminActivity', Date.now().toString());
    }
  }, [user, isAdmin]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return <Navigate to="/auth" state={{ 
      from: location,
      error: error instanceof Error ? error.message : 'Authentication error'
    }} replace />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default AdminRoute;