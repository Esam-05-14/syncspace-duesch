import { describe, expect, it } from "vitest";
import { CORE_LEXICON, SENTENCE_TEMPLATES, WEIL_CLAUSES } from "@syncspace/content";
import {
  checkAccusativeForm,
  checkWordOrder,
  pickAccusativeFill,
  pickArticleFill,
  pickWeilClause,
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
    expect(tokenizeGermanSentence("Ich lerne Deutsch, weil ich in Berlin wohne.")).toEqual([
      "Ich",
      "lerne",
      "Deutsch",
      ",",
      "weil",
      "ich",
      "in",
      "Berlin",
      "wohne",
      ".",
    ]);
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

  it("picks a deterministic accusative-fill set after haben", () => {
    const first = pickAccusativeFill({ lexemes: CORE_LEXICON, day: "2026-09-22" });
    const second = pickAccusativeFill({ lexemes: CORE_LEXICON, day: "2026-09-22" });
    expect(first).toHaveLength(8);
    expect(first.map((row) => row.id)).toEqual(second.map((row) => row.id));
    const masculine = first.find((row) => row.dictionaryArticle === "der");
    expect(masculine?.accepted).toBe("den");
    expect(masculine?.expectedDe).toBe(`Ich habe den ${masculine?.nounDe}.`);
    const tisch = CORE_LEXICON.find((row) => row.de === "Tisch");
    expect(tisch).toBeTruthy();
    expect(
      pickAccusativeFill({ lexemes: [tisch!], day: "2026-09-22", limit: 1 })[0]?.expectedDe,
    ).toBe("Ich habe den Tisch.");
    expect(checkAccusativeForm("den", "den").ok).toBe(true);
    expect(checkAccusativeForm("der", "den").ok).toBe(false);
  });

  it("picks a deterministic weil-clause set with the verb last", () => {
    const first = pickWeilClause({ clauses: WEIL_CLAUSES, day: "2026-09-22" });
    const second = pickWeilClause({ clauses: WEIL_CLAUSES, day: "2026-09-22" });
    expect(first.length).toBeGreaterThanOrEqual(6);
    expect(first.map((row) => row.id)).toEqual(second.map((row) => row.id));
    expect(first.every((row) => row.expectedDe.includes("weil"))).toBe(true);
    expect(first.every((row) => checkWordOrder(row.expected, row.expected).ok)).toBe(true);
    const lernen = WEIL_CLAUSES.find((row) => row.id === "weil-lerne-wohne");
    expect(lernen?.expectedDe).toBe("Ich lerne Deutsch, weil ich in Berlin wohne.");
    const tokens = tokenizeGermanSentence(lernen!.expectedDe);
    expect(tokens[tokens.length - 2]).toBe("wohne");
  });

  it("shuffles with a stable seed", () => {
    const tokens = ["Das", "ist", "der", "Tisch", "."];
    expect(shuffleDeterministic(tokens, "seed-a")).toEqual(shuffleDeterministic(tokens, "seed-a"));
  });
});
