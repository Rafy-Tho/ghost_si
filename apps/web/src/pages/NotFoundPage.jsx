import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-base px-6 text-center text-copy-primary">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
        <Link className="mt-6 inline-block text-sm text-brand hover:underline" to="/editor">
          Return to editor
        </Link>
      </div>
    </main>
  );
}
