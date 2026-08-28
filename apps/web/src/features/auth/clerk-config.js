import { dark, shadcn } from "@clerk/ui/themes";

const environment = import.meta.env;

function readRelativeRoute(name, fallback) {
  const route = environment[name]?.trim() || fallback;

  if (
    !route.startsWith("/") ||
    route.startsWith("//") ||
    route.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(route)
  ) {
    throw new Error(`${name} must be a safe relative route`);
  }

  return route;
}

export const publishableKey = environment.VITE_CLERK_PUBLISHABLE_KEY?.trim();

export const authRoutes = {
  signIn: readRelativeRoute("VITE_CLERK_SIGN_IN_URL", "/sign-in"),
  signUp: readRelativeRoute("VITE_CLERK_SIGN_UP_URL", "/sign-up"),
  signInFallback: readRelativeRoute(
    "VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL",
    "/editor",
  ),
  signUpFallback: readRelativeRoute(
    "VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL",
    "/editor",
  ),
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
    rootBox: "w-full",
    card: "rounded-2xl border border-surface-border bg-surface shadow-none",
    headerTitle: "font-semibold tracking-[-0.02em] text-copy-primary",
    headerSubtitle: "text-copy-muted",
    socialButtonsBlockButton:
      "border-surface-border bg-elevated text-copy-primary transition-colors hover:border-surface-border hover:bg-subtle",
    socialButtonsBlockButtonText: "text-copy-secondary",
    dividerLine: "bg-surface-border",
    dividerText: "text-copy-muted",
    formFieldLabel: "text-copy-secondary",
    formFieldInput:
      "border-surface-border bg-elevated text-copy-primary shadow-none transition-colors placeholder:text-copy-faint focus:border-brand focus:ring-2 focus:ring-brand/20",
    formFieldInputShowPasswordButton: "text-copy-muted hover:text-copy-primary",
    formButtonPrimary:
      "h-11 bg-brand font-medium text-primary-foreground shadow-none transition-colors hover:bg-brand/80 focus:ring-2 focus:ring-brand/30 disabled:opacity-60",
    formFieldErrorText: "text-error",
    formFieldSuccessText: "text-success",
    alert: "border border-error/40 bg-error/10 text-error",
    footerActionText: "text-copy-muted",
    footerActionLink: "font-medium text-brand hover:text-brand/80",
    identityPreview: "border-surface-border bg-elevated text-copy-primary",
    identityPreviewEditButton: "text-brand hover:text-brand/80",
    otpCodeFieldInput:
      "border-surface-border bg-elevated text-copy-primary shadow-none focus:border-brand focus:ring-2 focus:ring-brand/20",
  },
};
