import { env } from "../../config/env.js";
import { Liveblocks } from "@liveblocks/node";

let client;

export function getLiveblocksClient() {
  const { secretKey } = env.liveblocks;

  if (!secretKey) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is required");
  }

  client ??= new Liveblocks({ secret: secretKey });
  return client;
}
