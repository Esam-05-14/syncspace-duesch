import { describe, expect, it } from "vitest";
import { CORE_LEXICON, SENTENCE_TEMPLATES } from "@syncspace/content";
import { accusativeDefinite, buildSentence } from "@syncspace/learning";

function lex(de: string) {
  const row = CORE_LEXICON.find((item) => item.de === de);
  if (!row) {
    throw new Error(`Missing ${de}`);
  }
  return row;
}

function template(kind: (typeof SENTENCE_TEMPLATES)[number]["kind"]) {
  const row = SENTENCE_TEMPLATES.find((item) => item.kind === kind);
  if (!row) {
    throw new Error(`Missing template ${kind}`);
  }
  return row;
}

describe("sentence builder", () => {
  it("builds identification and accusative have-frames", () => {
    expect(buildSentence({ template: template("ident"), noun: lex("Tisch") }).de).toBe("Das ist der Tisch.");
    expect(buildSentence({ template: template("have"), noun: lex("Tisch"), definite: true }).de).toBe(
      "Ich habe den Tisch.",
    );
    expect(buildSentence({ template: template("have"), noun: lex("Wohnung"), definite: false }).de).toBe(
      "Ich habe eine Wohnung.",
    );
    expect(accusativeDefinite("der")).toBe("den");
  });

  it("puts a transitive present-tense form before the object", () => {
    const built = buildSentence({
      template: template("action"),
      noun: lex("Apfel"),
      verb: lex("kaufen"),
      definite: true,
    });
    expect(built.de).toBe("Ich kaufe den Apfel.");
    expect(built.en.toLowerCase()).toContain("apple");
  });

  it("asks where with verb second after the W-word", () => {
    expect(buildSentence({ template: template("where"), noun: lex("Bahnhof") }).de).toBe("Wo ist der Bahnhof?");
  });
});
