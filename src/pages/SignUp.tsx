import AuthFormWrapper from "@/components/AuthFormWrapper";

const SignUpPage = () => {
  return (
    <AuthFormWrapper
      view="sign_up"
      titleKey="auth.signUpTitle"
      subtitleKey="auth.signUpSubtitle"
      descriptionKey="auth.signUpDescription"
      linkPromptKey="auth.hasAccount"
      linkTextKey="auth.signIn"
      linkPath="/signin"
    />
  );
};

export default SignUpPage;