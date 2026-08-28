import { FolderOpen, Plus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProjectSidebar({ isOpen, onClose, onNewProject }) {
  return (
    <aside
      aria-hidden={!isOpen}
      aria-label="Project navigation"
      className={`invisible fixed top-16 bottom-4 left-4 z-40 flex w-[min(20rem,calc(100vw-2rem))] -translate-x-[calc(100%+1rem)] flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface/95 shadow-2xl backdrop-blur-sm transition-[transform,visibility] duration-200 ${isOpen ? "visible translate-x-0" : ""}`}
      id="project-sidebar"
      inert={!isOpen ? "" : undefined}
    >
      <div className="flex items-start justify-between border-b border-surface-border px-4 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-copy-faint">Workspace</p>
          <h2 className="mt-1 text-sm font-semibold text-copy-primary">Projects</h2>
        </div>
        <Button
          aria-label="Close project sidebar"
          className="rounded-xl text-copy-muted hover:bg-subtle hover:text-copy-primary"
          onClick={onClose}
          size="icon-sm"
          variant="ghost"
        >
          <X aria-hidden="true" className="size-4" />
        </Button>
      </div>

      <div className="mx-4 mt-4 flex items-center justify-between rounded-xl border border-surface-border bg-elevated/60 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent-dim text-brand">
            <Users aria-hidden="true" className="size-3.5" />
          </span>
          <span className="truncate text-xs font-medium text-copy-secondary">Personal projects</span>
        </div>
        <span className="font-mono text-[10px] text-copy-faint">0</span>
      </div>

      <Tabs className="min-h-0 flex-1 gap-4 p-4" defaultValue="my-projects">
        <TabsList className="w-full bg-elevated p-1">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent className="min-h-0 flex-1" value="my-projects">
          <div className="flex h-full min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border-subtle bg-elevated/50 px-6 text-center">
            <span className="grid size-10 place-items-center rounded-xl border border-surface-border bg-surface text-copy-muted">
              <FolderOpen aria-hidden="true" className="size-4" />
            </span>
            <p className="mt-4 text-sm font-medium text-copy-secondary">No projects yet</p>
            <p className="mt-1 max-w-44 text-xs leading-5 text-copy-muted">
              Create a project to start mapping your system.
            </p>
          </div>
        </TabsContent>
        <TabsContent className="min-h-0 flex-1" value="shared">
          <div className="flex h-full min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border-subtle bg-elevated/50 px-6 text-center">
            <span className="grid size-10 place-items-center rounded-xl border border-surface-border bg-surface text-copy-muted">
              <Users aria-hidden="true" className="size-4" />
            </span>
            <p className="mt-4 text-sm font-medium text-copy-secondary">Nothing shared yet</p>
            <p className="mt-1 max-w-44 text-xs leading-5 text-copy-muted">
              Collaborator projects will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="border-t border-surface-border p-4">
        <Button
          className="group w-full justify-between rounded-xl bg-brand px-3 text-primary-foreground hover:bg-brand/80"
          onClick={onNewProject}
        >
          <span className="flex items-center gap-2">
            <Plus aria-hidden="true" className="size-4" />
            New project
          </span>
          <kbd className="rounded-md border border-primary-foreground/20 px-1.5 py-0.5 font-mono text-[10px] text-primary-foreground/70">
            N
          </kbd>
        </Button>
      </div>
    </aside>
  );
}
