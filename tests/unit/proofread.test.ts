import { describe, expect, it } from "vitest";
import { applyProofreadFix, classifyProofreadIssue, parseLanguageToolResponse } from "@syncspace/learning";

describe("LanguageTool response mapping", () => {
  it("maps a misspelling and applies the first suggestion", () => {
    const report = parseLanguageToolResponse({
      language: { name: "German (Germany)", code: "de-DE" },
      matches: [
        {
          message: "Möglicher Tippfehler gefunden.",
          shortMessage: "Rechtschreibfehler",
          offset: 4,
          length: 2,
          context: { text: "Das is ein Test." },
          replacements: [{ value: "ist" }],
          rule: { id: "GERMAN_SPELLER_RULE", issueType: "misspelling" },
        },
      ],
    });
    expect(report.language).toContain("German");
    expect(report.matches[0]?.kind).toBe("spelling");
    expect(applyProofreadFix("Das is ein Test.", 4, 2, "ist")).toBe("Das ist ein Test.");
    expect(classifyProofreadIssue("grammar")).toBe("grammar");
  });

  it("refuses a stale offset", () => {
    expect(() => applyProofreadFix("Hi", 4, 2, "ist")).toThrow(/no longer matches/);
  });
});
