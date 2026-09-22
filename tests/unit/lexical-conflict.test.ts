import { describe, expect, it } from "vitest";
import { detectLostLexicalDraft, lexicalJson } from "@syncspace/collab";
import type { LexicalValue } from "@syncspace/contracts";

const tisch: LexicalValue = {
  partOfSpeech: "noun",
  article: "der",
  headword: "Tisch",
  plural: "Tische",
  glossEn: "table",
  exampleDe: "Der Tisch steht in der Küche.",
  tags: [],
};

const tischDie: LexicalValue = { ...tisch, article: "die" };
const tischGloss: LexicalValue = { ...tisch, glossEn: "desk" };

describe("lexical last-writer-wins draft", () => {
  it("keeps the dirty local form when the remote card moved", () => {
    const lost = detectLostLexicalDraft({
      baselineJson: lexicalJson(tisch),
      localForm: tischDie,
      remoteLexical: tischGloss,
    });
    expect(lost).toEqual({ kind: "lww", localDraft: tischDie, remoteAccepted: tischGloss });
  });

  it("does nothing when the form is still the baseline", () => {
    expect(
      detectLostLexicalDraft({
        baselineJson: lexicalJson(tisch),
        localForm: tisch,
        remoteLexical: tischGloss,
      }),
    ).toBeNull();
  });

  it("does nothing when the remote card is unchanged", () => {
    expect(
      detectLostLexicalDraft({
        baselineJson: lexicalJson(tisch),
        localForm: tischDie,
        remoteLexical: tisch,
      }),
    ).toBeNull();
  });

  it("treats a missing card as a tombstone win", () => {
    expect(
      detectLostLexicalDraft({
        baselineJson: lexicalJson(tisch),
        localForm: tischDie,
        remoteLexical: null,
      }),
    ).toEqual({ kind: "tombstone", localDraft: tischDie });
  });
});
