import { describe, expect, it } from "vitest";
import {
  assertHostedOrigins,
  corsHeaders,
  isAllowedOrigin,
  resolveSyncAccess,
} from "../../apps/sync-server/src/http/access.ts";

describe("sync access policy", () => {
  it("keeps loopback defaults for local development", () => {
    const access = resolveSyncAccess({ host: "127.0.0.1" });
    expect(access.loopbackOnly).toBe(true);
    expect(access.sampleRoomEnabled).toBe(true);
    expect(access.snapshotEnabled).toBe(true);
    expect(access.allowedOrigins).toEqual([]);
    expect(isAllowedOrigin("http://127.0.0.1:5177", access)).toBe(true);
    expect(isAllowedOrigin("https://evil.example", access)).toBe(false);
    expect(() => assertHostedOrigins(access)).not.toThrow();
  });

  it("turns sample-room off in production even on loopback", () => {
    const access = resolveSyncAccess({ host: "127.0.0.1", nodeEnv: "production" });
    expect(access.loopbackOnly).toBe(true);
    expect(access.sampleRoomEnabled).toBe(false);
    expect(access.snapshotEnabled).toBe(false);
  });

  it("requires an origin allow-list when binding off loopback", () => {
    expect(() => assertHostedOrigins(resolveSyncAccess({ host: "0.0.0.0" }))).toThrow(
      /SYNCSPACE_ALLOWED_ORIGINS/,
    );
    const access = resolveSyncAccess({
      host: "0.0.0.0",
      allowedOrigins: "https://study.example, https://study.example/",
      nodeEnv: "production",
    });
    expect(access.loopbackOnly).toBe(false);
    expect(access.sampleRoomEnabled).toBe(false);
    expect(access.allowedOrigins).toEqual(["https://study.example"]);
    expect(isAllowedOrigin("https://study.example", access)).toBe(true);
    expect(isAllowedOrigin("https://other.example", access)).toBe(false);
    expect(corsHeaders("https://study.example", access)["access-control-allow-origin"]).toBe(
      "https://study.example",
    );
    expect(corsHeaders("https://other.example", access)).toEqual({});
    expect(() => assertHostedOrigins(access)).not.toThrow();
  });

  it("can force the development helper only with an explicit flag", () => {
    const access = resolveSyncAccess({
      host: "0.0.0.0",
      allowedOrigins: "https://study.example",
      enableSampleRoom: "1",
      nodeEnv: "production",
    });
    expect(access.sampleRoomEnabled).toBe(true);
    expect(access.snapshotEnabled).toBe(false);
  });
});
