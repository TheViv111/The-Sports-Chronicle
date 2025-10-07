import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/contexts/TranslationContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";

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

  const localizationVariables = {
    sign_in: {
      email_label: t("auth.email"),
      password_label: t("auth.password"),
      email_input_placeholder: t("contact.yourEmail"),
      password_input_placeholder: t("auth.password"),
      button_label: t("auth.signIn"),
      link_text: "", // Handled externally
    },
    sign_up: {
      email_label: t("auth.email"),
      password_label: t("auth.password"),
      email_input_placeholder: t("contact.yourEmail"),
      password_input_placeholder: t("auth.password"),
      button_label: t("auth.signUp"),
      link_text: "", // Handled externally
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold mb-2">
            {t(titleKey)}
          </h1>
          <p className="text-muted-foreground">
            {t(subtitleKey)}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{t(titleKey)}</CardTitle>
            <CardDescription className="text-center">
              {t(descriptionKey)}
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
              view={view}
              localization={{
                variables: localizationVariables,
              }}
            />
            {linkPath && linkTextKey && linkPromptKey && (
              <div className="mt-4 text-center text-sm">
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