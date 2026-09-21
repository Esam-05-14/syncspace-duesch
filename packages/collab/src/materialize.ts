import {
  SCHEMA_VERSION,
  cardSchema,
  connectionSchema,
  contentHash,
  materializedBoardSchema,
  type Card,
  type Connection,
  type MaterializedBoard,
  type Tombstone,
} from "@syncspace/contracts";
import * as Y from "yjs";
import { getCardsMap, getConnectionsMap, getMetaMap, getTombstonesMap } from "./document.js";

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asPosition(value: unknown): { x: number; y: number } {
  if (value && typeof value === "object" && "x" in value && "y" in value) {
    const rec = value as { x: unknown; y: unknown };
    return {
      x: typeof rec.x === "number" ? rec.x : 0,
      y: typeof rec.y === "number" ? rec.y : 0,
    };
  }
  return { x: 0, y: 0 };
}

function cardFromMap(map: Y.Map<unknown>): Card | null {
  const type = map.get("type");
  const id = asString(map.get("id"));
  if (!id) {
    return null;
  }
  const base = {
    id,
    levelTag: asString(map.get("levelTag"), "A1"),
    contentStatus: asString(map.get("contentStatus"), "draft") as "draft" | "reviewed",
    position: asPosition(map.get("position")),
    createdAt: asString(map.get("createdAt"), new Date().toISOString()),
  };
  try {
    if (type === "vocabulary") {
      const lexicalRaw = map.get("lexical");
      const lexical = typeof lexicalRaw === "string" ? JSON.parse(lexicalRaw) : lexicalRaw;
      return cardSchema.parse({ ...base, type: "vocabulary", lexical });
    }
    if (type === "note") {
      const note = map.get("note");
      const text = note instanceof Y.Text ? note.toString() : asString(note);
      return cardSchema.parse({ ...base, type: "note", title: asString(map.get("title"), "Notiz"), text });
    }
    if (type === "exercise") {
      const exerciseRaw = map.get("exercise");
      const exercise = typeof exerciseRaw === "string" ? JSON.parse(exerciseRaw) : exerciseRaw;
      return cardSchema.parse({
        ...base,
        type: "exercise",
        exercise,
        contentHash: asString(map.get("contentHash")),
      });
    }
    if (type === "resource") {
      return cardSchema.parse({
        ...base,
        type: "resource",
        title: asString(map.get("title"), "Link"),
        url: asString(map.get("url")),
      });
    }
  } catch {
    return null;
  }
  return null;
}

export function materializeBoard(doc: Y.Doc): MaterializedBoard {
  const meta = getMetaMap(doc);
  const tombstoneEntries = [...getTombstonesMap(doc).entries()]
    .map(([id, value]) => {
      const rec = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
      return { id, deletedAt: asString(rec.deletedAt, "") } satisfies Tombstone;
    })
    .sort((a, b) => a.id.localeCompare(b.id));
  const hidden = new Set(tombstoneEntries.map((item) => item.id));

  const cards: Card[] = [];
  for (const [id, map] of getCardsMap(doc).entries()) {
    if (hidden.has(id)) {
      continue;
    }
    const card = cardFromMap(map);
    if (card) {
      cards.push(card);
    }
  }
  cards.sort((a, b) => a.id.localeCompare(b.id));

  const visible = new Set(cards.map((card) => card.id));
  const connections: Connection[] = [];
  for (const [, value] of getConnectionsMap(doc).entries()) {
    const parsed = connectionSchema.safeParse(value);
    if (!parsed.success) {
      continue;
    }
    if (hidden.has(parsed.data.fromId) || hidden.has(parsed.data.toId)) {
      continue;
    }
    if (!visible.has(parsed.data.fromId) || !visible.has(parsed.data.toId)) {
      continue;
    }
    connections.push(parsed.data);
  }
  connections.sort((a, b) => a.id.localeCompare(b.id));

  return materializedBoardSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    boardId: asString(meta.get("boardId"), "unknown-board"),
    title: asString(meta.get("title"), "Untitled lesson"),
    levelTag: asString(meta.get("levelTag"), "A1"),
    mode: asString(meta.get("mode"), "standalone") === "shared" ? "shared" : "standalone",
    cards,
    connections,
    tombstones: tombstoneEntries,
  });
}

export function materializeDigest(board: MaterializedBoard): string {
  return contentHash({
    schemaVersion: board.schemaVersion,
    boardId: board.boardId,
    title: board.title,
    cards: board.cards,
    connections: board.connections,
    tombstones: board.tombstones,
  });
}
