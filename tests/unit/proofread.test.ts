import { describe, expect, it } from "vitest";
import {
  applyProofreadFix,
  classifyDudenAdvice,
  classifyProofreadIssue,
  parseDudenResponse,
  parseLanguageToolResponse,
} from "@syncspace/learning";

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
    expect(report.engine).toBe("languagetool");
    expect(report.language).toContain("German");
    expect(report.matches[0]?.kind).toBe("spelling");
    expect(applyProofreadFix("Das is ein Test.", 4, 2, "ist")).toBe("Das ist ein Test.");
    expect(classifyProofreadIssue("grammar")).toBe("grammar");
  });

  it("refuses a stale offset", () => {
    expect(() => applyProofreadFix("Hi", 4, 2, "ist")).toThrow(/no longer matches/);
  });
});

describe("Duden response mapping", () => {
  it("maps spelling and comma advice from the official sample shape", () => {
    const report = parseDudenResponse({
      data: {
        spellAdvices: [
          {
            errorCode: "21",
            errorMessage: "Diese Schreibweise ist unbekannt.",
            shortMessage: "Dieses Wort korrigieren?",
            length: 5,
            offset: 4,
            originalError: "Schif",
            proposals: ["Schiff", "Schilf"],
            type: "orth",
          },
          {
            errorCode: "901",
            errorMessage: "Bitte prüfen Sie, ob ein Komma eingefügt werden muss.",
            shortMessage: "Hier ein Komma einfügen?",
            length: 11,
            offset: 45,
            originalError: "genannt ist",
            proposals: ["genannt, ist"],
            type: "comma insertion KI with >=0.8 and KI output",
          },
        ],
        styleAdvices: [
          {
            errorCode: "240",
            errorMessage: "Füllwort",
            shortMessage: "Kürzer?",
            length: 6,
            offset: 80,
            originalError: "eigentlich",
            proposals: [""],
            type: "style",
          },
        ],
      },
    });
    expect(report.engine).toBe("duden");
    expect(report.matches).toHaveLength(3);
    expect(report.matches[0]?.kind).toBe("spelling");
    expect(report.matches[0]?.replacements).toEqual(["Schiff", "Schilf"]);
    expect(report.matches[1]?.kind).toBe("grammar");
    expect(report.matches[2]?.kind).toBe("style");
    expect(classifyDudenAdvice("orth")).toBe("spelling");
  });
});
