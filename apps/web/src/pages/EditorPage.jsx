import { useEffect, useRef, useState } from "react";
import { CircleHelp, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EditorNavbar } from "../components/editor/editor-navbar.jsx";
import { ProjectSidebar } from "../components/editor/project-sidebar.jsx";
import { ProjectDialogs } from "../features/projects/project-dialogs.jsx";
import { useProjectActions } from "../features/projects/use-project-actions.js";

export function EditorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(min-width: 1024px)").matches,
  );
  const sidebarToggleRef = useRef(null);
  const { projectId } = useParams();
  const {
    canSubmit,
    closeDialog,
    confirmDelete,
    dialogType,
    draftName,
    handleNameChange,
    isProjectsLoading,
    isSubmitting,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    projects,
    projectsError,
    refetchProjects,
    selectedProject,
    submitCreate,
    submitRename,
    validationError,
  } = useProjectActions({ activeProjectId: projectId });
  const activeProject = projectId
    ? projects.find((project) => project.id === projectId) ?? null
    : null;

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
        projectName={activeProject?.name}
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
      <div className="mt-16 flex min-h-[calc(100vh-4rem)]">
        <div
          className={`w-0 min-w-0 shrink-0 overflow-visible transition-[width] duration-200 ease-out lg:overflow-hidden ${isSidebarOpen ? "lg:w-80" : ""}`}
        >
          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            onDeleteProject={openDeleteFromSidebar}
            onNewProject={openCreateFromSidebar}
            onRenameProject={openRenameFromSidebar}
            activeProjectId={projectId}
            error={projectsError}
            isLoading={isProjectsLoading}
            onRetry={refetchProjects}
            projects={projects}
          />
        </div>
        <main className="flex min-h-[calc(100vh-4rem)] min-w-0 flex-1 flex-col">
        <header className="flex flex-col gap-4 border-b border-surface-border px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">
              Architecture workspace
            </p>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-copy-primary sm:text-2xl">
              {activeProject?.name ?? (projectId ? "Loading workspace" : "Untitled architecture")}
            </h1>
            <p className="mt-1 text-sm text-copy-muted">
              {projectId
                ? activeProject?.id ?? projectId
                : "Turn the first idea into a system your team can reason about."}
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
          {projectId && isProjectsLoading ? (
            <p aria-live="polite" className="text-sm text-copy-muted" role="status">
              Loading workspace...
            </p>
          ) : null}

          {projectId && !isProjectsLoading && projectsError ? (
            <div className="relative z-10 max-w-md text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-error">
                Workspace unavailable
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-copy-primary">
                We could not load this project
              </h2>
              <p className="mt-4 text-sm leading-6 text-copy-muted">
                Check your connection and try again. Projects you cannot access are not shown.
              </p>
              <Button
                className="mt-8 rounded-xl"
                onClick={() => refetchProjects()}
                type="button"
                variant="outline"
              >
                Try again
              </Button>
            </div>
          ) : null}

          {projectId && !isProjectsLoading && !projectsError && !activeProject ? (
            <div className="relative z-10 max-w-md text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-error">
                Workspace unavailable
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-copy-primary">
                Project not found
              </h2>
              <p className="mt-4 text-sm leading-6 text-copy-muted">
                This project may have been deleted or you may not have access to it.
              </p>
              <Button asChild className="mt-8 rounded-xl" variant="outline">
                <Link to="/editor">Back to projects</Link>
              </Button>
            </div>
          ) : null}

          {projectId && !isProjectsLoading && !projectsError && activeProject ? (
            <div className="relative z-10 max-w-xl text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">
                Active workspace
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-copy-primary sm:text-3xl">
                {activeProject.name}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-copy-muted">
                The collaborative canvas will appear here when this workspace is connected.
              </p>
            </div>
          ) : null}

          {!projectId ? (
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
          ) : null}
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
      </div>
      <ProjectDialogs
        canSubmit={canSubmit}
        closeDialog={closeDialog}
        confirmDelete={confirmDelete}
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
