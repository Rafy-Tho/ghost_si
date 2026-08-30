import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

export function AccessDenied() {
  return (
    <main className="grid min-h-screen place-items-center bg-base px-6 py-16 text-copy-primary">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl border border-surface-border bg-surface text-copy-muted">
          <Lock aria-hidden="true" className="size-5" />
        </span>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-error">
          Workspace unavailable
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-copy-primary sm:text-3xl">
          This workspace is unavailable.
        </h1>
        <p className="mt-4 text-sm leading-6 text-copy-muted">
          The workspace may not exist or you may not have access to it.
        </p>
        <Link
          className="mt-8 inline-flex h-9 items-center justify-center rounded-xl border border-surface-border bg-surface px-4 text-sm font-medium text-copy-primary transition-colors hover:bg-elevated focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
          to="/editor"
        >
          Back to projects
        </Link>
      </div>
    </main>
  );
}
