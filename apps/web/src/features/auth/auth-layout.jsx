import { BrandMark } from "@/components/brand/brand-mark.jsx";

const workspaceHighlights = [
  "Map systems from plain-language prompts",
  "Refine architecture with your collaborators",
  "Generate a technical specification from the graph",
];

export function AuthLayout({ children, description, title }) {
  return (
    <main className="min-h-screen bg-base text-copy-primary lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(26rem,0.95fr)]">
      <section className="relative hidden min-w-0 flex-col justify-between overflow-hidden border-r border-surface-border px-10 py-10 lg:flex xl:px-16">
        <BrandMark />

        <div className="relative max-w-xl py-16">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-copy-faint">
            <span className="size-1.5 rounded-full bg-brand" />
            Collaborative system design
          </div>
          <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-copy-primary xl:text-6xl">
            Design the system before you build it.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-copy-secondary">{description}</p>

          <ol className="mt-12 max-w-lg divide-y divide-surface-border border-y border-surface-border">
            {workspaceHighlights.map((highlight, index) => (
              <li className="flex items-center gap-5 py-4 text-sm" key={highlight}>
                <span className="font-mono text-xs text-copy-faint">0{index + 1}</span>
                <span className="text-copy-secondary">{highlight}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-copy-faint">
          <span className="size-1.5 rounded-full bg-success" />
          Your architecture workspace, ready when you are
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <BrandMark />
          </div>
          <div className="mb-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
              {title} / Workspace access
            </p>
            <div className="mt-3 h-px w-12 bg-brand" />
          </div>
          {children}
          <p className="mt-6 text-center text-xs leading-5 text-copy-faint">
            Secure authentication powered by Clerk.
          </p>
        </div>
      </section>
    </main>
  );
}
