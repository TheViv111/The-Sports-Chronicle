import AuthFormWrapper from "@/components/AuthFormWrapper";

const SignInPage = () => {
  return (
    <AuthFormWrapper
      view="sign_in"
      titleKey="auth.signInTitle"
      subtitleKey="auth.signInSubtitle"
      descriptionKey="auth.signInDescription"
      linkPromptKey="auth.noAccount"
      linkTextKey="auth.signUp"
      linkPath="/signup"
    />
  );
};

export default SignInPage;