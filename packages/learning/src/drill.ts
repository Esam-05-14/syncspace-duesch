import type { CoreLexeme, Phrase } from "@syncspace/contracts";

export type DrillItem = {
  id: string;
  kind: "word" | "phrase";
  frontDe: string;
  backEn: string;
  detailEn: string;
  article?: "der" | "die" | "das" | null;
  speakText: string;
  lexemeId?: string;
};

function dayRank(id: string, day: string): number {
  let hash = 0;
  const seed = `${day}:${id}`;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (Math.imul(hash, 31) + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function toWordItem(lexeme: CoreLexeme): DrillItem {
  return {
    id: lexeme.id,
    kind: "word",
    frontDe: lexeme.article ? `${lexeme.article} ${lexeme.de}` : lexeme.de,
    backEn: lexeme.en,
    detailEn: lexeme.hookEn,
    article: lexeme.article,
    speakText: lexeme.de,
    lexemeId: lexeme.id,
  };
}

function toPhraseItem(phrase: Phrase): DrillItem {
  return {
    id: phrase.id,
    kind: "phrase",
    frontDe: phrase.de,
    backEn: phrase.en,
    detailEn: phrase.situationEn,
    speakText: phrase.de,
  };
}

/** Deterministic daily cover set. Due nouns first, then a stable mix of words and phrases. */
export function pickDrillSession(input: {
  lexemes: readonly CoreLexeme[];
  phrases: readonly Phrase[];
  dueCardIds?: readonly string[];
  day?: string;
  limit?: number;
}): DrillItem[] {
  const day = input.day ?? new Date().toISOString().slice(0, 10);
  const limit = input.limit ?? 8;
  const wordSlots = Math.min(5, limit);
  const phraseSlots = Math.max(0, limit - wordSlots);
  const dueIds = input.dueCardIds ?? [];
  const dueSet = new Set(dueIds);
  const nouns = input.lexemes.filter((row) => row.pos === "noun" && row.article);

  const dueWords = dueIds
    .map((id) => nouns.find((row) => row.id === id))
    .filter((row): row is CoreLexeme => Boolean(row));
  const restWords = nouns
    .filter((row) => !dueSet.has(row.id))
    .sort((left, right) => dayRank(left.id, day) - dayRank(right.id, day) || left.de.localeCompare(right.de, "de"));
  const words = [...dueWords, ...restWords].slice(0, wordSlots).map(toWordItem);

  const phrases = [...input.phrases]
    .sort((left, right) => dayRank(left.id, day) - dayRank(right.id, day) || left.de.localeCompare(right.de, "de"))
    .slice(0, phraseSlots)
    .map(toPhraseItem);

  return [...words, ...phrases].slice(0, limit);
}
