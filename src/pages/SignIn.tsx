import AuthFormWrapper from "@/components/auth/AuthFormWrapper";
import { SEO } from "@/components/common/SEO";

const SignInPage = () => {
  return (
    <>
      <SEO 
        title="Sign In - The Sports Chronicle"
        description="Sign in to your Sports Chronicle account to access exclusive content, comment on articles, and personalize your sports news experience."
        canonicalUrl="https://thesportschronicle.com/signin"
        schemaType="WebPage"
      />
      <AuthFormWrapper
        view="sign_in"
        titleKey="auth.signInTitle"
        subtitleKey="auth.signInSubtitle"
        descriptionKey="auth.signInDescription"
        linkPromptKey="auth.noAccount"
        linkTextKey="auth.signUp"
        linkPath="/signup"
      />
    </>
  );
};

export default SignInPage;
