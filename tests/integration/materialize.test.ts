import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { applyMaterializedBoard, materializeBoard, tombstoneCard, upsertNote, upsertVocabulary } from "@syncspace/collab";
import { createStarterBoard } from "@syncspace/content";

describe("canonical materialization", () => {
  it("sorts cards by id and drops presence", () => {
    const doc = new Y.Doc();
    applyMaterializedBoard(doc, createStarterBoard("board-test-one"));
    const board = materializeBoard(doc);
    const ids = board.cards.map((card) => card.id);
    expect([...ids].sort()).toEqual(ids);
  });

  it("keeps independent card edits", () => {
    const doc = new Y.Doc();
    applyMaterializedBoard(doc, createStarterBoard("board-test-two"));
    upsertVocabulary(doc, {
      id: "voc_tisch",
      lexical: {
        partOfSpeech: "noun",
        article: "der",
        headword: "Tisch",
        plural: "Tische",
        glossEn: "table (edited)",
        exampleDe: "Der Tisch steht in der Küche.",
        tags: ["housing"],
      },
    });
    upsertNote(doc, { id: "note_intro", title: "Vorstellen" });
    const board = materializeBoard(doc);
    const tisch = board.cards.find((card) => card.id === "voc_tisch");
    expect(tisch?.type === "vocabulary" && tisch.lexical.glossEn).toBe("table (edited)");
    expect(board.cards.some((card) => card.id === "note_intro")).toBe(true);
  });

  it("hides tombstoned cards and their connections", () => {
    const doc = new Y.Doc();
    applyMaterializedBoard(doc, createStarterBoard("board-test-three"));
    tombstoneCard(doc, "voc_zug");
    const board = materializeBoard(doc);
    expect(board.cards.some((card) => card.id === "voc_zug")).toBe(false);
    expect(board.connections.some((connection) => connection.toId === "voc_zug")).toBe(false);
    expect(board.tombstones.some((tombstone) => tombstone.id === "voc_zug")).toBe(true);
  });

  it("merges two inserts into the same note via Y.Text", () => {
    const left = new Y.Doc();
    const right = new Y.Doc();
    applyMaterializedBoard(left, createStarterBoard("board-test-note"));
    Y.applyUpdate(right, Y.encodeStateAsUpdate(left));
    const leftNote = left.getMap("cards").get("note_intro")?.get("note") as Y.Text;
    const rightNote = right.getMap("cards").get("note_intro")?.get("note") as Y.Text;
    leftNote.insert(leftNote.length, "\nLinks.");
    rightNote.insert(rightNote.length, "\nRechts.");
    Y.applyUpdate(left, Y.encodeStateAsUpdate(right));
    Y.applyUpdate(right, Y.encodeStateAsUpdate(left));
    expect(materializeBoard(left)).toEqual(materializeBoard(right));
    const text = (materializeBoard(left).cards.find((card) => card.id === "note_intro") as { text: string }).text;
    expect(text.includes("Links.")).toBe(true);
    expect(text.includes("Rechts.")).toBe(true);
  });
});
