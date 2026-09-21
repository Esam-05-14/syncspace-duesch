import { describe, expect, it } from "vitest";
import { CORE_LEXICON } from "@syncspace/content";
import { articleMix, mapEnglishToGerman, normalizeLookup } from "@syncspace/learning";

describe("English to German mapper", () => {
  it("maps an English gloss to the authored lemma", () => {
    const hits = mapEnglishToGerman("table", CORE_LEXICON);
    expect(hits[0]?.lexeme.de).toBe("Tisch");
    expect(hits[0]?.lexeme.article).toBe("der");
    expect(hits[0]?.lexeme.hookEn.length).toBeGreaterThan(8);
  });

  it("accepts an alias and NFC / case folding", () => {
    const hits = mapEnglishToGerman("  Flat ", CORE_LEXICON);
    expect(hits.some((hit) => hit.lexeme.de === "Wohnung")).toBe(true);
    expect(normalizeLookup("  Flat ")).toBe("flat");
  });

  it("does not invent a miss", () => {
    expect(mapEnglishToGerman("xylophone-not-in-list", CORE_LEXICON)).toEqual([]);
  });

  it("counts dictionary articles in the core list", () => {
    const mix = articleMix(CORE_LEXICON);
    expect(mix.der + mix.die + mix.das).toBe(CORE_LEXICON.filter((row) => row.pos === "noun").length);
    expect(mix.der).toBeGreaterThan(0);
    expect(mix.die).toBeGreaterThan(0);
    expect(mix.das).toBeGreaterThan(0);
  });
});
