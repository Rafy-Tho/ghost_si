const apiUrl = import.meta.env.VITE_API_URL ?? "";

export async function getHealth() {
  const response = await fetch(`${apiUrl}/api/health`);
  const payload = await response.json();

  return {
    ...payload,
    httpOk: response.ok,
  };
}
