export type SyncAccessEnv = {
  host?: string;
  nodeEnv?: string;
  allowedOrigins?: string;
  enableSampleRoom?: string;
  enableDevSnapshot?: string;
};

export type SyncAccess = {
  bindHost: string;
  loopbackOnly: boolean;
  allowedOrigins: string[];
  sampleRoomEnabled: boolean;
  snapshotEnabled: boolean;
};

export function isLoopbackBind(host: string | undefined): boolean {
  const name = (host ?? "127.0.0.1").trim() || "127.0.0.1";
  return name === "127.0.0.1" || name === "localhost" || name === "::1";
}

export function parseAllowedOrigins(raw: string | undefined): string[] {
  if (!raw) {
    return [];
  }
  return [...new Set(
    raw
      .split(",")
      .map((item) => item.trim().replace(/\/$/, ""))
      .filter((item) => item.length > 0),
  )];
}

export function isLoopbackOrigin(origin: string): boolean {
  return origin.startsWith("http://127.0.0.1:") || origin.startsWith("http://localhost:");
}

export function isAllowedOrigin(origin: string, access: SyncAccess): boolean {
  if (!origin) {
    return false;
  }
  const normalized = origin.replace(/\/$/, "");
  if (access.loopbackOnly && isLoopbackOrigin(normalized)) {
    return true;
  }
  return access.allowedOrigins.includes(normalized);
}

export function corsHeaders(origin: string, access: SyncAccess): Record<string, string> {
  if (!isAllowedOrigin(origin, access)) {
    return {};
  }
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, OPTIONS",
    vary: "origin",
  };
}

export function isLoopbackHostHeader(hostHeader: string | undefined): boolean {
  const name = (hostHeader ?? "").split(":")[0];
  return name === "127.0.0.1" || name === "localhost" || name === "::1";
}

/** Hosted bind requires an origin allow-list so the box is not an open CORS peer. */
export function assertHostedOrigins(access: SyncAccess): void {
  if (!access.loopbackOnly && access.allowedOrigins.length === 0) {
    throw new Error("SYNCSPACE_ALLOWED_ORIGINS is required when binding off loopback.");
  }
}

export function resolveSyncAccess(env: SyncAccessEnv = {}): SyncAccess {
  const bindHost = (env.host ?? "127.0.0.1").trim() || "127.0.0.1";
  const loopbackOnly = isLoopbackBind(bindHost);
  const production = env.nodeEnv === "production";
  const allowedOrigins = parseAllowedOrigins(env.allowedOrigins);
  const forceSample = env.enableSampleRoom === "1" || env.enableSampleRoom === "true";
  const forceSnapshot = env.enableDevSnapshot === "1" || env.enableDevSnapshot === "true";
  return {
    bindHost,
    loopbackOnly,
    allowedOrigins,
    sampleRoomEnabled: forceSample || (loopbackOnly && !production),
    snapshotEnabled: forceSnapshot || (loopbackOnly && !production),
  };
}
