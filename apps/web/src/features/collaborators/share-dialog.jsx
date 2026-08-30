import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Clipboard,
  LoaderCircle,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditorDialog } from "@/components/editor/editor-dialog.jsx";
import { createCollaboratorApi } from "./collaborator-api.js";
import { collaboratorQueryKeys } from "./collaborator-query-keys.js";
import { useCollaborators } from "./use-collaborators.js";

function getErrorMessage(error, action) {
  if (error?.status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (error?.status === 403) {
    return "Only the project owner can manage collaborators.";
  }

  if (error?.status === 404 && action === "add") {
    return "No existing account was found for that email.";
  }

  if (error?.code === "USER_NOT_FOUND") {
    return "No existing account was found for that email.";
  }

  if (error?.code === "COLLABORATOR_EXISTS") {
    return "That user is already a collaborator.";
  }

  if (error?.code === "CANNOT_ADD_SELF") {
    return "You are already a member of this project.";
  }

  if (error?.code === "COLLABORATOR_LIMIT_REACHED") {
    return "This project has reached its collaborator limit.";
  }

  if (error?.status === 503 || error?.status >= 500 || !error?.status) {
    return `The collaborator ${action} could not be completed. Try again.`;
  }

  return error.message || `The collaborator ${action} could not be completed.`;
}

function isValidEmail(value) {
  const email = value.trim();
  return email.length > 0 && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getInitials(displayName) {
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "?";
}

function MemberAvatar({ member }) {
  const [hasImageError, setHasImageError] = useState(false);

  if (!member.avatarUrl || hasImageError) {
    return (
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-xl border border-surface-border bg-elevated font-mono text-[10px] font-semibold text-brand"
      >
        {getInitials(member.displayName)}
      </span>
    );
  }

  return (
    <img
      alt={`Avatar for ${member.displayName}`}
      className="size-9 shrink-0 rounded-xl border border-surface-border object-cover"
      onError={() => setHasImageError(true)}
      referrerPolicy="no-referrer"
      src={member.avatarUrl}
    />
  );
}

function MemberRow({ canRemove, member, onRemove }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-surface-border bg-elevated/60 px-3 py-3">
      <MemberAvatar member={member} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-copy-primary">
          {member.displayName}
        </p>
        <p className="truncate text-xs text-copy-muted">
          {member.email ?? (member.status === "unavailable" ? "Former member" : "Email unavailable")}
        </p>
      </div>
      {canRemove ? (
        <Button
          aria-label={`Remove ${member.displayName}`}
          className="shrink-0 rounded-xl text-copy-muted hover:bg-error/10 hover:text-error"
          onClick={() => onRemove(member)}
          size="icon-sm"
          title={`Remove ${member.displayName}`}
          type="button"
          variant="ghost"
        >
          <UserMinus aria-hidden="true" className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}

export function ShareDialog({
  access,
  onOpenChange,
  open,
  projectId,
  projectName,
}) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const collaboratorApi = createCollaboratorApi(getToken);
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [copyState, setCopyState] = useState("idle");
  const [removeTarget, setRemoveTarget] = useState(null);
  const copyTimerRef = useRef(null);
  const isOwner = access === "owner";
  const collaboratorsQuery = useCollaborators(projectId, open);

  const addMutation = useMutation({
    mutationFn: (value) => collaboratorApi.addCollaborator(projectId, value),
  });
  const removeMutation = useMutation({
    mutationFn: (targetUserId) =>
      collaboratorApi.removeCollaborator(projectId, targetUserId),
  });

  useEffect(
    () => () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
    },
    [],
  );

  function resetFeedback() {
    setFormError("");
    setFeedback("");
  }

  async function handleAdd(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }

    resetFeedback();

    try {
      await addMutation.mutateAsync(normalizedEmail);
      setEmail("");
      setFeedback("Collaborator added.");
      await queryClient.invalidateQueries({
        queryKey: collaboratorQueryKeys.project(
          collaboratorsQuery.userId,
          projectId,
        ),
      });
    } catch (error) {
      setFormError(getErrorMessage(error, "add"));
    }
  }

  async function handleRemove() {
    if (!removeTarget) {
      return;
    }

    setFormError("");

    try {
      await removeMutation.mutateAsync(removeTarget.userId);
      setRemoveTarget(null);
      setFeedback("Collaborator removed.");
      await queryClient.invalidateQueries({
        queryKey: collaboratorQueryKeys.project(
          collaboratorsQuery.userId,
          projectId,
        ),
      });
    } catch (error) {
      setFormError(getErrorMessage(error, "removal"));
    }
  }

  async function handleCopyLink() {
    const projectUrl = `${window.location.origin}/editor/${encodeURIComponent(projectId)}`;

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(projectUrl);
      setCopyState("copied");
      setFeedback("Project link copied.");
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }
      copyTimerRef.current = window.setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("error");
      setFeedback("The project link could not be copied. Try again.");
    }
  }

  function handleDialogChange(nextOpen) {
    if (!nextOpen && (addMutation.isPending || removeMutation.isPending)) {
      return;
    }

    if (!nextOpen) {
      setEmail("");
      resetFeedback();
      setRemoveTarget(null);
      setCopyState("idle");
    }

    onOpenChange(nextOpen);
  }

  const isBusy = addMutation.isPending || removeMutation.isPending;

  return (
    <>
      <EditorDialog
        contentClassName="max-w-lg"
        description={`Manage who can access ${projectName ?? "this project"}.`}
        footer={
          <>
            {isOwner ? (
              <Button
                className="rounded-xl"
                disabled={isBusy}
                onClick={handleCopyLink}
                type="button"
                variant="outline"
              >
                {copyState === "copied" ? (
                  <Check aria-hidden="true" className="size-4" />
                ) : (
                  <Clipboard aria-hidden="true" className="size-4" />
                )}
                {copyState === "copied" ? "Copied!" : "Copy project link"}
              </Button>
            ) : null}
            <Button
              className="rounded-xl"
              onClick={() => handleDialogChange(false)}
              type="button"
              variant="outline"
            >
              Close
            </Button>
          </>
        }
        onOpenChange={handleDialogChange}
        open={open}
        title="Share project"
      >
        <div className="max-h-[min(32rem,calc(100dvh-10rem))] space-y-5 overflow-y-auto pr-1">
          {isOwner ? (
            <form
              className="space-y-2"
              id="add-collaborator-form"
              onSubmit={handleAdd}
            >
              <label
                className="text-sm font-medium text-copy-secondary"
                htmlFor="collaborator-email"
              >
                Add collaborator
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  aria-describedby={
                    formError
                      ? "collaborator-email-error"
                      : "collaborator-email-help"
                  }
                  aria-invalid={Boolean(formError)}
                  autoComplete="email"
                  className="bg-elevated text-copy-primary placeholder:text-copy-muted focus-visible:border-brand focus-visible:ring-brand/30"
                  id="collaborator-email"
                  maxLength={254}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (formError) {
                      setFormError("");
                    }
                  }}
                  placeholder="person@example.com"
                  type="email"
                  value={email}
                />
                <Button
                  className="rounded-xl sm:shrink-0"
                  disabled={isBusy || !isValidEmail(email)}
                  type="submit"
                >
                  {addMutation.isPending ? (
                    <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                  ) : (
                    <UserPlus aria-hidden="true" className="size-4" />
                  )}
                  Add
                </Button>
              </div>
              <p className="text-xs leading-5 text-copy-muted" id="collaborator-email-help">
                The email must belong to an existing Ghost AI account.
              </p>
            </form>
          ) : null}

          {formError ? (
            <p className="text-sm text-error" id="collaborator-email-error" role="alert">
              {formError}
            </p>
          ) : null}

          {feedback ? (
            <p aria-live="polite" className="text-sm text-success" role="status">
              {feedback}
            </p>
          ) : null}

          <section aria-labelledby="project-owner-heading" className="space-y-2">
            <p
              className="font-mono text-[10px] uppercase tracking-[0.16em] text-copy-faint"
              id="project-owner-heading"
            >
              Owner
            </p>
            {collaboratorsQuery.isPending ? (
              <div className="h-16 animate-pulse rounded-2xl border border-surface-border bg-elevated/60" />
            ) : collaboratorsQuery.owner ? (
              <MemberRow member={collaboratorsQuery.owner} />
            ) : null}
          </section>

          <section aria-labelledby="project-collaborators-heading" className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.16em] text-copy-faint"
                id="project-collaborators-heading"
              >
                Collaborators
              </p>
              {collaboratorsQuery.collaborators.length ? (
                <span className="font-mono text-[10px] text-copy-faint">
                  {collaboratorsQuery.collaborators.length}/100
                </span>
              ) : null}
            </div>

            {collaboratorsQuery.isError ? (
              <div className="rounded-2xl border border-error/40 bg-error/5 px-4 py-4">
                <p className="text-sm font-medium text-copy-secondary">
                  Collaborators unavailable
                </p>
                <p className="mt-1 text-xs leading-5 text-copy-muted">
                  We could not load the member list. Try again.
                </p>
                <Button
                  className="mt-3 rounded-xl"
                  onClick={() => collaboratorsQuery.refetch()}
                  type="button"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            ) : collaboratorsQuery.isPending ? (
              <div className="space-y-2" role="status" aria-label="Loading collaborators">
                <div className="h-16 animate-pulse rounded-2xl border border-surface-border bg-elevated/60" />
                <div className="h-16 animate-pulse rounded-2xl border border-surface-border bg-elevated/60" />
              </div>
            ) : collaboratorsQuery.collaborators.length ? (
              <div className="space-y-2">
                {collaboratorsQuery.collaborators.map((member) => (
                  <MemberRow
                    canRemove={isOwner && member.status === "active"}
                    key={member.userId}
                    member={member}
                    onRemove={setRemoveTarget}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-surface-border-subtle bg-elevated/40 px-4 py-5 text-center">
                <p className="text-sm font-medium text-copy-secondary">
                  No collaborators yet
                </p>
                <p className="mt-1 text-xs leading-5 text-copy-muted">
                  Add a teammate with an existing Ghost AI account.
                </p>
              </div>
            )}
          </section>
        </div>
      </EditorDialog>

      <EditorDialog
        description={
          removeTarget
            ? `Remove ${removeTarget.displayName} from this project? They will lose access to the workspace.`
            : "Remove this collaborator from the project?"
        }
        footer={
          <>
            <Button
              className="rounded-xl"
              disabled={removeMutation.isPending}
              onClick={() => setRemoveTarget(null)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl"
              disabled={removeMutation.isPending}
              onClick={handleRemove}
              type="button"
              variant="destructive"
            >
              {removeMutation.isPending ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <UserMinus aria-hidden="true" className="size-4" />
              )}
              Remove collaborator
            </Button>
          </>
        }
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !removeMutation.isPending) {
            setRemoveTarget(null);
          }
        }}
        open={Boolean(removeTarget)}
        title="Remove collaborator"
      >
        <p className="text-sm leading-6 text-copy-secondary">
          This action takes effect immediately for future workspace access.
        </p>
      </EditorDialog>
    </>
  );
}
