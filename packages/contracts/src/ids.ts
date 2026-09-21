const ROOM_NAME = /^[a-z0-9][a-z0-9-]{2,63}$/;

function randomUuid(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function createOpaqueId(prefix?: string): string {
  const id = randomUuid();
  return prefix ? `${prefix}_${id}` : id;
}

export function isRoomName(value: string): boolean {
  return ROOM_NAME.test(value);
}

export function assertRoomName(value: string): string {
  if (!isRoomName(value)) {
    throw new Error("Room names must match [a-z0-9][a-z0-9-]{2,63}.");
  }
  return value;
}

export const SAMPLE_ROOM_ID = "room-alltag-a1b1";
export const SCHEMA_VERSION = "1.0.0";
export const SCHEDULER_VERSION = 1;
