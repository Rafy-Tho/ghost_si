import { useState } from "react";

export const PROJECT_NAME_MAX_LENGTH = 80;

const INITIAL_PROJECTS = [
  {
    id: "project-1",
    name: "Payments Platform",
    slug: "payments-platform",
    access: "owner",
  },
  {
    id: "project-2",
    name: "Event Analytics",
    slug: "event-analytics",
    access: "owner",
  },
  {
    id: "project-3",
    name: "Identity Service",
    slug: "identity-service",
    access: "collaborator",
  },
];

export function createProjectSlug(value) {
  const normalizedValue = value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

  return (
    normalizedValue.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
    "untitled-project"
  );
}

function createProjectId() {
  const randomId = globalThis.crypto?.randomUUID?.();

  return `project-${randomId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;
}

function validateProjectName(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "Project name is required.";
  }

  if (trimmedValue.length > PROJECT_NAME_MAX_LENGTH) {
    return `Project name must be ${PROJECT_NAME_MAX_LENGTH} characters or fewer.`;
  }

  return "";
}

export function useProjectDialogs() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [dialog, setDialog] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [validationError, setValidationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedProject = dialog?.projectId
    ? projects.find((project) => project.id === dialog.projectId) ?? null
    : null;

  function resetDialogState() {
    setDialog(null);
    setDraftName("");
    setValidationError("");
  }

  function closeDialog() {
    if (isSubmitting) {
      return;
    }

    resetDialogState();
  }

  function openCreateDialog() {
    setDraftName("");
    setValidationError("");
    setDialog({ type: "create" });
  }

  function openRenameDialog(project) {
    if (!project || project.access !== "owner") {
      return;
    }

    setDraftName(project.name);
    setValidationError("");
    setDialog({ type: "rename", projectId: project.id });
  }

  function openDeleteDialog(project) {
    if (!project || project.access !== "owner") {
      return;
    }

    setValidationError("");
    setDialog({ type: "delete", projectId: project.id });
  }

  function handleNameChange(value) {
    setDraftName(value);

    if (validationError) {
      setValidationError("");
    }
  }

  function submitCreate(event) {
    event.preventDefault();

    const name = draftName.trim();
    const error = validateProjectName(draftName);

    if (error) {
      setValidationError(error);
      return;
    }

    setIsSubmitting(true);
    setProjects((currentProjects) => [
      ...currentProjects,
      {
        id: createProjectId(),
        name,
        slug: createProjectSlug(name),
        access: "owner",
      },
    ]);
    setIsSubmitting(false);
    resetDialogState();
  }

  function submitRename(event) {
    event.preventDefault();

    const name = draftName.trim();
    const error = validateProjectName(draftName);

    if (error) {
      setValidationError(error);
      return;
    }

    if (!selectedProject || selectedProject.access !== "owner") {
      closeDialog();
      return;
    }

    setIsSubmitting(true);
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === selectedProject.id ? { ...project, name } : project,
      ),
    );
    setIsSubmitting(false);
    resetDialogState();
  }

  function confirmDelete() {
    if (!selectedProject || selectedProject.access !== "owner") {
      closeDialog();
      return;
    }

    setIsSubmitting(true);
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== selectedProject.id),
    );
    setIsSubmitting(false);
    resetDialogState();
  }

  return {
    closeDialog,
    confirmDelete,
    createSlug: createProjectSlug(draftName),
    dialogType: dialog?.type ?? null,
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
  };
}
