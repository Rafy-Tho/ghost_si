import { useState } from "react";
import { Activity, Boxes, CircleHelp, Layers3, Workflow } from "lucide-react";
import { EditorNavbar } from "../components/editor/editor-navbar.jsx";
import { ProjectSidebar } from "../components/editor/project-sidebar.jsx";

export function EditorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
      />
      {isSidebarOpen ? (
        <button
          aria-label="Close project sidebar"
          className="fixed inset-0 z-30 bg-base/75 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          type="button"
        />
      ) : null}
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNewProject={() => undefined}
      />
      <main className="flex min-h-screen flex-col pt-16">
        <header className="flex flex-col gap-4 border-b border-surface-border px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">
              Architecture workspace
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-copy-primary sm:text-2xl">
              Untitled architecture
            </h1>
            <p className="mt-1 text-sm text-copy-muted">
              Turn the first idea into a system your team can reason about.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-xl border border-surface-border bg-surface px-3 py-2 sm:self-auto">
            <span className="size-1.5 rounded-full bg-warning" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-copy-muted">
              Draft
            </span>
          </div>
        </header>

        <section className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-16 sm:px-8">
          <div className="pointer-events-none absolute inset-5 rounded-3xl border border-surface-border/70 sm:inset-8" />
          <div className="relative z-10 max-w-xl text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-brand/30 bg-accent-dim text-brand">
              <Workflow aria-hidden="true" className="size-7" />
            </div>
            <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.18em] text-copy-faint">
              Canvas / Empty state
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-copy-primary sm:text-3xl">
              Start shaping the system
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-copy-muted">
              Your canvas is ready for services, data stores, and the decisions that connect them.
              Open the project panel to create your first workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs text-copy-secondary">
                <Layers3 aria-hidden="true" className="size-3.5 text-brand" />
                Nodes and edges
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs text-copy-secondary">
                <Activity aria-hidden="true" className="size-3.5 text-ai-text" />
                Live collaboration
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 py-2 text-xs text-copy-secondary">
                <Boxes aria-hidden="true" className="size-3.5 text-copy-muted" />
                Starter templates
              </span>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-border px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2 text-xs text-copy-faint">
            <CircleHelp aria-hidden="true" className="size-3.5" />
            <span>Open projects with the panel toggle</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-copy-faint">
            <span>0 nodes</span>
            <span className="text-surface-border">/</span>
            <span>0 collaborators</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
