const allowedNodeEnvironments = new Set([
  "development",
  "test",
  "production",
]);

function isLoopbackHostname(hostname) {
  const normalizedHostname = hostname
    .replace(/^\[|\]$/g, "")
    .replace(/\.+$/, "")
    .toLowerCase();

  if (
    normalizedHostname === "::1" ||
    normalizedHostname === "localhost" ||
    normalizedHostname.endsWith(".localhost")
  ) {
    return true;
  }

  const ipv4Octets = normalizedHostname.split(".");

  return (
    ipv4Octets.length === 4 &&
    ipv4Octets[0] === "127" &&
    ipv4Octets.slice(1).every((octet) => {
      const value = Number(octet);
      return /^\d{1,3}$/.test(octet) && value >= 0 && value <= 255;
    })
  );
}

export function parseNodeEnvironment(value) {
  const nodeEnvironment = value?.trim() || "development";

  if (!allowedNodeEnvironments.has(nodeEnvironment)) {
    throw new Error(
      "NODE_ENV must be one of development, test, or production",
    );
  }

  return nodeEnvironment;
}

export function parseOrigin(value, { fallback, nodeEnvironment, name }) {
  const configuredOrigin = value?.trim() || fallback;

  if (!configuredOrigin) {
    throw new Error(`${name} is required in production`);
  }

  let origin;

  try {
    origin = new URL(configuredOrigin);
  } catch {
    throw new Error(`${name} must be a valid HTTP or HTTPS origin`);
  }

  if (![
    "http:",
    "https:",
  ].includes(origin.protocol)) {
    throw new Error(`${name} must use HTTP or HTTPS`);
  }

  if (
    origin.username ||
    origin.password ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash
  ) {
    throw new Error(`${name} must contain only a scheme, host, and port`);
  }

  if (
    nodeEnvironment === "production" &&
    (origin.protocol !== "https:" ||
      isLoopbackHostname(origin.hostname))
  ) {
    throw new Error(`${name} must be a non-local HTTPS origin in production`);
  }

  return origin.origin;
}

export function parsePositiveInteger(
  value,
  { defaultValue, maximum, minimum = 1, name },
) {
  const configuredValue = value?.trim() || String(defaultValue);
  const parsedValue = Number(configuredValue);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < minimum ||
    parsedValue > maximum
  ) {
    throw new Error(
      `${name} must be an integer between ${minimum} and ${maximum}`,
    );
  }

  return parsedValue;
}

export function parseBodyLimit(value, { defaultValue, name }) {
  const bodyLimit = value?.trim() || defaultValue;
  const match = /^(\d+)(b|kb|mb)$/i.exec(bodyLimit);

  if (!match) {
    throw new Error(`${name} must use a byte, kb, or mb value`);
  }

  const multiplier = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
  }[match[2].toLowerCase()];
  const bytes = Number(match[1]) * multiplier;

  if (!Number.isSafeInteger(bytes) || bytes < 1024 || bytes > 10 * 1024 * 1024) {
    throw new Error(`${name} must be between 1kb and 10mb`);
  }

  return `${match[1]}${match[2].toLowerCase()}`;
}
