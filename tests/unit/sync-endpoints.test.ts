import { describe, expect, it } from "vitest";
import { resolveSyncEndpoints } from "../../apps/web/src/lib/sync-endpoints.js";

describe("sync endpoints", () => {
  it("uses loopback only during local development", () => {
    expect(resolveSyncEndpoints({ dev: true })).toEqual({
      ws: "ws://127.0.0.1:4357",
      http: "http://127.0.0.1:4357",
    });
  });

  it("does not point a production website at the visitor’s loopback", () => {
    expect(resolveSyncEndpoints({ dev: false })).toEqual({ ws: null, http: null });
  });

  it("honors an explicit remote when one is configured", () => {
    expect(
      resolveSyncEndpoints({
        dev: false,
        ws: "wss://sync.example.test",
        http: "https://sync.example.test",
      }),
    ).toEqual({
      ws: "wss://sync.example.test",
      http: "https://sync.example.test",
    });
  });
});
