import { describe, expect, it } from "vitest";
import { CORE_LEXICON, PHRASES } from "@syncspace/content";
import { pickDrillSession } from "@syncspace/learning";

describe("cover drill session", () => {
  it("is deterministic for a given day", () => {
    const first = pickDrillSession({ lexemes: CORE_LEXICON, phrases: PHRASES, day: "2026-09-21" });
    const second = pickDrillSession({ lexemes: CORE_LEXICON, phrases: PHRASES, day: "2026-09-21" });
    expect(first).toHaveLength(8);
    expect(first.map((row) => row.id)).toEqual(second.map((row) => row.id));
    expect(first.filter((row) => row.kind === "word")).toHaveLength(5);
    expect(first.filter((row) => row.kind === "phrase")).toHaveLength(3);
  });

  it("puts due nouns first", () => {
    const apfel = CORE_LEXICON.find((row) => row.de === "Apfel");
    expect(apfel).toBeTruthy();
    const session = pickDrillSession({
      lexemes: CORE_LEXICON,
      phrases: PHRASES,
      dueCardIds: [apfel?.id ?? ""],
      day: "2026-09-21",
    });
    expect(session[0]?.speakText).toBe("Apfel");
    expect(session[0]?.article).toBe("der");
  });
});
