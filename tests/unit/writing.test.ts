import { describe, expect, it } from "vitest";
import { CORE_LEXICON, SENTENCE_TEMPLATES } from "@syncspace/content";
import {
  checkWordOrder,
  pickArticleFill,
  pickWordOrder,
  shuffleDeterministic,
  tokenizeGermanSentence,
} from "@syncspace/learning";

describe("writing drills", () => {
  it("picks a deterministic article-fill set for a day", () => {
    const first = pickArticleFill({ lexemes: CORE_LEXICON, day: "2026-09-22" });
    const second = pickArticleFill({ lexemes: CORE_LEXICON, day: "2026-09-22" });
    expect(first).toHaveLength(8);
    expect(first.map((row) => row.id)).toEqual(second.map((row) => row.id));
    expect(first.every((row) => row.article === "der" || row.article === "die" || row.article === "das")).toBe(
      true,
    );
  });

  it("tokenizes a clause and checks authored order", () => {
    expect(tokenizeGermanSentence("Das ist der Tisch.")).toEqual(["Das", "ist", "der", "Tisch", "."]);
    const expected = ["Ich", "habe", "den", "Tisch", "."];
    expect(checkWordOrder(expected, expected).ok).toBe(true);
    expect(checkWordOrder(["Ich", "Tisch", "habe", "den", "."], expected).ok).toBe(false);
    expect(checkWordOrder(expected, expected).expectedDe).toBe("Ich habe den Tisch.");
  });

  it("builds a deterministic word-order set from sentence patterns", () => {
    const first = pickWordOrder({
      lexemes: CORE_LEXICON,
      templates: SENTENCE_TEMPLATES,
      day: "2026-09-22",
    });
    const second = pickWordOrder({
      lexemes: CORE_LEXICON,
      templates: SENTENCE_TEMPLATES,
      day: "2026-09-22",
    });
    expect(first.length).toBeGreaterThanOrEqual(4);
    expect(first.map((row) => row.id)).toEqual(second.map((row) => row.id));
    expect(first.every((row) => row.tokens.length === row.expected.length)).toBe(true);
    expect(first.every((row) => checkWordOrder(row.expected, row.expected).ok)).toBe(true);
  });

  it("shuffles with a stable seed", () => {
    const tokens = ["Das", "ist", "der", "Tisch", "."];
    expect(shuffleDeterministic(tokens, "seed-a")).toEqual(shuffleDeterministic(tokens, "seed-a"));
  });
});
