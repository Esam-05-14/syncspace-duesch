import { describe, expect, it } from "vitest";
import { inquiryCorpus } from "@syncspace/content";
import { editDistance, foldGerman, inquire, parseInquiry } from "@syncspace/learning";

const corpus = inquiryCorpus();

describe("language inquiry", () => {
  it("folds ß and umlauts", () => {
    expect(foldGerman("Straße")).toBe("strasse");
    expect(foldGerman("Äpfel")).toBe("aepfel");
    expect(editDistance("tisch", "tich")).toBe(1);
  });

  it("parses article, topic, and pos operators", () => {
    expect(parseInquiry("der #food apfel")).toEqual({
      text: "apfel",
      folded: "apfel",
      article: "der",
      topic: "food",
      pos: null,
    });
    expect(parseInquiry("pos:verb gehen").pos).toBe("verb");
  });

  it("finds Straße from strasse and table from English", () => {
    const street = inquire("strasse", corpus);
    expect(street[0]?.titleDe).toBe("die Straße");
    expect(street[0]?.score).toBe(100);
    const table = inquire("table", corpus);
    expect(table[0]?.titleDe).toBe("der Tisch");
  });

  it("filters der nouns and food topic", () => {
    const derHits = inquire("der", corpus);
    expect(derHits.length).toBeGreaterThan(0);
    expect(derHits.every((hit) => hit.article === "der" && hit.kind === "word")).toBe(true);
    const food = inquire("#food apfel", corpus);
    expect(food[0]?.kind).toBe("word");
    expect(food[0]?.titleDe).toBe("der Apfel");
  });

  it("repairs a one-letter typo against the authored list", () => {
    const hits = inquire("tich", corpus);
    expect(hits.some((hit) => hit.titleDe === "der Tisch" && hit.matchedOn === "fuzzy-de")).toBe(true);
  });

  it("finds an extra draft practice lemma", () => {
    const hits = inquire("seife", corpus);
    expect(hits[0]?.titleDe).toBe("die Seife");
    expect(hits[0]?.exampleDe).toBe("Die Seife liegt neben dem Waschbecken.");
  });

  it("returns an empty list for a blank query", () => {
    expect(inquire("   ", corpus)).toEqual([]);
  });

  it("reaches a four-skills resource from listen", () => {
    const hits = inquire("listen", corpus);
    expect(hits.some((hit) => hit.kind === "skill" && hit.href === "/learn/skills")).toBe(true);
  });
});
