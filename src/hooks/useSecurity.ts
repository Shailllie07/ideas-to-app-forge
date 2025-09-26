import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SecurityConfig {
  maxInactiveTime: number; // in milliseconds
  sessionCheckInterval: number; // in milliseconds
  maxFailedAttempts: number;
}

const defaultConfig: SecurityConfig = {
  maxInactiveTime: 24 * 60 * 60 * 1000, // 24 hours
  sessionCheckInterval: 5 * 60 * 1000, // 5 minutes
  maxFailedAttempts: 5
};

export const useSecurity = (config: Partial<SecurityConfig> = {}) => {
  const { user, signOut } = useAuthContext();
  const securityConfig = { ...defaultConfig, ...config };

  const updateLastActivity = useCallback(() => {
    if (user) {
      localStorage.setItem('lastActivity', Date.now().toString());
      localStorage.setItem(`lastActivity_${user.id}`, Date.now().toString());
    }
  }, [user]);

  const checkInactivity = useCallback(async () => {
    if (!user) return;

    const lastActivity = localStorage.getItem(`lastActivity_${user.id}`);
    if (lastActivity) {
      const timeDiff = Date.now() - parseInt(lastActivity);
      
      if (timeDiff > securityConfig.maxInactiveTime) {
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity.",
          variant: "destructive",
        });
        await signOut();
        return false;
      }
    }
    return true;
  }, [user, securityConfig.maxInactiveTime, signOut]);

  const validateSession = useCallback(async () => {
    if (!user) return false;

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.warn('Invalid session detected:', error);
        await signOut();
        return false;
      }

      // Check token expiry
      const now = Math.round(Date.now() / 1000);
      const tokenExpiry = session.expires_at;
      
      if (tokenExpiry && now >= tokenExpiry) {
        console.warn('Token expired');
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue.",
        });
        await signOut();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      await signOut();
      return false;
    }
  }, [user, signOut]);

  const detectSuspiciousActivity = useCallback(() => {
    if (!user) return;

    // Check for multiple rapid login attempts
    const attemptKey = `login_attempts_${user.id}`;
    const attempts = JSON.parse(localStorage.getItem(attemptKey) || '[]');
    const recentAttempts = attempts.filter((timestamp: number) => 
      Date.now() - timestamp < 15 * 60 * 1000 // 15 minutes
    );

    if (recentAttempts.length > securityConfig.maxFailedAttempts) {
      toast({
        title: "Security Alert",
        description: "Suspicious activity detected. Please verify your identity.",
        variant: "destructive",
      });
      // Could trigger additional security measures here
    }
  }, [user, securityConfig.maxFailedAttempts]);

  const logSecurityEvent = useCallback(async (eventType: string, details: any = {}) => {
    if (!user) return;

    // Log security events to console for development
    // In production, this would be sent to a logging service
    console.log('Security Event:', {
      userId: user.id,
      eventType,
      details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }, [user]);

  // Set up security monitoring
  useEffect(() => {
    if (!user) return;

    // Update activity on mount
    updateLastActivity();

    // Set up activity tracking
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateLastActivity, true);
    });

    // Set up periodic security checks
    const securityInterval = setInterval(async () => {
      const isActive = await checkInactivity();
      if (isActive) {
        await validateSession();
        detectSuspiciousActivity();
      }
    }, securityConfig.sessionCheckInterval);

    // Log session start
    logSecurityEvent('session_start', {
      timestamp: new Date().toISOString()
    });

    return () => {
      // Cleanup
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateLastActivity, true);
      });
      clearInterval(securityInterval);
      
      // Log session end
      logSecurityEvent('session_end', {
        timestamp: new Date().toISOString()
      });
    };
  }, [user, updateLastActivity, checkInactivity, validateSession, detectSuspiciousActivity, logSecurityEvent, securityConfig.sessionCheckInterval]);

  // Handle page visibility changes for security
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateLastActivity();
        validateSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [updateLastActivity, validateSession]);

  return {
    updateLastActivity,
    checkInactivity,
    validateSession,
    logSecurityEvent
  };
};