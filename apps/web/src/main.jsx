import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { App } from "./app/App.jsx";
import { queryClient } from "./app/query-client.js";
import {
  clerkAppearance,
  publishableKey,
} from "./features/auth/clerk-config.js";
import "./styles/globals.css";

if (!publishableKey) {
  throw new Error(
    "VITE_CLERK_PUBLISHABLE_KEY is required to start the web app",
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider
      appearance={clerkAppearance}
      afterSignOutUrl="/"
      publishableKey={publishableKey}
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
);
