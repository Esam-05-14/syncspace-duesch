import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function tokensEqual(plain: string, storedHash: string): boolean {
  const hashed = hashToken(plain);
  const a = Buffer.from(hashed, "hex");
  const b = Buffer.from(storedHash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}
