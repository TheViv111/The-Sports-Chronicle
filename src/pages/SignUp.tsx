import AuthFormWrapper from "@/components/auth/AuthFormWrapper";
import { SEO } from "@/components/common/SEO";

const SignUpPage = () => {
  return (
    <>
      <SEO 
        title="Sign Up - The Sports Chronicle"
        description="Join The Sports Chronicle community! Create your free account to access exclusive sports content, comment on articles, and stay updated with the latest sports news."
        canonicalUrl="https://thesportschronicle.com/signup"
        schemaType="WebPage"
      />
      <AuthFormWrapper
        view="sign_up"
        titleKey="auth.signUpTitle"
        subtitleKey="auth.signUpSubtitle"
        descriptionKey="auth.signUpDescription"
        linkPromptKey="auth.hasAccount"
        linkTextKey="auth.signIn"
        linkPath="/signin"
      />
    </>
  );
};

export default SignUpPage;
