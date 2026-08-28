import { useAuth } from "@clerk/react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createProjectApi } from "./project-api.js";
import { projectQueryKeys } from "./project-query-keys.js";
import { useProjects } from "./use-projects.js";

export const PROJECT_NAME_MAX_LENGTH = 80;

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

function getActionErrorMessage(error) {
  if (error?.status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (error?.status === 403) {
    return "You do not have permission to change this project.";
  }

  if (error?.status >= 500 || !error?.status) {
    return "The project could not be changed. Try again.";
  }

  return error.message || "The project could not be changed. Try again.";
}

export function useProjectActions({ activeProjectId = null } = {}) {
  const { getToken, userId } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { projects, isPending, error, refetch } = useProjects();
  const projectApi = createProjectApi(getToken);
  const [dialog, setDialog] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [validationError, setValidationError] = useState("");

  const createMutation = useMutation({
    mutationFn: (name) => projectApi.createProject(name),
  });
  const renameMutation = useMutation({
    mutationFn: ({ name, projectId }) => projectApi.renameProject(projectId, name),
  });
  const deleteMutation = useMutation({
    mutationFn: (projectId) => projectApi.deleteProject(projectId),
  });

  const isSubmitting =
    createMutation.isPending || renameMutation.isPending || deleteMutation.isPending;
  const selectedProject = dialog?.project ?? null;
  const canSubmit = Boolean(draftName.trim()) && draftName.trim().length <= PROJECT_NAME_MAX_LENGTH;

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
    setDialog({ project, type: "rename" });
  }

  function openDeleteDialog(project) {
    if (!project || project.access !== "owner") {
      return;
    }

    setValidationError("");
    setDialog({ project, type: "delete" });
  }

  function handleNameChange(value) {
    setDraftName(value);

    if (validationError) {
      setValidationError("");
    }
  }

  function updateProjectCache(updater) {
    if (userId) {
      queryClient.setQueryData(projectQueryKeys.list(userId), updater);
    }
  }

  function refreshProjects() {
    void queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
  }

  async function submitCreate(event) {
    event.preventDefault();

    const name = draftName.trim();
    const nameError = validateProjectName(draftName);

    if (nameError) {
      setValidationError(nameError);
      return;
    }

    setValidationError("");

    try {
      const project = await createMutation.mutateAsync(name);

      updateProjectCache((currentProjects = []) => [
        project,
        ...currentProjects.filter((currentProject) => currentProject.id !== project.id),
      ]);
      refreshProjects();
      resetDialogState();
      navigate(`/editor/${encodeURIComponent(project.id)}`);
    } catch (actionError) {
      setValidationError(getActionErrorMessage(actionError));
    }
  }

  async function submitRename(event) {
    event.preventDefault();

    const name = draftName.trim();
    const nameError = validateProjectName(draftName);

    if (nameError) {
      setValidationError(nameError);
      return;
    }

    if (!selectedProject || selectedProject.access !== "owner") {
      closeDialog();
      return;
    }

    setValidationError("");

    try {
      const project = await renameMutation.mutateAsync({
        name,
        projectId: selectedProject.id,
      });

      updateProjectCache((currentProjects = []) =>
        currentProjects.map((currentProject) =>
          currentProject.id === project.id ? project : currentProject,
        ),
      );
      refreshProjects();
      resetDialogState();
    } catch (actionError) {
      setValidationError(getActionErrorMessage(actionError));
    }
  }

  async function confirmDelete() {
    if (!selectedProject || selectedProject.access !== "owner") {
      closeDialog();
      return;
    }

    setValidationError("");

    try {
      await deleteMutation.mutateAsync(selectedProject.id);

      updateProjectCache((currentProjects = []) =>
        currentProjects.filter((project) => project.id !== selectedProject.id),
      );
      refreshProjects();
      resetDialogState();

      if (activeProjectId === selectedProject.id) {
        navigate("/editor");
      }
    } catch (actionError) {
      setValidationError(getActionErrorMessage(actionError));
    }
  }

  return {
    canSubmit,
    closeDialog,
    confirmDelete,
    dialogType: dialog?.type ?? null,
    draftName,
    handleNameChange,
    isProjectsLoading: isPending,
    isSubmitting,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    projects,
    projectsError: error,
    refetchProjects: refetch,
    selectedProject,
    submitCreate,
    submitRename,
    validationError,
  };
}
