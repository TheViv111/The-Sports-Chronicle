import React from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/contexts/TranslationContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import LogoLoader from "@/components/common/LogoLoader";
const logoSrc = "/android-chrome-192x192.png";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "@/components/auth/SessionContextProvider";

interface AuthFormWrapperProps {
  view: 'sign_in' | 'sign_up' | 'forgotten_password' | 'update_password';
  titleKey: string;
  subtitleKey: string;
  descriptionKey: string;
  linkTextKey?: string;
  linkPath?: string;
  linkPromptKey?: string;
}

const AuthFormWrapper: React.FC<AuthFormWrapperProps> = ({
  view,
  titleKey,
  subtitleKey,
  descriptionKey,
  linkTextKey,
  linkPath,
  linkPromptKey,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { session } = useSession();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);



  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="btn-hover-lift">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('nav.home')}
            </Button>
          </Link>
        </div>
        <div className="flex flex-col items-center mb-6">
          <img src={logoSrc} alt="The Sports Chronicle" className="h-12 w-12 rounded-full shadow-sm mb-3" loading="eager" decoding="async" fetchPriority="high" />
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            {t(titleKey)}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t(subtitleKey)}
          </p>
        </div>

        <Card className="border-border/60 shadow-xl bg-background/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-center">{t(titleKey)}</CardTitle>
            <CardDescription className="text-center">
              {t(descriptionKey)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {view === 'sign_in' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setLoading(true);
                    const { error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) throw error;
                    toast.success(t('auth.signedIn'));
                    navigate('/');
                  } catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    toast.error(message || t('auth.errorSignIn'));
                  } finally {
                    setLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && <LogoLoader size="xs" className="mr-2" />}
                    {t('auth.signIn')}
                  </Button>
                </div>
                <div className="relative py-1">
                  <Separator />
                  <p className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">{t('common.or')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" disabled={loading} className="w-full"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    {loading ? (
                      <LogoLoader size="xs" className="mr-2" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
                        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.9 0-12.5-5.6-12.5-12.5S17.1 11 24 11c3.2 0 6.2 1.2 8.5 3.5l5.7-5.7C34.6 5.1 29.5 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21c10.5 0 19.4-7.5 21-17.3 0.1-0.7 0-1.4 0-2.2z" />
                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C15.1 16.1 19.2 13 24 13c3.2 0 6.2 1.2 8.5 3.5l5.7-5.7C34.6 5.1 29.5 3 24 3 16.4 3 9.7 7.2 6.3 14.7z" />
                        <path fill="#4CAF50" d="M24 45c5.5 0 10.6-2.1 14.4-5.6l-6.6-5.4C29.5 35.7 26.9 36.7 24 36.7 19.8 36.7 16.2 34.3 14.4 31l-6.5 5C11.2 41.9 17.2 45 24 45z" />
                        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3.1 5.4-5.9 6.9l6.6 5.4C38.6 37.4 41.9 31.5 43.6 24c0.1-0.7 0-1.4 0-2.2z" />
                      </svg>
                    )}
                    {t('auth.signInWithGoogle')}
                  </Button>
                </div>
              </form>
            )}

            {view === 'sign_up' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setLoading(true);
                    const { error } = await supabase.auth.signUp({ email, password });
                    if (error) throw error;
                    toast.success(t('auth.checkInboxForConfirmation'));
                    navigate('/');
                  } catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    toast.error(message || t('auth.errorSignUp'));
                  } finally {
                    setLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && <LogoLoader size="xs" className="mr-2" />}
                    {t('auth.signUp')}
                  </Button>
                </div>
                <div className="relative py-1">
                  <Separator />
                  <p className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">{t('common.or')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" disabled={loading} className="w-full"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    {loading ? (
                      <LogoLoader size="xs" className="mr-2" />
                    ) : (
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
                        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.9 0-12.5-5.6-12.5-12.5S17.1 11 24 11c3.2 0 6.2 1.2 8.5 3.5l5.7-5.7C34.6 5.1 29.5 3 24 3 12.3 3 3 12.3 3 24s9.3 21 21 21c10.5 0 19.4-7.5 21-17.3 0.1-0.7 0-1.4 0-2.2z" />
                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C15.1 16.1 19.2 13 24 13c3.2 0 6.2 1.2 8.5 3.5l5.7-5.7C34.6 5.1 29.5 3 24 3 16.4 3 9.7 7.2 6.3 14.7z" />
                        <path fill="#4CAF50" d="M24 45c5.5 0 10.6-2.1 14.4-5.6l-6.6-5.4C29.5 35.7 26.9 36.7 24 36.7 19.8 36.7 16.2 34.3 14.4 31l-6.5 5C11.2 41.9 17.2 45 24 45z" />
                        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3.1 5.4-5.9 6.9l6.6 5.4C38.6 37.4 41.9 31.5 43.6 24c0.1-0.7 0-1.4 0-2.2z" />
                      </svg>
                    )}
                    {t('auth.signUpWithGoogle')}
                  </Button>
                </div>
              </form>
            )}

            {view === 'forgotten_password' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setLoading(true);
                    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
                    if (error) throw error;
                    toast.success(t('auth.sentResetInstructions'));
                    navigate('/');
                  } catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    toast.error(message || t('auth.errorForgotPassword'));
                  } finally {
                    setLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <LogoLoader size="xs" className="mr-2" />}
                  {t('auth.sendResetInstructions')}
                </Button>
              </form>
            )}

            {view === 'update_password' && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    if (!session) {
                      toast.error(t('auth.mustBeLoggedIn'));
                      return;
                    }
                    setLoading(true);
                    const { error } = await supabase.auth.updateUser({ password });
                    if (error) throw error;
                    toast.success(t('auth.passwordUpdated'));
                    navigate('/profile');
                  } catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    toast.error(message || t('auth.errorUpdatePassword'));
                  } finally {
                    setLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10" />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <LogoLoader size="xs" className="mr-2" />}
                  {t('auth.updatePassword')}
                </Button>
              </form>
            )}
            {linkPath && linkTextKey && linkPromptKey && (
              <div className="mt-2 text-center text-sm">
                {t(linkPromptKey)}{" "}
                <Link to={linkPath} className="font-medium text-primary hover:underline">
                  {t(linkTextKey)}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthFormWrapper;