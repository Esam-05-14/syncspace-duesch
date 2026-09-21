import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SAMPLE_ROOM_ID } from "@syncspace/contracts";
import { authorizeRoom } from "../../apps/sync-server/src/auth/authorize.ts";
import { generateToken, hashToken } from "../../apps/sync-server/src/auth/tokens.ts";
import { ensureSampleRoom } from "../../apps/sync-server/src/documents/rooms.ts";
import { activeTokenHashes, openSyncDatabase } from "../../apps/sync-server/src/persistence/sqlite.ts";

describe("room capability authorization", () => {
  it("rejects unknown rooms and invalid tokens", () => {
    expect(() => authorizeRoom("not a room", "token", [])).toThrow(/Unknown room/);
    expect(() => authorizeRoom("room-missing", "token", [])).toThrow(/Unknown room/);
    const real = generateToken();
    const hashes = [hashToken(real)];
    expect(() => authorizeRoom(SAMPLE_ROOM_ID, "deadbeef", hashes)).toThrow(/Invalid room token/);
    expect(() => authorizeRoom(SAMPLE_ROOM_ID, real, hashes)).not.toThrow();
  });

  it("accepts only the hashed token stored for the seeded sample room", () => {
    const dir = mkdtempSync(join(tmpdir(), "syncspace-auth-"));
    const db = openSyncDatabase(dir);
    const sample = ensureSampleRoom(db);
    const hashes = activeTokenHashes(db, sample.roomId);
    expect(() => authorizeRoom(sample.roomId, sample.token, hashes)).not.toThrow();
    expect(() => authorizeRoom(sample.roomId, generateToken(), hashes)).toThrow(/Invalid room token/);
    db.close();
  });
});
