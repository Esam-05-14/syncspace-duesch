import { isRoomName } from "@syncspace/contracts";
import { tokensEqual } from "./tokens.js";

export function authorizeRoom(documentName: string, token: string, hashes: string[]): void {
  if (!isRoomName(documentName) || hashes.length === 0) {
    throw new Error("Unknown room.");
  }
  const ok = hashes.some((hash) => tokensEqual(token, hash));
  if (!ok) {
    throw new Error("Invalid room token.");
  }
}
