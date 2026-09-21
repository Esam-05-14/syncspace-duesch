import type { CoreLexeme } from "@syncspace/contracts";
import { normalizeNfcTrim } from "./normalize.js";

export type MapHit = {
  lexeme: CoreLexeme;
  matchedOn: "en" | "alias" | "de";
};

export function normalizeLookup(input: string): string {
  return normalizeNfcTrim(input).toLocaleLowerCase("en-US");
}

function englishKeys(lexeme: CoreLexeme): string[] {
  return [lexeme.en, ...lexeme.aliases].map(normalizeLookup).filter(Boolean);
}

/** Deterministic English → German lookup over an authored corpus. */
export function mapEnglishToGerman(query: string, lexemes: readonly CoreLexeme[]): MapHit[] {
  const needle = normalizeLookup(query);
  if (needle.length < 1) {
    return [];
  }
  const hits: MapHit[] = [];
  for (const lexeme of lexemes) {
    if (englishKeys(lexeme).some((key) => key === needle || key.startsWith(needle))) {
      hits.push({ lexeme, matchedOn: englishKeys(lexeme).includes(needle) ? "en" : "alias" });
      continue;
    }
    if (normalizeLookup(lexeme.de) === needle) {
      hits.push({ lexeme, matchedOn: "de" });
    }
  }
  return hits.sort((a, b) => {
    const exactA = englishKeys(a.lexeme).includes(needle) || normalizeLookup(a.lexeme.de) === needle;
    const exactB = englishKeys(b.lexeme).includes(needle) || normalizeLookup(b.lexeme.de) === needle;
    if (exactA !== exactB) {
      return exactA ? -1 : 1;
    }
    return a.lexeme.de.localeCompare(b.lexeme.de, "de");
  });
}

export function lexemesByTopic(lexemes: readonly CoreLexeme[], topic: string): CoreLexeme[] {
  return lexemes.filter((lexeme) => lexeme.topic === topic);
}

export function articleMix(lexemes: readonly CoreLexeme[]): { der: number; die: number; das: number } {
  const mix = { der: 0, die: 0, das: 0 };
  for (const lexeme of lexemes) {
    if (lexeme.pos === "noun" && lexeme.article) {
      mix[lexeme.article] += 1;
    }
  }
  return mix;
}
