import { useState } from "react";
import { FolderOpen, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ProjectList({ emptyDescription, emptyTitle, icon: EmptyIcon, onDeleteProject, onRenameProject, projects }) {
  if (!projects.length) {
    return (
      <div className="flex h-full min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-surface-border-subtle bg-elevated/50 px-6 text-center">
        <span className="grid size-10 place-items-center rounded-xl border border-surface-border bg-surface text-copy-muted">
          <EmptyIcon aria-hidden="true" className="size-4" />
        </span>
        <p className="mt-4 text-sm font-medium text-copy-secondary">{emptyTitle}</p>
        <p className="mt-1 max-w-44 text-xs leading-5 text-copy-muted">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 pr-2">
        {projects.map((project) => (
          <div
            className="flex items-center gap-2 rounded-xl border border-surface-border bg-elevated/60 px-3 py-2.5"
            key={project.id}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-copy-primary">{project.name}</p>
              <p className="mt-0.5 truncate font-mono text-[10px] text-copy-faint">/{project.slug}</p>
            </div>

            {project.access === "owner" ? (
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  aria-label={`Rename ${project.name}`}
                  className="rounded-lg text-copy-muted hover:bg-subtle hover:text-copy-primary"
                  onClick={() => onRenameProject(project)}
                  size="icon-sm"
                  title={`Rename ${project.name}`}
                  type="button"
                  variant="ghost"
                >
                  <Pencil aria-hidden="true" className="size-3.5" />
                </Button>
                <Button
                  aria-label={`Delete ${project.name}`}
                  className="rounded-lg text-error hover:bg-error/10 hover:text-error"
                  onClick={() => onDeleteProject(project)}
                  size="icon-sm"
                  title={`Delete ${project.name}`}
                  type="button"
                  variant="ghost"
                >
                  <Trash2 aria-hidden="true" className="size-3.5" />
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onDeleteProject,
  onNewProject,
  onRenameProject,
  projects,
}) {
  const [activeTab, setActiveTab] = useState("my-projects");
  const ownedProjects = projects.filter((project) => project.access === "owner");
  const sharedProjects = projects.filter((project) => project.access === "collaborator");

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

      <Tabs
        className="min-h-0 flex flex-1 flex-col gap-4 p-4"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList className="w-full bg-elevated p-1">
          <TabsTrigger
            className="data-active:bg-brand data-active:text-primary-foreground data-active:hover:bg-brand/80 data-[state=active]:bg-brand data-[state=active]:text-primary-foreground data-[state=active]:hover:bg-brand/80"
            value="my-projects"
          >
            My Projects
          </TabsTrigger>
          <TabsTrigger
            className="data-active:bg-brand data-active:text-primary-foreground data-active:hover:bg-brand/80 data-[state=active]:bg-brand data-[state=active]:text-primary-foreground data-[state=active]:hover:bg-brand/80"
            value="shared"
          >
            Shared
          </TabsTrigger>
        </TabsList>

        <TabsContent className="min-h-0 flex-1" value="my-projects">
          <ProjectList
            emptyDescription="Create a project to start mapping your system."
            emptyTitle="No projects yet"
            icon={FolderOpen}
            onDeleteProject={onDeleteProject}
            onRenameProject={onRenameProject}
            projects={ownedProjects}
          />
        </TabsContent>
        <TabsContent className="min-h-0 flex-1" value="shared">
          <ProjectList
            emptyDescription="Collaborator projects will appear here."
            emptyTitle="Nothing shared yet"
            icon={Users}
            onDeleteProject={onDeleteProject}
            onRenameProject={onRenameProject}
            projects={sharedProjects}
          />
        </TabsContent>
      </Tabs>

      <div className="border-t border-surface-border p-4">
        <Button
          className="group w-full justify-between rounded-xl bg-brand px-3 text-primary-foreground hover:bg-brand/80"
          onClick={onNewProject}
        >
          <span className="flex items-center gap-2">
            <Plus aria-hidden="true" className="size-4" />
            New Project
          </span>
          <kbd className="rounded-md border border-primary-foreground/20 px-1.5 py-0.5 font-mono text-[10px] text-primary-foreground/70">
            N
          </kbd>
        </Button>
      </div>
    </aside>
  );
}
