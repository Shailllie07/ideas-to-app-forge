import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSecurity } from '@/hooks/useSecurity';
import { Loading } from '@/components/ui/loading';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireProfile = false 
}) => {
  const { user, profile, loading } = useAuthContext();
  const { validateSession, updateLastActivity } = useSecurity();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const performSecurityCheck = async () => {
      if (!user) {
        setIsValidating(false);
        return;
      }

      try {
        // Update activity timestamp
        updateLastActivity();
        
        // Validate current session
        const isValid = await validateSession();
        setSessionValid(isValid);
        
        if (isValid) {
          // Additional security: Verify user still exists in database
          const { data: userData, error } = await supabase.auth.getUser();
          if (error || !userData.user) {
            console.warn('User verification failed:', error);
            setSessionValid(false);
          }
        }
      } catch (error) {
        console.error('Security check failed:', error);
        setSessionValid(false);
      } finally {
        // Small delay to prevent flash and ensure smooth transition
        timeoutId = setTimeout(() => {
          setIsValidating(false);
        }, 150);
      }
    };

    if (!loading) {
      performSecurityCheck();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [user, loading, validateSession, updateLastActivity]);

  // Show loading with consistent layout structure to prevent blinking
  if (loading || isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <Loading size="lg" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground animate-pulse">
                Securing your session...
              </p>
              <div className="flex items-center justify-center mt-2 space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced security checks
  if (!user || !sessionValid) {
    // Clear any cached auth data before redirect for security
    localStorage.removeItem('lastActivity');
    localStorage.removeItem(`lastActivity_${user?.id || 'unknown'}`);
    
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireProfile && !profile) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;