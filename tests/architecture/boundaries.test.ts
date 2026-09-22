import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function read(relative: string): string {
  return readFileSync(join(root, relative), "utf8");
}

describe("package boundaries", () => {
  it("personal-store never imports Hocuspocus, the provider, or Y.Doc", () => {
    const source = [
      read("packages/personal-store/src/db.ts"),
      read("packages/personal-store/src/review.ts"),
      read("packages/personal-store/src/registry.ts"),
      read("packages/personal-store/src/index.ts"),
      read("packages/personal-store/src/progress.ts"),
      read("packages/personal-store/src/inquiry.ts"),
      read("packages/personal-store/src/session.ts"),
      read("packages/personal-store/src/lectures.ts"),
    ].join("\n");
    expect(source.includes("hocuspocus")).toBe(false);
    expect(source.includes("yjs")).toBe(false);
    expect(source.includes("Y.Doc")).toBe(false);
  });

  it("learning never accepts or imports a Y.Doc", () => {
    const source = [
      read("packages/learning/src/scheduler.ts"),
      read("packages/learning/src/article-recall.ts"),
      read("packages/learning/src/normalize.ts"),
      read("packages/learning/src/index.ts"),
      read("packages/learning/src/mapper.ts"),
      read("packages/learning/src/sentence-builder.ts"),
      read("packages/learning/src/inquire.ts"),
      read("packages/learning/src/drill.ts"),
      read("packages/learning/src/media.ts"),
      read("packages/learning/src/proofread.ts"),
    ].join("\n");
    expect(source.includes("yjs")).toBe(false);
    expect(source.includes("Y.Doc")).toBe(false);
  });

  it("sync-server never imports personal browser storage", () => {
    const source = [
      read("apps/sync-server/src/index.ts"),
      read("apps/sync-server/src/sync/server.ts"),
      read("apps/sync-server/src/documents/rooms.ts"),
      read("apps/sync-server/src/persistence/sqlite.ts"),
      read("apps/sync-server/src/auth/authorize.ts"),
      read("apps/sync-server/src/auth/tokens.ts"),
    ].join("\n");
    expect(source.includes("@syncspace/personal-store")).toBe(false);
    expect(/\bfrom ["']idb["']/.test(source)).toBe(false);
    expect(source.includes("indexedDB")).toBe(false);
  });
});
