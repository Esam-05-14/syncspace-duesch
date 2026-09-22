import type { LexicalValue } from "@syncspace/contracts";

export type LostLexicalDraft =
  | { kind: "lww"; localDraft: LexicalValue; remoteAccepted: LexicalValue }
  | { kind: "tombstone"; localDraft: LexicalValue };

export function lexicalJson(value: LexicalValue): string {
  return JSON.stringify({
    partOfSpeech: value.partOfSpeech,
    article: value.article ?? null,
    headword: value.headword,
    plural: value.plural ?? null,
    glossEn: value.glossEn,
    exampleDe: value.exampleDe,
    tags: [...(value.tags ?? [])],
  });
}

/**
 * Last-writer-wins on the atomic lexical JSON. If this tab still has a dirty form
 * and the remote card moved, keep the losing local form so the UI can show it.
 */
export function detectLostLexicalDraft(input: {
  baselineJson: string;
  localForm: LexicalValue;
  remoteLexical: LexicalValue | null;
}): LostLexicalDraft | null {
  const localJson = lexicalJson(input.localForm);
  if (localJson === input.baselineJson) {
    return null;
  }
  if (input.remoteLexical === null) {
    return { kind: "tombstone", localDraft: input.localForm };
  }
  const remoteJson = lexicalJson(input.remoteLexical);
  if (remoteJson === input.baselineJson || remoteJson === localJson) {
    return null;
  }
  return {
    kind: "lww",
    localDraft: input.localForm,
    remoteAccepted: input.remoteLexical,
  };
}
