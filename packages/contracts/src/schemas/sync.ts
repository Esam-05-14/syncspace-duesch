import { z } from "zod";

export const syncEventCategorySchema = z.enum([
  "local-restore",
  "authorized",
  "connection-lost",
  "reconnect-attempt",
  "remote-update",
  "initial-sync",
  "checkpoint",
  "storage-failure",
  "offline-local-changes",
]);

export const syncEventSchema = z.object({
  id: z.string(),
  at: z.string(),
  category: syncEventCategorySchema,
  detail: z.string().max(240),
});

export const checkpointReceiptSchema = z.object({
  documentId: z.string(),
  sequence: z.number().int().min(1),
  serverTime: z.string(),
  digest: z.string().length(64).optional(),
});

export type SyncEvent = z.infer<typeof syncEventSchema>;
export type CheckpointReceipt = z.infer<typeof checkpointReceiptSchema>;
