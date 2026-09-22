import type { CoreLexeme, SentenceTemplate } from "@syncspace/contracts";
import { accusativeDefinite, buildSentence } from "./sentence-builder.js";
import { normalizeArticleAnswer } from "./normalize.js";

export type ArticleFillItem = {
  id: string;
  kind: "article-fill";
  nounDe: string;
  glossEn: string;
  article: "der" | "die" | "das";
  exampleDe: string;
  lexemeId: string;
};

export type AccusativeFillItem = {
  id: string;
  kind: "accusative-fill";
  nounDe: string;
  glossEn: string;
  dictionaryArticle: "der" | "die" | "das";
  accepted: string;
  frameDe: string;
  expectedDe: string;
  noteEn: string;
  lexemeId: string;
};

export type WordOrderItem = {
  id: string;
  kind: "word-order";
  tokens: string[];
  expected: string[];
  expectedDe: string;
  expectedEn: string;
  notes: string[];
};

function dayRank(id: string, day: string): number {
  let hash = 0;
  const seed = `${day}:${id}`;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (Math.imul(hash, 31) + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function tokenizeGermanSentence(de: string): string[] {
  const parts = de.normalize("NFC").trim().split(/\s+/).filter(Boolean);
  const tokens: string[] = [];
  for (const part of parts) {
    const match = /^(.*?)([.?!])$/.exec(part);
    const word = match?.[1];
    const mark = match?.[2];
    if (word && mark) {
      tokens.push(word, mark);
    } else {
      tokens.push(part);
    }
  }
  return tokens;
}

export function shuffleDeterministic<T>(items: readonly T[], seed: string): T[] {
  const next = [...items];
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (Math.imul(hash, 31) + seed.charCodeAt(index)) >>> 0;
  }
  for (let index = next.length - 1; index > 0; index -= 1) {
    hash = (Math.imul(hash, 1664525) + 1013904223) >>> 0;
    const swap = hash % (index + 1);
    const left = next[index];
    const right = next[swap];
    if (left === undefined || right === undefined) {
      continue;
    }
    next[index] = right;
    next[swap] = left;
  }
  return next;
}

function scrambleTokens(expected: readonly string[], seed: string): string[] {
  let tokens = shuffleDeterministic(expected, seed);
  for (let attempt = 1; attempt < 8 && tokens.join("\0") === expected.join("\0"); attempt += 1) {
    tokens = shuffleDeterministic(expected, `${seed}:${attempt}`);
  }
  return tokens;
}

/** Deterministic article blanks from authored nouns. */
export function pickArticleFill(input: {
  lexemes: readonly CoreLexeme[];
  day?: string;
  limit?: number;
}): ArticleFillItem[] {
  const day = input.day ?? new Date().toISOString().slice(0, 10);
  const limit = input.limit ?? 8;
  return input.lexemes
    .filter((row) => row.pos === "noun" && row.article)
    .slice()
    .sort((left, right) => dayRank(left.id, day) - dayRank(right.id, day) || left.de.localeCompare(right.de, "de"))
    .slice(0, limit)
    .map((row) => ({
      id: `fill:${row.id}`,
      kind: "article-fill" as const,
      nounDe: row.de,
      glossEn: row.en,
      article: row.article!,
      exampleDe: row.exampleDe,
      lexemeId: row.id,
    }));
}

/** Deterministic accusative blanks after haben. Only der → den changes. */
export function pickAccusativeFill(input: {
  lexemes: readonly CoreLexeme[];
  day?: string;
  limit?: number;
}): AccusativeFillItem[] {
  const day = input.day ?? new Date().toISOString().slice(0, 10);
  const limit = input.limit ?? 8;
  return input.lexemes
    .filter((row) => row.pos === "noun" && row.article)
    .slice()
    .sort(
      (left, right) =>
        dayRank(left.id, `acc:${day}`) - dayRank(right.id, `acc:${day}`) || left.de.localeCompare(right.de, "de"),
    )
    .slice(0, limit)
    .map((row) => {
      const accepted = accusativeDefinite(row.article!);
      return {
        id: `acc:${row.id}`,
        kind: "accusative-fill" as const,
        nounDe: row.de,
        glossEn: row.en,
        dictionaryArticle: row.article!,
        accepted,
        frameDe: `Ich habe ___ ${row.de}.`,
        expectedDe: `Ich habe ${accepted} ${row.de}.`,
        noteEn: "After haben the noun is accusative. Only masculine der becomes den.",
        lexemeId: row.id,
      };
    });
}

export function checkAccusativeForm(raw: string, accepted: string): {
  ok: boolean;
  submitted: string;
  accepted: string;
} {
  const submitted = normalizeArticleAnswer(raw);
  const expected = normalizeArticleAnswer(accepted);
  return { ok: submitted === expected, submitted, accepted: expected };
}

/** Deterministic word-order items from finite sentence patterns. */
export function pickWordOrder(input: {
  lexemes: readonly CoreLexeme[];
  templates: readonly SentenceTemplate[];
  day?: string;
  limit?: number;
}): WordOrderItem[] {
  const day = input.day ?? new Date().toISOString().slice(0, 10);
  const limit = input.limit ?? 6;
  const nouns = input.lexemes
    .filter((row) => row.pos === "noun" && row.article)
    .slice()
    .sort((left, right) => dayRank(left.id, `noun:${day}`) - dayRank(right.id, `noun:${day}`) || left.de.localeCompare(right.de, "de"));
  const adjectives = input.lexemes
    .filter((row) => row.pos === "adj")
    .slice()
    .sort((left, right) => dayRank(left.id, `adj:${day}`) - dayRank(right.id, `adj:${day}`) || left.de.localeCompare(right.de, "de"));
  const verbs = input.lexemes
    .filter((row) => row.pos === "verb" && row.forms && row.transitive !== false)
    .slice()
    .sort((left, right) => dayRank(left.id, `verb:${day}`) - dayRank(right.id, `verb:${day}`) || left.de.localeCompare(right.de, "de"));

  const items: WordOrderItem[] = [];
  for (let index = 0; index < limit; index += 1) {
    const template = input.templates[index % input.templates.length];
    const noun = nouns[index % Math.max(nouns.length, 1)];
    if (!template || !noun) {
      break;
    }
    const adjective = adjectives[index % Math.max(adjectives.length, 1)];
    const verb = verbs[index % Math.max(verbs.length, 1)];
    try {
      const built = buildSentence({
        template,
        noun,
        adjective: template.kind === "adj" ? adjective : undefined,
        verb: template.kind === "action" ? verb : undefined,
        definite: index % 2 === 0,
      });
      const expected = tokenizeGermanSentence(built.de);
      items.push({
        id: `order:${day}:${template.id}:${noun.id}:${index}`,
        kind: "word-order",
        tokens: scrambleTokens(expected, `${day}:${template.id}:${noun.id}:${index}`),
        expected,
        expectedDe: built.de,
        expectedEn: built.en,
        notes: built.notes,
      });
    } catch {
      continue;
    }
  }
  return items;
}

export function checkWordOrder(
  submitted: readonly string[],
  expected: readonly string[],
): { ok: boolean; submittedDe: string; expectedDe: string } {
  const submittedDe = submitted.join(" ").replace(/\s+([.?!])/g, "$1");
  const expectedDe = expected.join(" ").replace(/\s+([.?!])/g, "$1");
  return { ok: submitted.join("\0") === expected.join("\0"), submittedDe, expectedDe };
}
