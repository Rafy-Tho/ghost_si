import { useAuth } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { createProjectApi } from "./project-api.js";
import { projectQueryKeys } from "./project-query-keys.js";

export function useProjects() {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const projectApi = createProjectApi(getToken);
  const query = useQuery({
    enabled: isLoaded && isSignedIn === true && Boolean(userId),
    queryFn: ({ signal }) => projectApi.listProjects({ signal }),
    queryKey: projectQueryKeys.list(userId),
  });

  return {
    ...query,
    projects: query.data ?? [],
    userId,
  };
}
