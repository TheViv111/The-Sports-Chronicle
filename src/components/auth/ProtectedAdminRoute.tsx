import { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import LoadingScreen from '@/components/common/LoadingScreen';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/TranslationContext';

export const ProtectedAdminRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        const userEmail = session.user?.email?.toLowerCase();
        if (!userEmail) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        // Check if user has admin role in the database
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_email', userEmail)
          .maybeSingle();

        if (roleError || !roleData || roleData.role !== 'admin') {
          console.warn('Unauthorized access attempt:', userEmail);
          toast.error(t('admin.unauthorized'));
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [t]);

  if (isLoading) {
    return <LoadingScreen message="Verifying access..." />;
  }

  if (!isAuthorized) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
