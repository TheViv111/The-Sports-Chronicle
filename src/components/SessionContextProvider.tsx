import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen from './LoadingScreen'; // Import the new LoadingScreen

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [minLoadTimerActive, setMinLoadTimerActive] = useState(true); // State for minimum load time
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set a minimum loading time to prevent flickering
    const timer = setTimeout(() => {
      setMinLoadTimerActive(false);
    }, 1500); // 1.5 seconds minimum load time

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setIsLoading(false);

      if (currentSession) {
        // User is authenticated
        if (location.pathname === '/signin' || location.pathname === '/signup') {
          navigate('/'); // Redirect to home if on auth pages
        }
      } else {
        // User is not authenticated
        // Redirect from protected routes like /profile to /signin
        if (location.pathname === '/profile') {
          navigate('/signin');
        }
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setIsLoading(false);
      if (initialSession && (location.pathname === '/signin' || location.pathname === '/signup')) {
        navigate('/');
      } else if (!initialSession && location.pathname === '/profile') {
        navigate('/signin');
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (isLoading || minLoadTimerActive) {
    return <LoadingScreen message="Authenticating session..." />;
  }

  return (
    <SessionContext.Provider value={{ session, isLoading }}>
      {children}
    </SessionContext.Provider>
  )
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};