import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import {
  applyMaterializedBoard,
  getCardsMap,
  materializeBoard,
  tombstoneCard,
  upsertNote,
  upsertVocabulary,
} from "@syncspace/collab";
import { boardExportSchema, type ReviewEvent } from "@syncspace/contracts";
import { createStarterBoard } from "@syncspace/content";

const PRIVATE_MARKERS = ["dueAt", "ratedAt", "schedulerVersion", "got-it", "eventId", "profileId"];

describe("private review stays off the shared board", () => {
  it("materialized shared state has no review-event fields", () => {
    const doc = new Y.Doc();
    applyMaterializedBoard(doc, createStarterBoard("board-privacy"));
    const privateEvent: ReviewEvent = {
      eventId: "evt_should-never-sync",
      profileId: "local-profile",
      boardId: "board-privacy",
      cardId: "voc_tisch",
      contentHash: "a".repeat(64),
      rating: "got-it",
      priorBox: 0,
      resultingBox: 1,
      ratedAt: "2026-09-21T12:00:00.000Z",
      dueAt: "2026-09-22T12:00:00.000Z",
      schedulerVersion: 1,
    };
    doc.getMap("reviewEvents").set(privateEvent.eventId, privateEvent);
    const tisch = getCardsMap(doc).get("voc_tisch");
    tisch?.set("dueAt", privateEvent.dueAt);
    tisch?.set("ratedAt", privateEvent.ratedAt);
    const json = JSON.stringify(materializeBoard(doc));
    expect(json.includes(privateEvent.eventId)).toBe(false);
    for (const marker of PRIVATE_MARKERS) {
      expect(json.includes(marker)).toBe(false);
    }
  });

  it("board JSON export excludes tokens, tombstones, and review ratings", () => {
    const doc = new Y.Doc();
    applyMaterializedBoard(doc, createStarterBoard("board-export"));
    tombstoneCard(doc, "voc_zug");
    upsertVocabulary(doc, {
      id: "voc_tisch",
      lexical: {
        partOfSpeech: "noun",
        article: "der",
        headword: "Tisch",
        plural: "Tische",
        glossEn: "table",
        exampleDe: "Der Tisch steht in der Küche.",
        tags: ["housing"],
      },
    });
    upsertNote(doc, { id: "note_intro", title: "Vorstellen" });
    const board = materializeBoard(doc);
    const { tombstones: _ignored, ...visible } = board;
    const exported = boardExportSchema.parse({
      ...visible,
      exportedAt: "2026-09-21T12:00:00.000Z",
      kind: "board-content-json",
    });
    const json = JSON.stringify(exported);
    expect(json.includes("token")).toBe(false);
    expect(json.includes("tombstones")).toBe(false);
    expect(json.includes("got-it")).toBe(false);
    expect(exported.kind).toBe("board-content-json");
  });
});
