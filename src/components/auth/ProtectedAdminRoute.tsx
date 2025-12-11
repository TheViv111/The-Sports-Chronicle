import { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/contexts/TranslationContext';

const ALLOWED_EMAILS = [
  'vivaan.handa@pathwaysschool.in',
  'shouryag258@gmail.com',
  'ved.mehta@pathwaysschool.in',
  'shaurya.gupta@pathwaysschool.in'
];

export const ProtectedAdminRoute = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          setIsAuthorized(false);
          setIsLoading(false);
          return;
        }

        const userEmail = session.user?.email?.toLowerCase();
        if (!userEmail || !ALLOWED_EMAILS.includes(userEmail)) {
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <Outlet />;
};
