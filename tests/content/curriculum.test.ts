import { describe, expect, it } from "vitest";
import { CORE_LEXICON, PHRASES, SKILL_RESOURCES, validateCurriculum } from "@syncspace/content";

describe("solo curriculum", () => {
  const curriculum = validateCurriculum();

  it("authors 500 unique draft lexemes", () => {
    expect(curriculum.lexemes).toHaveLength(500);
    const ids = curriculum.lexemes.map((row) => row.id);
    const headwords = curriculum.lexemes.map((row) => row.de.normalize("NFC"));
    expect(new Set(ids).size).toBe(500);
    expect(new Set(headwords).size).toBe(500);
    expect(curriculum.lexemes.every((row) => row.contentStatus === "draft")).toBe(true);
  });

  it("gives every noun a dictionary article", () => {
    const nouns = curriculum.lexemes.filter((row) => row.pos === "noun");
    expect(nouns.length).toBeGreaterThan(200);
    expect(nouns.every((row) => row.article === "der" || row.article === "die" || row.article === "das")).toBe(
      true,
    );
  });

  it("keeps required everyday lemmas", () => {
    const have = new Set(CORE_LEXICON.map((row) => row.de));
    for (const word of ["Haus", "Wohnung", "Tisch", "Buch", "Zug", "Apfel", "sein", "haben", "können"]) {
      expect(have.has(word)).toBe(true);
    }
  });

  it("keeps verbs with present-tense forms", () => {
    const verbs = curriculum.lexemes.filter((row) => row.pos === "verb");
    expect(verbs.length).toBe(80);
    expect(verbs.every((row) => row.forms?.ich && row.forms.du && row.forms.er)).toBe(true);
  });

  it("authors draft phrases and a full lesson path", () => {
    expect(PHRASES.length).toBeGreaterThanOrEqual(50);
    expect(PHRASES.every((row) => row.contentStatus === "draft")).toBe(true);
    expect(curriculum.letters).toHaveLength(30);
    expect(curriculum.roadmap).toHaveLength(10);
    expect(curriculum.grammar).toHaveLength(8);
  });

  it("lists https resources for all four skills", () => {
    const skills = new Set(SKILL_RESOURCES.map((row) => row.skill));
    expect([...skills].sort()).toEqual(["listen", "read", "speak", "write"]);
    expect(SKILL_RESOURCES.every((row) => row.url.startsWith("https://"))).toBe(true);
    expect(curriculum.skills).toHaveLength(SKILL_RESOURCES.length);
    expect(curriculum.lessons.some((row) => row.kind === "inquire")).toBe(true);
    expect(curriculum.lessons.some((row) => row.kind === "skills")).toBe(true);
  });
});
