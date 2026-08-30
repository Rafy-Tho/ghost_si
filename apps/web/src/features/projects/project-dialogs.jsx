import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditorDialog } from "@/components/editor/editor-dialog.jsx";
import { PROJECT_NAME_MAX_LENGTH } from "./use-project-actions.js";

function DialogCancelButton({ onCancel }) {
  return (
    <Button onClick={onCancel} type="button" variant="outline">
      Cancel
    </Button>
  );
}

export function ProjectDialogs({
  canSubmit,
  closeDialog,
  confirmDelete,
  dialogType,
  draftName,
  handleNameChange,
  isSubmitting,
  selectedProject,
  submitCreate,
  submitRename,
  validationError,
}) {
  const isCreateOpen = dialogType === "create";
  const isRenameOpen = dialogType === "rename";
  const isDeleteOpen = dialogType === "delete";

  return (
    <>
      <EditorDialog
        description="Give your architecture workspace a clear name."
        footer={
          <>
            <DialogCancelButton onCancel={closeDialog} />
            <Button
              disabled={isSubmitting || !canSubmit}
              form="create-project-form"
              type="submit"
            >
              {isSubmitting ? "Creating..." : "Create project"}
            </Button>
          </>
        }
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        open={isCreateOpen}
        title="Create project"
      >
        <form
          className="space-y-4"
          id="create-project-form"
          onSubmit={submitCreate}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-copy-secondary" htmlFor="create-project-name">
              Project name
            </label>
            <Input
              aria-describedby="create-project-name-help"
              aria-invalid={Boolean(validationError)}
              autoFocus
              className="bg-elevated text-copy-primary placeholder:text-copy-muted focus-visible:border-brand focus-visible:ring-brand/30"
              id="create-project-name"
              maxLength={PROJECT_NAME_MAX_LENGTH}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Payments Platform"
              value={draftName}
            />
            <p className="text-xs text-copy-muted" id="create-project-name-help">
              {draftName.length}/{PROJECT_NAME_MAX_LENGTH} characters
            </p>
          </div>

          <div className="rounded-xl border border-surface-border bg-elevated px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-copy-faint">
              Workspace identifier
            </p>
            <p className="mt-1 font-mono text-xs text-brand">Assigned by the server after creation</p>
            <p className="mt-1 text-xs leading-5 text-copy-muted">
              The collaboration room will be derived from the created project ID.
            </p>
          </div>

          {validationError ? (
            <p className="text-sm text-error" role="alert">
              {validationError}
            </p>
          ) : null}
        </form>
      </EditorDialog>

      <EditorDialog
        description={
          selectedProject
            ? `Update the name for "${selectedProject.name}".`
            : "Update the project name."
        }
        footer={
          <>
            <DialogCancelButton onCancel={closeDialog} />
            <Button
              disabled={isSubmitting || !canSubmit}
              form="rename-project-form"
              type="submit"
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </>
        }
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        open={isRenameOpen}
        title="Rename project"
      >
        <form
          className="space-y-4"
          id="rename-project-form"
          onSubmit={submitRename}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-copy-secondary" htmlFor="rename-project-name">
              Project name
            </label>
            <Input
              aria-invalid={Boolean(validationError)}
              autoFocus
              className="bg-elevated text-copy-primary placeholder:text-copy-muted focus-visible:border-brand focus-visible:ring-brand/30"
              id="rename-project-name"
              maxLength={PROJECT_NAME_MAX_LENGTH}
              onChange={(event) => handleNameChange(event.target.value)}
              value={draftName}
            />
          </div>

          {validationError ? (
            <p className="text-sm text-error" role="alert">
              {validationError}
            </p>
          ) : null}
        </form>
      </EditorDialog>

      <EditorDialog
        description={
          selectedProject
            ? `This will permanently delete "${selectedProject.name}". This action cannot be undone.`
            : "This action cannot be undone."
        }
        footer={
          <>
            <DialogCancelButton onCancel={closeDialog} />
            <Button
              disabled={isSubmitting}
              onClick={confirmDelete}
              type="button"
              variant="destructive"
            >
              <Trash2 aria-hidden="true" />
              {isSubmitting ? "Deleting..." : "Delete project"}
            </Button>
          </>
        }
        onOpenChange={(open) => {
          if (!open) {
            closeDialog();
          }
        }}
        open={isDeleteOpen}
        title="Delete project"
      >
        <p className="text-sm leading-6 text-copy-secondary">
          Delete this project from your workspace?
        </p>
      </EditorDialog>
    </>
  );
}
