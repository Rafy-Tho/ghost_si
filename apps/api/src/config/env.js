import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
});

const port = Number(process.env.PORT ?? 4000);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("PORT must be a positive integer");
}

function requiredEnvironmentVariable(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  clerk: {
    publishableKey: requiredEnvironmentVariable("CLERK_PUBLISHABLE_KEY"),
    secretKey: requiredEnvironmentVariable("CLERK_SECRET_KEY"),
  },
};
