import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProjectSidebar({ isOpen, onClose, onNewProject }) {
  return (
    <aside
      aria-hidden={!isOpen}
      aria-label="Project navigation"
      className={`invisible fixed top-16 bottom-4 left-4 z-40 flex w-[min(20rem,calc(100vw-2rem))] -translate-x-[calc(100%+1rem)] flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface/95 shadow-2xl backdrop-blur-sm transition-[transform,visibility] duration-200 ${isOpen ? "visible translate-x-0" : ""}`}
      id="project-sidebar"
    >
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
        <h2 className="text-sm font-semibold text-copy-primary">Projects</h2>
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

      <Tabs className="min-h-0 flex-1 gap-4 p-4" defaultValue="my-projects">
        <TabsList className="w-full bg-elevated">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>

        <TabsContent className="min-h-0 flex-1" value="my-projects">
          <div className="flex min-h-40 h-full items-center justify-center rounded-2xl border border-dashed border-surface-border-subtle bg-elevated/50 px-4 text-center text-sm text-copy-muted">
            No projects yet.
          </div>
        </TabsContent>
        <TabsContent className="min-h-0 flex-1" value="shared">
          <div className="flex min-h-40 h-full items-center justify-center rounded-2xl border border-dashed border-surface-border-subtle bg-elevated/50 px-4 text-center text-sm text-copy-muted">
            No shared projects yet.
          </div>
        </TabsContent>
      </Tabs>

      <div className="border-t border-surface-border p-4">
        <Button
          className="w-full rounded-xl bg-brand text-base hover:bg-brand/80"
          onClick={onNewProject}
        >
          <Plus aria-hidden="true" className="size-4" />
          New Project
        </Button>
      </div>
    </aside>
  );
}
