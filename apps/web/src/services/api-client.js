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

export class ApiRequestError extends Error {
  constructor(message, { code = "API_ERROR", requestId = null, status = 0 } = {}) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.requestId = requestId;
    this.status = status;
  }
}

async function readResponsePayload(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function readApiError(response, payload) {
  return new ApiRequestError(
    payload?.error?.message ?? "The API request could not be completed.",
    {
      code: payload?.error?.code,
      requestId: payload?.requestId,
      status: response.status,
    },
  );
}

export async function getHealth() {
  const response = await fetch(buildApiUrl("/api/health"), {
    credentials: "omit",
  });
  const payload = await readResponsePayload(response);

  return {
    ...(payload ?? {}),
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

    const response = await fetch(buildApiUrl(path), {
      ...init,
      credentials: "omit",
      headers,
    });

    const payload = await readResponsePayload(response);

    if (!response.ok) {
      throw readApiError(response, payload);
    }

    return payload;
  };
}
