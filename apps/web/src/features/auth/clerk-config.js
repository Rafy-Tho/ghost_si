import { dark, shadcn } from "@clerk/ui/themes";

const environment = import.meta.env;

export const publishableKey = environment.VITE_CLERK_PUBLISHABLE_KEY;

export const authRoutes = {
  signIn: environment.VITE_CLERK_SIGN_IN_URL ?? "/sign-in",
  signUp: environment.VITE_CLERK_SIGN_UP_URL ?? "/sign-up",
  signInFallback:
    environment.VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? "/editor",
  signUpFallback:
    environment.VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ?? "/editor",
};

export const clerkAppearance = {
  theme: [dark, shadcn],
  variables: {
    colorPrimary: "var(--accent-primary)",
    colorDanger: "var(--state-error)",
    colorSuccess: "var(--state-success)",
    colorWarning: "var(--state-warning)",
    colorNeutral: "var(--text-muted)",
    colorForeground: "var(--text-primary)",
    colorPrimaryForeground: "var(--bg-base)",
    colorMutedForeground: "var(--text-secondary)",
    colorMuted: "var(--bg-subtle)",
    colorBackground: "var(--bg-surface)",
    colorInputForeground: "var(--text-primary)",
    colorInput: "var(--bg-elevated)",
    colorShimmer: "var(--bg-subtle)",
    colorRing: "var(--accent-primary)",
    colorShadow: "var(--shadow-color)",
    colorBorder: "var(--border-default)",
    fontFamily:
      "var(--font-geist-sans), Geist, Inter, ui-sans-serif, system-ui, sans-serif",
    fontFamilyButtons:
      "var(--font-geist-sans), Geist, Inter, ui-sans-serif, system-ui, sans-serif",
    fontFamilyMono:
      "var(--font-geist-mono), ui-monospace, SFMono-Regular, Consolas, monospace",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "border border-surface-border bg-surface shadow-none",
    dividerLine: "bg-surface-border",
    dividerText: "text-copy-muted",
    formButtonPrimary: "bg-brand text-primary-foreground hover:bg-brand/80",
    formFieldInput: "border-surface-border bg-elevated text-copy-primary",
    formFieldLabel: "text-copy-secondary",
    footerActionLink: "text-brand hover:text-brand/80",
    headerSubtitle: "text-copy-muted",
    headerTitle: "text-copy-primary",
  },
};
