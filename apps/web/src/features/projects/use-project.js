import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { createProjectApi } from "./project-api.js";
import { projectQueryKeys } from "./project-query-keys.js";

export function useProject(projectId) {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const projectApi = createProjectApi(getToken);
  const query = useQuery({
    enabled:
      isLoaded && isSignedIn === true && Boolean(userId) && Boolean(projectId),
    queryFn: ({ signal }) => projectApi.getProject(projectId, { signal }),
    queryKey: projectQueryKeys.detail(userId, projectId),
  });

  return {
    ...query,
    project: query.data ?? null,
    userId,
  };
}
