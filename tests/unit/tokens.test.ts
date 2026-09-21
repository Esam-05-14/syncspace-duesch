import { describe, expect, it } from "vitest";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

describe("capability hashing", () => {
  it("stores a hash, not the token", () => {
    const token = randomBytes(32).toString("hex");
    const hashed = hashToken(token);
    expect(hashed).toHaveLength(64);
    expect(hashed).not.toBe(token);
  });

  it("compares hashed values in constant-length buffers", () => {
    const token = "abc";
    const a = Buffer.from(hashToken(token), "hex");
    const b = Buffer.from(hashToken(token), "hex");
    expect(timingSafeEqual(a, b)).toBe(true);
  });
});
