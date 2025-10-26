import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingScreen from '../common/LoadingScreen'; // Updated import path

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Keep isLoading to track actual loading
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setIsLoading(false); // Set isLoading to false once session state is determined

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
      setIsLoading(false); // Set isLoading to false once initial session is fetched
      if (initialSession && (location.pathname === '/signin' || location.pathname === '/signup')) {
        navigate('/');
      } else if (!initialSession && location.pathname === '/profile') {
        navigate('/signin');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (isLoading) { // Only show loading screen when isLoading is true
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