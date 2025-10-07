import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/contexts/TranslationContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const SignUpPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">
            {t("auth.signUpTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("auth.signUpSubtitle")}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t("auth.signUp")}</CardTitle>
            <CardDescription className="text-center">
              {t("auth.signUpDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              providers={['google']}
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
                      buttonBorderRadius: 'var(--radius)',
                      inputBorderRadius: 'var(--radius)',
                    },
                  },
                },
              }}
              theme="light"
              redirectTo={window.location.origin}
              view="sign_up" // Force sign-up view
              localization={{
                variables: {
                  sign_up: {
                    email_label: t("auth.email"),
                    password_label: t("auth.password"),
                    email_input_placeholder: t("contact.yourEmail"),
                    password_input_placeholder: t("auth.password"),
                    button_label: t("auth.signUp"),
                    social_provider_text: t("auth.signUpWithGoogle"),
                    link_text: t("auth.hasAccount"),
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

export default SignUpPage;