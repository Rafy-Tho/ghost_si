import { useAuth } from "@clerk/react";
import { Navigate, Outlet } from "react-router-dom";

function AuthLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-base px-6 text-copy-muted">
      <p role="status">Loading workspace...</p>
    </main>
  );
}

export function ProtectedRoute() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <AuthLoading />;
  }

  if (!isSignedIn) {
    return <Navigate replace to="/sign-in" />;
  }

  return <Outlet />;
}

export function HomeRedirect() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <AuthLoading />;
  }

  return <Navigate replace to={isSignedIn ? "/editor" : "/sign-in"} />;
}
