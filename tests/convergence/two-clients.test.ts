import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import * as Y from "yjs";
import { materializeBoard, upsertVocabulary } from "@syncspace/collab";
import { SAMPLE_ROOM_ID } from "@syncspace/contracts";
import { ensureSampleRoom, rotateSampleToken } from "../../apps/sync-server/src/documents/rooms.ts";
import { fetchSnapshot, openSyncDatabase } from "../../apps/sync-server/src/persistence/sqlite.ts";
import { createSyncServer } from "../../apps/sync-server/src/sync/server.ts";
import { connectIsolatedClient, destroyClient, unusedLoopbackPort } from "../helpers/isolated-client.ts";
import { waitUntil } from "../helpers/wait.ts";

const APPLE = {
  partOfSpeech: "noun" as const,
  article: "der" as const,
  headword: "Apfel",
  plural: "Äpfel",
  glossEn: "apple",
  exampleDe: "Der Apfel ist rot.",
  tags: ["food"],
};

function hasHeadword(doc: Y.Doc, headword: string): boolean {
  return materializeBoard(doc).cards.some(
    (card) => card.type === "vocabulary" && card.lexical.headword === headword,
  );
}

describe("two isolated shared-room clients", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    while (cleanups.length > 0) {
      const stop = cleanups.pop();
      await stop?.();
    }
  });

  it("rejects an invalid token and converges two authorized documents", async () => {
    const dir = mkdtempSync(join(tmpdir(), "syncspace-two-clients-"));
    const db = openSyncDatabase(dir);
    const sample = ensureSampleRoom(db);
    const port = await unusedLoopbackPort();
    const server = createSyncServer({
      db,
      host: "127.0.0.1",
      port,
      debounce: 40,
      maxDebounce: 120,
      quiet: true,
    });
    await server.listen();
    cleanups.push(async () => {
      await server.destroy();
      db.close();
    });

    const url = `ws://127.0.0.1:${port}`;
    const alice = connectIsolatedClient({ url, roomId: sample.roomId, token: sample.token });
    const bob = connectIsolatedClient({ url, roomId: sample.roomId, token: sample.token });
    cleanups.push(async () => {
      await destroyClient(alice);
      await destroyClient(bob);
    });

    await waitUntil(() => alice.provider.synced && bob.provider.synced, 15_000);

    let rejected = false;
    const intruder = connectIsolatedClient({
      url,
      roomId: sample.roomId,
      token: "0".repeat(64),
      connect: false,
    });
    intruder.provider.on("authenticationFailed", () => {
      rejected = true;
    });
    await intruder.provider.connect();
    cleanups.push(async () => {
      await destroyClient(intruder);
    });
    await waitUntil(() => rejected, 15_000);

    upsertVocabulary(alice.document, { lexical: APPLE });
    await waitUntil(() => hasHeadword(bob.document, "Apfel"), 15_000);
    expect(hasHeadword(alice.document, "Apfel")).toBe(true);
    expect(hasHeadword(intruder.document, "Apfel")).toBe(false);
    expect(materializeBoard(alice.document).boardId).toBe(SAMPLE_ROOM_ID);
  });

  it("restores the last binary checkpoint after the server restarts with no open peer", async () => {
    const dir = mkdtempSync(join(tmpdir(), "syncspace-restart-"));
    const db = openSyncDatabase(dir);
    const sample = ensureSampleRoom(db);
    const port = await unusedLoopbackPort();
    const first = createSyncServer({
      db,
      host: "127.0.0.1",
      port,
      debounce: 40,
      maxDebounce: 120,
      quiet: true,
    });
    await first.listen();

    const url = `ws://127.0.0.1:${port}`;
    const writer = connectIsolatedClient({ url, roomId: sample.roomId, token: sample.token });
    await waitUntil(() => writer.provider.synced, 15_000);
    upsertVocabulary(writer.document, { lexical: APPLE });
    writer.provider.forceSync();
    await waitUntil(() => {
      const row = fetchSnapshot(db, sample.roomId);
      if (!row) {
        return false;
      }
      const probe = new Y.Doc();
      Y.applyUpdate(probe, new Uint8Array(row.yjs_state));
      const ok = hasHeadword(probe, "Apfel");
      probe.destroy();
      return ok;
    }, 15_000);
    await destroyClient(writer);
    await first.destroy();

    const second = createSyncServer({
      db,
      host: "127.0.0.1",
      port,
      debounce: 40,
      maxDebounce: 120,
      quiet: true,
    });
    await second.listen();
    cleanups.push(async () => {
      await second.destroy();
      db.close();
    });

    const reader = connectIsolatedClient({ url, roomId: sample.roomId, token: sample.token });
    cleanups.push(async () => {
      await destroyClient(reader);
    });
    await waitUntil(() => reader.provider.synced && hasHeadword(reader.document, "Apfel"), 15_000);
    expect(materializeBoard(reader.document).cards.some((card) => card.id === "voc_tisch")).toBe(true);
  });

  it("rejects the old token after rotation on reconnect", async () => {
    const dir = mkdtempSync(join(tmpdir(), "syncspace-revoke-"));
    const db = openSyncDatabase(dir);
    const sample = ensureSampleRoom(db);
    const oldToken = sample.token;
    const port = await unusedLoopbackPort();
    const server = createSyncServer({
      db,
      host: "127.0.0.1",
      port,
      debounce: 40,
      maxDebounce: 120,
      quiet: true,
    });
    await server.listen();
    cleanups.push(async () => {
      await server.destroy();
      db.close();
    });

    const url = `ws://127.0.0.1:${port}`;
    let nextToken = "";
    const before = connectIsolatedClient({ url, roomId: sample.roomId, token: oldToken });
    try {
      await waitUntil(() => before.provider.synced, 15_000);
      const rotated = rotateSampleToken(db);
      expect(rotated.token).not.toBe(oldToken);
      nextToken = rotated.token;
    } finally {
      await destroyClient(before);
    }

    let rejected = false;
    const stale = connectIsolatedClient({
      url,
      roomId: sample.roomId,
      token: oldToken,
      connect: false,
    });
    stale.provider.on("authenticationFailed", () => {
      rejected = true;
    });
    await stale.provider.connect();
    cleanups.push(async () => {
      await destroyClient(stale);
    });
    await waitUntil(() => rejected, 15_000);

    const fresh = connectIsolatedClient({ url, roomId: sample.roomId, token: nextToken });
    cleanups.push(async () => {
      await destroyClient(fresh);
    });
    await waitUntil(() => fresh.provider.synced, 15_000);
    expect(materializeBoard(fresh.document).cards.some((card) => card.id === "voc_tisch")).toBe(true);
  });
});
