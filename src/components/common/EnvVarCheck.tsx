import React from 'react';
import { AlertTriangle, Server, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnvVarCheckProps {
  children: React.ReactNode;
}

const EnvVarCheck: React.FC<EnvVarCheckProps> = ({ children }) => {
  // Check if Supabase URL is either missing or the placeholder
  const isSupabaseConfigured = 
    import.meta.env.VITE_SUPABASE_URL && 
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    !import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

  // Only show error in production to avoid local dev noise, 
  // or if we explicitly want to debug configuration
  const shouldShowError = !isSupabaseConfigured && import.meta.env.PROD;

  if (shouldShowError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full">
              <AlertTriangle className="w-12 h-12 text-amber-600 dark:text-amber-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">
            Configuration Error
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            The application is missing required Supabase environment variables. This typically happens when environment variables are not correctly set in your deployment platform (Vercel).
          </p>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 mb-8 text-left border border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Server className="w-4 h-4" />
              Required Variables:
            </h2>
            <ul className="space-y-2 font-mono text-xs">
              <li className="flex items-center justify-between">
                <span className="text-slate-500">VITE_SUPABASE_URL</span>
                <span className="text-rose-500 font-bold">MISSING</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-500">VITE_SUPABASE_ANON_KEY</span>
                <span className="text-rose-500 font-bold">MISSING</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              onClick={() => window.open('https://vercel.com/dashboard', '_blank')}
            >
              Open Vercel Dashboard
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="mt-8 text-[10px] text-slate-400 uppercase tracking-widest font-medium">
            The Sports Chronicle • System Check
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default EnvVarCheck;
