import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import {
  parseBodyLimit,
  parseNodeEnvironment,
  parseOrigin,
  parsePositiveInteger,
} from "./env-validation.js";

dotenv.config({
  path: fileURLToPath(new URL("../../../../.env", import.meta.url)),
});

dotenv.config({
  path: fileURLToPath(new URL("../../.env", import.meta.url)),
});

const nodeEnv = parseNodeEnvironment(process.env.NODE_ENV);
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
  nodeEnv,
  port,
  clientOrigin: parseOrigin(process.env.CLIENT_ORIGIN, {
    fallback: nodeEnv === "production" ? undefined : "http://localhost:5173",
    name: "CLIENT_ORIGIN",
    nodeEnvironment: nodeEnv,
  }),
  requestBodyLimit: parseBodyLimit(process.env.API_BODY_LIMIT, {
    defaultValue: "100kb",
    name: "API_BODY_LIMIT",
  }),
  rateLimit: {
    healthMax: parsePositiveInteger(process.env.HEALTH_RATE_LIMIT_MAX, {
      defaultValue: 60,
      maximum: 10000,
      name: "HEALTH_RATE_LIMIT_MAX",
    }),
    max: parsePositiveInteger(process.env.API_RATE_LIMIT_MAX, {
      defaultValue: 120,
      maximum: 10000,
      name: "API_RATE_LIMIT_MAX",
    }),
    windowMs: parsePositiveInteger(process.env.API_RATE_LIMIT_WINDOW_MS, {
      defaultValue: 60000,
      maximum: 24 * 60 * 60 * 1000,
      name: "API_RATE_LIMIT_WINDOW_MS",
    }),
  },
  trustProxyHops: parsePositiveInteger(process.env.TRUST_PROXY_HOPS, {
    defaultValue: 0,
    maximum: 10,
    minimum: 0,
    name: "TRUST_PROXY_HOPS",
  }),
  clerk: {
    publishableKey: requiredEnvironmentVariable("CLERK_PUBLISHABLE_KEY"),
    secretKey: requiredEnvironmentVariable("CLERK_SECRET_KEY"),
  },
};
