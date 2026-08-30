import { createClient } from "@liveblocks/client";

let client;

export function getLiveblocksClient(getToken) {
  if (!client) {
    client = createClient({
      authEndpoint: async (room) => {
        const token = await getToken();
        if (!token) {
          throw new Error("Authentication required.");
        }
        const response = await fetch("/api/liveblocks-auth", {
          body: JSON.stringify({ projectId: room }),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Live collaboration authorization failed.");
        }

        return response.json();
      },
    });
  }

  return client;
}
