import { useEffect, useRef, useState } from "react";
import { CircleHelp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditorNavbar } from "../components/editor/editor-navbar.jsx";
import { ProjectSidebar } from "../components/editor/project-sidebar.jsx";
import { ProjectDialogs } from "../features/projects/project-dialogs.jsx";
import { useProjectDialogs } from "../features/projects/use-project-dialogs.js";

export function EditorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarToggleRef = useRef(null);
  const {
    closeDialog,
    confirmDelete,
    createSlug,
    dialogType,
    draftName,
    handleNameChange,
    isSubmitting,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    projects,
    selectedProject,
    submitCreate,
    submitRename,
    validationError,
  } = useProjectDialogs();

  function closeSidebar() {
    setIsSidebarOpen(false);
    window.requestAnimationFrame(() => sidebarToggleRef.current?.focus());
  }

  function handleToggleSidebar() {
    if (isSidebarOpen) {
      closeSidebar();
      return;
    }

    setIsSidebarOpen(true);
  }

  function openCreateFromSidebar() {
    openCreateDialog();
  }

  function openRenameFromSidebar(project) {
    openRenameDialog(project);
  }

  function openDeleteFromSidebar(project) {
    openDeleteDialog(project);
  }

  useEffect(() => {
    if (!isSidebarOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape" && !dialogType) {
        closeSidebar();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogType, isSidebarOpen]);

  return (
    <div className="min-h-screen bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
        sidebarToggleRef={sidebarToggleRef}
      />
      {isSidebarOpen ? (
        <button
          aria-label="Close project sidebar"
          className="fixed inset-0 z-30 bg-base/75 lg:hidden"
          onClick={closeSidebar}
          type="button"
        />
      ) : null}
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onDeleteProject={openDeleteFromSidebar}
        onNewProject={openCreateFromSidebar}
        onRenameProject={openRenameFromSidebar}
        projects={projects}
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

        <section className="flex flex-1 items-center justify-center px-5 py-16 sm:px-8">
          <div className="relative z-10 max-w-xl text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">
              New workspace
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-copy-primary sm:text-3xl">
              Create a project
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-copy-muted">
              Start a new architecture workspace to begin designing your system.
            </p>
            <Button
              className="mt-8 rounded-xl bg-brand px-4 text-primary-foreground hover:bg-brand/80 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring"
              onClick={openCreateDialog}
              type="button"
            >
              <Plus aria-hidden="true" className="size-4" />
              New Project
            </Button>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-border px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2 text-xs text-copy-faint">
            <CircleHelp aria-hidden="true" className="size-3.5" />
            <span>Manage projects from the panel</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.12em] text-copy-faint">
            <span>0 nodes</span>
            <span className="text-surface-border">/</span>
            <span>0 collaborators</span>
          </div>
        </footer>
      </main>
      <ProjectDialogs
        closeDialog={closeDialog}
        confirmDelete={confirmDelete}
        createSlug={createSlug}
        dialogType={dialogType}
        draftName={draftName}
        handleNameChange={handleNameChange}
        isSubmitting={isSubmitting}
        selectedProject={selectedProject}
        submitCreate={submitCreate}
        submitRename={submitRename}
        validationError={validationError}
      />
    </div>
  );
}
