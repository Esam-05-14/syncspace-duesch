import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

function trackedFiles(): string[] {
  return execSync("git ls-files", { cwd: root, encoding: "utf8" })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

describe("fresh-clone audit", () => {
  it("does not track secrets, sqlite data, or live tokens", () => {
    const files = trackedFiles();
    expect(files).toContain(".env.example");
    expect(files).toContain(".gitignore");
    expect(files).toContain("SECURITY.md");
    const secretEnv = files.filter(
      (file) => (file === ".env" || file.startsWith(".env.")) && file !== ".env.example",
    );
    expect(secretEnv).toEqual([]);
    expect(files.some((file) => file.startsWith("data/") || file.endsWith(".sqlite"))).toBe(false);
    const ignore = readFileSync(join(root, ".gitignore"), "utf8");
    expect(ignore.includes(".env")).toBe(true);
    expect(ignore.includes("data/")).toBe(true);
  });

  it("example env does not contain a sample token value", () => {
    const example = readFileSync(join(root, ".env.example"), "utf8");
    expect(example.includes("SYNCSPACE_SAMPLE_TOKEN=")).toBe(true);
    expect(/SYNCSPACE_SAMPLE_TOKEN=[^\s#]+/.test(example)).toBe(false);
  });
});
