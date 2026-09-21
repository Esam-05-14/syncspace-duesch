import { createOpaqueId, type SyncEvent } from "@syncspace/contracts";

type SyncCategory = SyncEvent["category"];

const MAX = 80;

export function createSyncEvent(category: SyncCategory, detail: string): SyncEvent {
  return {
    id: createOpaqueId("sync"),
    at: new Date().toISOString(),
    category,
    detail,
  };
}

export function pushEvent(events: SyncEvent[], event: SyncEvent): SyncEvent[] {
  return [...events, event].slice(-MAX);
}
