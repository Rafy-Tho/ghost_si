import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/react";
import { App } from "./app/App.jsx";
import { clerkAppearance, publishableKey } from "./features/auth/clerk-config.js";
import "./styles/globals.css";

if (!publishableKey) {
  throw new Error("VITE_CLERK_PUBLISHABLE_KEY is required to start the web app");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider
      appearance={clerkAppearance}
      afterSignOutUrl="/"
      publishableKey={publishableKey}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
);
