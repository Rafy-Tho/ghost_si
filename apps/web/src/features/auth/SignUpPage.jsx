import { SignUp } from "@clerk/react";
import { AuthLayout } from "./auth-layout.jsx";
import { authRoutes } from "./clerk-config.js";

export function SignUpPage() {
  return (
    <AuthLayout
      description="Create a workspace where your team can explore architecture together and preserve the decisions behind it."
      title="Create your workspace"
    >
      <SignUp
        fallbackRedirectUrl={authRoutes.signUpFallback}
        path={authRoutes.signUp}
        routing="path"
        signInUrl={authRoutes.signIn}
      />
    </AuthLayout>
  );
}
