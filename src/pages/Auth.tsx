import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/contexts/TranslationContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const AuthPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">
            {t("auth.signInTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("auth.signInSubtitle")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t("auth.signIn")}</CardTitle>
            <CardDescription className="text-center">
              {t("auth.signInSubtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              providers={['google']} // Enable Google as an auth provider
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(var(--primary))',
                      brandAccent: 'hsl(var(--primary-foreground))',
                      inputBackground: 'hsl(var(--input))',
                      inputBorder: 'hsl(var(--border))',
                      inputBorderHover: 'hsl(var(--ring))',
                      inputBorderFocus: 'hsl(var(--ring))',
                      inputText: 'hsl(var(--foreground))',
                      defaultButtonBackground: 'hsl(var(--primary))',
                      defaultButtonBackgroundHover: 'hsl(var(--primary)/90%)',
                      defaultButtonBorder: 'hsl(var(--primary))',
                      defaultButtonText: 'hsl(var(--primary-foreground))',
                      anchorTextColor: 'hsl(var(--primary))',
                      anchorTextHoverColor: 'hsl(var(--primary)/90%)',
                    },
                    radii: {
                      borderRadiusButton: 'var(--radius)',
                      button: 'var(--radius)',
                      input: 'var(--radius)',
                    },
                  },
                },
              }}
              theme="light" // Use light theme, can be dynamic with useTheme
              redirectTo={window.location.origin} // Redirect to home after auth
              localization={{
                variables: {
                  sign_in: {
                    email_label: t("auth.email"),
                    password_label: t("auth.password"),
                    email_input_placeholder: t("contact.yourEmail"),
                    password_input_placeholder: t("auth.password"),
                    button_label: t("auth.signIn"),
                    social_auth_button_text: t("auth.signInWithGoogle"),
                    link_text: t("auth.hasAccount"),
                    forgotten_password_link_text: t("auth.forgotPassword"),
                    no_account_text: t("auth.noAccount"),
                    sign_up_link_text: t("nav.signUp"),
                  },
                  sign_up: {
                    email_label: t("auth.email"),
                    password_label: t("auth.password"),
                    email_input_placeholder: t("contact.yourEmail"),
                    password_input_placeholder: t("auth.password"),
                    button_label: t("auth.signUp"),
                    social_auth_button_text: t("auth.signUpWithGoogle"),
                    link_text: t("auth.noAccount"),
                    have_account_text: t("auth.hasAccount"),
                    sign_in_link_text: t("nav.signIn"),
                  },
                  forgotten_password: {
                    email_label: t("auth.email"),
                    email_input_placeholder: t("contact.yourEmail"),
                    button_label: t("auth.sendResetInstructions"),
                    link_text: t("auth.forgotPassword"),
                  },
                  update_password: {
                    password_label: t("auth.password"),
                    password_input_placeholder: t("auth.password"),
                    button_label: t("auth.updatePassword"),
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;