import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex } from "@noble/hashes/utils";

/** Stable JSON used for content hashes. Sorts object keys recursively. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) {
      sorted[key] = sortValue(record[key]);
    }
    return sorted;
  }
  return value;
}

export function contentHash(value: unknown): string {
  return bytesToHex(sha256(canonicalJson(value)));
}

export function sha256Text(text: string): string {
  return bytesToHex(sha256(text));
}
