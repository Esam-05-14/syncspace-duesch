import { z } from "zod";
import { SCHEMA_VERSION } from "../ids.js";
import { cardSchema, connectionSchema, tombstoneSchema } from "./cards.js";

export const boardModeSchema = z.enum(["standalone", "shared"]);

export const materializedBoardSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  boardId: z.string().min(3).max(80),
  title: z.string().min(1).max(160),
  levelTag: z.string().max(16),
  mode: boardModeSchema,
  cards: z.array(cardSchema).max(150),
  connections: z.array(connectionSchema).max(300),
  tombstones: z.array(tombstoneSchema).max(400),
});

export type MaterializedBoard = z.infer<typeof materializedBoardSchema>;

export const boardExportSchema = materializedBoardSchema.omit({ tombstones: true }).extend({
  exportedAt: z.string().min(10),
  kind: z.literal("board-content-json"),
});

export type BoardExport = z.infer<typeof boardExportSchema>;
