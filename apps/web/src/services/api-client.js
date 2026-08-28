const apiUrl = import.meta.env.VITE_API_URL ?? "";

export async function getHealth() {
  const response = await fetch(`${apiUrl}/api/health`);
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

    return fetch(`${apiUrl}${path}`, {
      ...init,
      headers,
    });
  };
}
