import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { createCollaboratorApi } from "./collaborator-api.js";
import { collaboratorQueryKeys } from "./collaborator-query-keys.js";

export function useCollaborators(projectId, enabled = false) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const collaboratorApi = createCollaboratorApi(getToken);
  const query = useQuery({
    enabled:
      enabled &&
      isLoaded &&
      isSignedIn === true &&
      Boolean(userId) &&
      Boolean(projectId),
    queryFn: ({ signal }) =>
      collaboratorApi.listCollaborators(projectId, { signal }),
    queryKey: collaboratorQueryKeys.project(userId, projectId),
  });

  return {
    ...query,
    collaborators: query.data?.collaborators ?? [],
    owner: query.data?.owner ?? null,
    userId,
  };
}
