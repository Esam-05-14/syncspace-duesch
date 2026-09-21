import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { materializeBoard, upsertVocabulary } from "@syncspace/collab";
import { SCHEMA_VERSION } from "@syncspace/contracts";
import { createStarterBoard } from "@syncspace/content";
import { ensureSampleRoom } from "../../apps/sync-server/src/documents/rooms.ts";
import { fetchSnapshot, openSyncDatabase, storeSnapshot } from "../../apps/sync-server/src/persistence/sqlite.ts";

describe("binary checkpoint restore", () => {
  it("restores the last binary snapshot into a fresh Y.Doc without an open peer", () => {
    const dir = mkdtempSync(join(tmpdir(), "syncspace-persist-"));
    const db = openSyncDatabase(dir);
    const sample = ensureSampleRoom(db);

    const working = new Y.Doc();
    const seeded = fetchSnapshot(db, sample.roomId);
    expect(seeded).toBeTruthy();
    Y.applyUpdate(working, new Uint8Array(seeded!.yjs_state));
    upsertVocabulary(working, {
      lexical: {
        partOfSpeech: "noun",
        article: "der",
        headword: "Apfel",
        plural: "Äpfel",
        glossEn: "apple",
        exampleDe: "Der Apfel ist rot.",
        tags: ["food"],
      },
    });
    const first = storeSnapshot(db, {
      documentId: sample.roomId,
      schemaVersion: SCHEMA_VERSION,
      state: Y.encodeStateAsUpdate(working),
    });
    working.destroy();
    db.close();

    const reopened = openSyncDatabase(dir);
    const row = fetchSnapshot(reopened, sample.roomId);
    expect(row?.checkpoint_seq).toBe(first.checkpoint_seq);
    const fresh = new Y.Doc();
    Y.applyUpdate(fresh, new Uint8Array(row!.yjs_state));
    const board = materializeBoard(fresh);
    expect(board.cards.some((card) => card.type === "vocabulary" && card.lexical.headword === "Apfel")).toBe(true);
    expect(board.cards.some((card) => card.id === "voc_tisch")).toBe(true);
    fresh.destroy();
    reopened.close();
  });

  it("does not re-seed starter JSON when a snapshot already exists", () => {
    const dir = mkdtempSync(join(tmpdir(), "syncspace-reseed-"));
    const db = openSyncDatabase(dir);
    ensureSampleRoom(db);
    const before = fetchSnapshot(db, createStarterBoard().boardId);
    ensureSampleRoom(db);
    const after = fetchSnapshot(db, createStarterBoard().boardId);
    expect(after?.checkpoint_seq).toBe(before?.checkpoint_seq);
    expect(after?.yjs_state.equals(before!.yjs_state)).toBe(true);
    db.close();
  });
});
