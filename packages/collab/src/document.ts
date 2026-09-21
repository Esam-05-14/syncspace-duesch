import {
  SCHEMA_VERSION,
  createOpaqueId,
  type Card,
  type Connection,
  type LexicalValue,
  type MaterializedBoard,
} from "@syncspace/contracts";
import * as Y from "yjs";

export function getMetaMap(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap("meta");
}

export function getCardsMap(doc: Y.Doc): Y.Map<Y.Map<unknown>> {
  return doc.getMap("cards");
}

export function getConnectionsMap(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap("connections");
}

export function getTombstonesMap(doc: Y.Doc): Y.Map<unknown> {
  return doc.getMap("tombstones");
}

export function initBoardDoc(
  doc: Y.Doc,
  input: {
    boardId: string;
    title: string;
    levelTag?: string;
    mode: "standalone" | "shared";
  },
): void {
  doc.transact(() => {
    const meta = getMetaMap(doc);
    if (meta.get("boardId")) {
      return;
    }
    meta.set("boardId", input.boardId);
    meta.set("schemaVersion", SCHEMA_VERSION);
    meta.set("title", input.title);
    meta.set("levelTag", input.levelTag ?? "A1");
    meta.set("mode", input.mode);
    meta.set("createdAt", new Date().toISOString());
    getCardsMap(doc);
    getConnectionsMap(doc);
    getTombstonesMap(doc);
  }, "syncspace-init");
}

export function setBoardTitle(doc: Y.Doc, title: string): void {
  doc.transact(() => {
    getMetaMap(doc).set("title", title);
  }, "syncspace-meta");
}

function baseCardMap(card: {
  id: string;
  type: Card["type"];
  levelTag?: string;
  contentStatus?: "draft" | "reviewed";
  position: { x: number; y: number };
}): Y.Map<unknown> {
  const map = new Y.Map<unknown>();
  map.set("id", card.id);
  map.set("type", card.type);
  map.set("levelTag", card.levelTag ?? "A1");
  map.set("contentStatus", card.contentStatus ?? "draft");
  map.set("position", card.position);
  map.set("createdAt", new Date().toISOString());
  return map;
}

export function upsertVocabulary(
  doc: Y.Doc,
  input: {
    id?: string;
    lexical: LexicalValue;
    position?: { x: number; y: number };
    levelTag?: string;
  },
): string {
  const id = input.id ?? createOpaqueId("voc");
  const tombstones = getTombstonesMap(doc);
  if (tombstones.has(id)) {
    throw new Error("Cannot reuse a tombstoned card id.");
  }
  doc.transact(() => {
    const cards = getCardsMap(doc);
    const existing = cards.get(id);
    if (existing) {
      existing.set("lexical", JSON.stringify(input.lexical));
      if (input.position) {
        existing.set("position", input.position);
      }
      return;
    }
    const map = baseCardMap({
      id,
      type: "vocabulary",
      levelTag: input.levelTag,
      position: input.position ?? { x: 48, y: 48 },
    });
    map.set("lexical", JSON.stringify(input.lexical));
    cards.set(id, map);
  }, "syncspace-lexical");
  return id;
}

export function upsertNote(
  doc: Y.Doc,
  input: {
    id?: string;
    title: string;
    text?: string;
    position?: { x: number; y: number };
    levelTag?: string;
  },
): string {
  const id = input.id ?? createOpaqueId("note");
  if (getTombstonesMap(doc).has(id)) {
    throw new Error("Cannot reuse a tombstoned card id.");
  }
  doc.transact(() => {
    const cards = getCardsMap(doc);
    const existing = cards.get(id);
    if (existing) {
      existing.set("title", input.title);
      if (input.position) {
        existing.set("position", input.position);
      }
      return;
    }
    const map = baseCardMap({
      id,
      type: "note",
      levelTag: input.levelTag,
      position: input.position ?? { x: 80, y: 80 },
    });
    map.set("title", input.title);
    const text = new Y.Text();
    if (input.text) {
      text.insert(0, input.text);
    }
    map.set("note", text);
    cards.set(id, map);
  }, "syncspace-note");
  return id;
}

export function getNoteText(doc: Y.Doc, cardId: string): Y.Text | null {
  const card = getCardsMap(doc).get(cardId);
  const note = card?.get("note");
  return note instanceof Y.Text ? note : null;
}

export function upsertExercise(
  doc: Y.Doc,
  input: Extract<Card, { type: "exercise" }>,
): string {
  if (getTombstonesMap(doc).has(input.id)) {
    throw new Error("Cannot reuse a tombstoned card id.");
  }
  doc.transact(() => {
    const map = baseCardMap(input);
    map.set("exercise", JSON.stringify(input.exercise));
    map.set("contentHash", input.contentHash);
    getCardsMap(doc).set(input.id, map);
  }, "syncspace-exercise");
  return input.id;
}

export function upsertResource(
  doc: Y.Doc,
  input: { id?: string; title: string; url: string; position?: { x: number; y: number } },
): string {
  const id = input.id ?? createOpaqueId("res");
  if (getTombstonesMap(doc).has(id)) {
    throw new Error("Cannot reuse a tombstoned card id.");
  }
  doc.transact(() => {
    const map = baseCardMap({
      id,
      type: "resource",
      position: input.position ?? { x: 120, y: 120 },
    });
    map.set("title", input.title);
    map.set("url", input.url);
    getCardsMap(doc).set(id, map);
  }, "syncspace-resource");
  return id;
}

export function addConnection(doc: Y.Doc, connection: Connection): void {
  doc.transact(() => {
    getConnectionsMap(doc).set(connection.id, connection);
  }, "syncspace-connection");
}

export function tombstoneCard(doc: Y.Doc, cardId: string): void {
  doc.transact(() => {
    getTombstonesMap(doc).set(cardId, {
      id: cardId,
      deletedAt: new Date().toISOString(),
    });
  }, "syncspace-tombstone");
}

export function applyMaterializedBoard(doc: Y.Doc, board: MaterializedBoard): void {
  doc.transact(() => {
    initBoardDoc(doc, {
      boardId: board.boardId,
      title: board.title,
      levelTag: board.levelTag,
      mode: board.mode,
    });
    const meta = getMetaMap(doc);
    meta.set("title", board.title);
    meta.set("levelTag", board.levelTag);
    meta.set("mode", board.mode);
    for (const card of board.cards) {
      if (card.type === "vocabulary") {
        upsertVocabulary(doc, card);
      } else if (card.type === "note") {
        upsertNote(doc, card);
      } else if (card.type === "exercise") {
        upsertExercise(doc, card);
      } else {
        upsertResource(doc, card);
      }
    }
    for (const connection of board.connections) {
      addConnection(doc, connection);
    }
    for (const tombstone of board.tombstones) {
      getTombstonesMap(doc).set(tombstone.id, tombstone);
    }
  }, "syncspace-seed");
}
