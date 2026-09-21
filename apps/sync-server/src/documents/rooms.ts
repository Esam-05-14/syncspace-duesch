import { SAMPLE_ROOM_ID, SCHEMA_VERSION } from "@syncspace/contracts";
import { applyMaterializedBoard } from "@syncspace/collab";
import { STARTER_BOARD } from "@syncspace/content";
import * as Y from "yjs";
import type Database from "better-sqlite3";
import { generateToken, hashToken } from "../auth/tokens.js";
import { fetchSnapshot, getRoom, insertCapability, insertRoom, storeSnapshot } from "../persistence/sqlite.js";

export type SampleRoom = {
  roomId: string;
  token: string;
};

let sampleToken: string | undefined;

export function ensureSampleRoom(db: Database.Database): SampleRoom {
  if (!getRoom(db, SAMPLE_ROOM_ID)) {
    const doc = new Y.Doc();
    applyMaterializedBoard(doc, STARTER_BOARD);
    const state = Y.encodeStateAsUpdate(doc);
    insertRoom(db, SAMPLE_ROOM_ID, SCHEMA_VERSION);
    storeSnapshot(db, { documentId: SAMPLE_ROOM_ID, schemaVersion: SCHEMA_VERSION, state });
    doc.destroy();
  } else if (!fetchSnapshot(db, SAMPLE_ROOM_ID)) {
    throw new Error("Sample room exists without a binary snapshot.");
  }

  if (!sampleToken) {
    sampleToken = generateToken();
  }
  insertCapability(db, SAMPLE_ROOM_ID, hashToken(sampleToken));

  return { roomId: SAMPLE_ROOM_ID, token: sampleToken };
}

export function getSampleInvitation(): SampleRoom | undefined {
  return sampleToken ? { roomId: SAMPLE_ROOM_ID, token: sampleToken } : undefined;
}
