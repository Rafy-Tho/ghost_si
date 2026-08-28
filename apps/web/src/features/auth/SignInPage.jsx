import { SignIn } from "@clerk/react";
import { AuthLayout } from "./auth-layout.jsx";
import { authRoutes } from "./clerk-config.js";

export function SignInPage() {
  return (
    <AuthLayout
      description="A focused collaborative workspace for turning ambiguous requirements into clear, reviewable system architecture."
      title="Sign in"
    >
      <SignIn
        fallbackRedirectUrl={authRoutes.signInFallback}
        path={authRoutes.signIn}
        routing="path"
        signUpUrl={authRoutes.signUp}
      />
    </AuthLayout>
  );
}
