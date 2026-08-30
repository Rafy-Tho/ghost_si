import { useEffect, useRef, useState } from "react";
import { CircleHelp, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AccessDenied } from "../components/editor/access-denied.jsx";
import { AiSidebarPlaceholder } from "../components/editor/ai-sidebar-placeholder.jsx";
import { EditorNavbar } from "../components/editor/editor-navbar.jsx";
import { ProjectSidebar } from "../components/editor/project-sidebar.jsx";
import { ProjectDialogs } from "../features/projects/project-dialogs.jsx";
import { ShareDialog } from "../features/collaborators/share-dialog.jsx";
import { CollaborativeCanvas } from "../features/canvas/collaborative-canvas.jsx";
import { useProject } from "../features/projects/use-project.js";
import { useProjectActions } from "../features/projects/use-project-actions.js";

function WorkspaceLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-base px-6 text-copy-muted">
      <p aria-live="polite" role="status">
        Loading workspace...
      </p>
    </main>
  );
}

function WorkspaceRequestError({ error, onRetry }) {
  const isAuthenticationError = error?.status === 401;

  return (
    <main className="grid min-h-screen place-items-center bg-base px-6 py-16 text-copy-primary">
      <div className="w-full max-w-md text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-error">
          Workspace unavailable
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-copy-primary sm:text-3xl">
          {isAuthenticationError
            ? "Your session needs attention."
            : "We could not load this workspace."}
        </h1>
        <p className="mt-4 text-sm leading-6 text-copy-muted">
          {isAuthenticationError
            ? "Sign in again to continue to this workspace."
            : "Check your connection and try again."}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          {isAuthenticationError ? (
            <Button asChild className="rounded-xl" variant="outline">
              <Link to="/sign-in">Sign in again</Link>
            </Button>
          ) : (
            <Button className="rounded-xl" onClick={() => onRetry()} type="button">
              Try again
            </Button>
          )}
          <Button asChild className="rounded-xl" variant="ghost">
            <Link to="/editor">Back to projects</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

export function EditorPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(min-width: 1024px)").matches,
  );
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const sidebarToggleRef = useRef(null);
  const aiSidebarToggleRef = useRef(null);
  const shareButtonRef = useRef(null);
  const { projectId } = useParams();
  const activeProjectQuery = useProject(projectId);
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
  const activeProject = projectId ? activeProjectQuery.project : null;

  function closeSidebar() {
    setIsSidebarOpen(false);
    window.requestAnimationFrame(() => sidebarToggleRef.current?.focus());
  }

  function closeAiSidebar() {
    setIsAiSidebarOpen(false);
    window.requestAnimationFrame(() => aiSidebarToggleRef.current?.focus());
  }

  function handleShareDialogChange(open) {
    setIsShareDialogOpen(open);

    if (!open) {
      window.requestAnimationFrame(() => shareButtonRef.current?.focus());
    }
  }

  function handleToggleSidebar() {
    if (isSidebarOpen) {
      closeSidebar();
      return;
    }

    setIsAiSidebarOpen(false);
    setIsSidebarOpen(true);
  }

  function handleToggleAiSidebar() {
    if (isAiSidebarOpen) {
      closeAiSidebar();
      return;
    }

    setIsSidebarOpen(false);
    setIsAiSidebarOpen(true);
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

  useEffect(() => {
    if (!isAiSidebarOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape" && !dialogType) {
        closeAiSidebar();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogType, isAiSidebarOpen]);

  if (projectId && activeProjectQuery.isPending) {
    return <WorkspaceLoading />;
  }

  if (projectId && activeProjectQuery.error?.status === 404) {
    return <AccessDenied />;
  }

  if (projectId && activeProjectQuery.isError) {
    return (
      <WorkspaceRequestError
        error={activeProjectQuery.error}
        onRetry={activeProjectQuery.refetch}
      />
    );
  }

  if (projectId && !activeProject) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-dvh overflow-hidden bg-base text-copy-primary">
      <EditorNavbar
        aiSidebarToggleRef={aiSidebarToggleRef}
        isAiSidebarOpen={isAiSidebarOpen}
        isSidebarOpen={isSidebarOpen}
        onToggleAiSidebar={handleToggleAiSidebar}
        onOpenShare={
          projectId && activeProject
            ? () => setIsShareDialogOpen(true)
            : undefined
        }
        onToggleSidebar={handleToggleSidebar}
        projectName={activeProject?.name}
        shareButtonRef={shareButtonRef}
        sidebarToggleRef={sidebarToggleRef}
      />
      {isSidebarOpen || isAiSidebarOpen ? (
        <button
          aria-label="Close open panel"
          className="fixed inset-0 z-30 bg-base/75 lg:hidden"
          onClick={() => {
            if (isSidebarOpen) {
              closeSidebar();
            }
            if (isAiSidebarOpen) {
              closeAiSidebar();
            }
          }}
          type="button"
        />
      ) : null}
      <div className="mt-16 flex min-h-[calc(100dvh-4rem)]">
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
        <main className="flex min-h-[calc(100dvh-4rem)] min-w-0 flex-1 flex-col">
          <header className="flex flex-col gap-4 border-b border-surface-border px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">
                Architecture workspace
              </p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-copy-primary sm:text-2xl">
                {activeProject?.name ?? "Untitled architecture"}
              </h1>
              <p className="mt-1 text-sm text-copy-muted">
                {activeProject?.id ??
                  "Turn the first idea into a system your team can reason about."}
              </p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-xl border border-surface-border bg-surface px-3 py-2 sm:self-auto">
              <span className="size-1.5 rounded-full bg-warning" />
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-copy-muted">
                Draft
              </span>
            </div>
          </header>

          <section className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-base px-5 py-16 sm:px-8">
            {projectId ? (
              <CollaborativeCanvas projectId={projectId} />
            ) : (
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
            )}
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
      <AiSidebarPlaceholder
        isOpen={isAiSidebarOpen}
        onClose={closeAiSidebar}
      />
      {projectId && activeProject ? (
        <ShareDialog
          access={activeProject.access}
          onOpenChange={handleShareDialogChange}
          open={isShareDialogOpen}
          projectId={projectId}
          projectName={activeProject.name}
        />
      ) : null}
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
