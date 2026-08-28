function readApiUrl(value) {
  const configuredUrl = value?.trim();

  if (!configuredUrl) {
    return "";
  }

  let apiOrigin;

  try {
    apiOrigin = new URL(configuredUrl);
  } catch {
    throw new Error("VITE_API_URL must be a valid HTTP or HTTPS origin");
  }

  if (
    !["http:", "https:"].includes(apiOrigin.protocol) ||
    apiOrigin.username ||
    apiOrigin.password ||
    apiOrigin.pathname !== "/" ||
    apiOrigin.search ||
    apiOrigin.hash
  ) {
    throw new Error("VITE_API_URL must contain only a scheme, host, and port");
  }

  return apiOrigin.origin;
}

function readApiPath(path) {
  if (
    typeof path !== "string" ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\")
  ) {
    throw new TypeError("API paths must be relative paths");
  }

  return path;
}

function buildApiUrl(path) {
  return `${apiUrl}${readApiPath(path)}`;
}

const apiUrl = readApiUrl(import.meta.env.VITE_API_URL);

export async function getHealth() {
  const response = await fetch(buildApiUrl("/api/health"), {
    credentials: "omit",
  });
  const payload = await response.json();

  return {
    ...payload,
    httpOk: response.ok,
  };
}

export function createAuthenticatedApiClient(getToken) {
  if (typeof getToken !== "function") {
    throw new TypeError("createAuthenticatedApiClient requires Clerk getToken");
  }

  return async function request(path, init = {}) {
    const token = await getToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);

    return fetch(buildApiUrl(path), {
      ...init,
      credentials: "omit",
      headers,
    });
  };
}
