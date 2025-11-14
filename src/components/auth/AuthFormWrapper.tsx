import React from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/contexts/TranslationContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";
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
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="The Sports Chronicle" className="h-12 w-12 rounded-full shadow-sm mb-3" />
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
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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