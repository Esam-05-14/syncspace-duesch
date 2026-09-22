import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ensureSampleRoom } from "../../apps/sync-server/src/documents/rooms.ts";
import { resolveSyncAccess } from "../../apps/sync-server/src/http/access.ts";
import { openSyncDatabase } from "../../apps/sync-server/src/persistence/sqlite.ts";
import { createSyncServer } from "../../apps/sync-server/src/sync/server.ts";
import { unusedLoopbackPort } from "../helpers/isolated-client.ts";

describe("sync HTTP access", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    while (cleanups.length > 0) {
      const stop = cleanups.pop();
      await stop?.();
    }
  });

  it("keeps the loopback development helper when access is omitted", async () => {
    const dir = mkdtempSync(join(tmpdir(), "syncspace-http-loop-"));
    const db = openSyncDatabase(dir);
    ensureSampleRoom(db);
    const port = await unusedLoopbackPort();
    const server = createSyncServer({ db, host: "127.0.0.1", port, quiet: true });
    await server.listen();
    cleanups.push(async () => {
      await server.destroy();
      db.close();
    });

    const sample = await fetch(`http://127.0.0.1:${port}/dev/sample-room`);
    expect(sample.status).toBe(200);
    const body = (await sample.json()) as { roomId: string; token?: string };
    expect(body.roomId).toBeTruthy();
    expect(body.token).toBeTruthy();
  });

  it("hides sample-room and honors CORS on a hosted access policy", async () => {
    const dir = mkdtempSync(join(tmpdir(), "syncspace-http-host-"));
    const db = openSyncDatabase(dir);
    ensureSampleRoom(db);
    const port = await unusedLoopbackPort();
    const access = resolveSyncAccess({
      host: "0.0.0.0",
      allowedOrigins: "https://study.example",
      nodeEnv: "production",
    });
    const server = createSyncServer({
      db,
      host: "127.0.0.1",
      port,
      quiet: true,
      access,
    });
    await server.listen();
    cleanups.push(async () => {
      await server.destroy();
      db.close();
    });

    const sample = await fetch(`http://127.0.0.1:${port}/dev/sample-room`);
    expect(sample.status).toBe(404);

    const allowed = await fetch(`http://127.0.0.1:${port}/health`, {
      headers: { origin: "https://study.example" },
    });
    expect(allowed.status).toBe(200);
    expect(allowed.headers.get("access-control-allow-origin")).toBe("https://study.example");

    const denied = await fetch(`http://127.0.0.1:${port}/health`, {
      headers: { origin: "https://other.example" },
    });
    expect(denied.status).toBe(200);
    expect(denied.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("refuses to configure a hosted bind without an allow-list", () => {
    const dir = mkdtempSync(join(tmpdir(), "syncspace-http-refuse-"));
    const db = openSyncDatabase(dir);
    expect(() =>
      createSyncServer({
        db,
        host: "0.0.0.0",
        port: 9,
        quiet: true,
      }),
    ).toThrow(/SYNCSPACE_ALLOWED_ORIGINS/);
    db.close();
  });
});
