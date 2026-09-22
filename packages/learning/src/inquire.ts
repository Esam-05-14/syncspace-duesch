import type {
  CoreLexeme,
  GrammarTopic,
  Letter,
  LexemePos,
  Phoneme,
  Phrase,
  SkillResource,
  SourceCitation,
} from "@syncspace/contracts";
import { normalizeNfcTrim } from "./normalize.js";

export type InquiryKind = "word" | "phrase" | "grammar" | "sound" | "letter" | "source" | "skill";

export type ParsedInquiry = {
  text: string;
  folded: string;
  article: "der" | "die" | "das" | null;
  topic: string | null;
  pos: LexemePos | null;
};

export type InquiryHit = {
  id: string;
  kind: InquiryKind;
  titleDe: string;
  titleEn: string;
  detailEn: string;
  score: number;
  matchedOn: string;
  href: string;
  article?: "der" | "die" | "das" | null;
  speakText?: string;
  exampleDe?: string;
  lexemeId?: string;
};

export type InquiryCorpus = {
  lexemes: readonly CoreLexeme[];
  phrases: readonly Phrase[];
  grammar: readonly GrammarTopic[];
  phonemes: readonly Phoneme[];
  letters: readonly Letter[];
  sources: readonly SourceCitation[];
  skills?: readonly SkillResource[];
};

const POS_VALUES = new Set<LexemePos>(["noun", "verb", "adj", "adv", "prep", "conj", "pron", "num", "other"]);

const KIND_RANK: Record<InquiryKind, number> = {
  word: 0,
  phrase: 1,
  grammar: 2,
  sound: 3,
  letter: 4,
  skill: 5,
  source: 6,
};

function compareHits(a: InquiryHit, b: InquiryHit): number {
  return b.score - a.score || KIND_RANK[a.kind] - KIND_RANK[b.kind] || a.titleDe.localeCompare(b.titleDe, "de");
}

/** Fold umlauts so strasse hits Straße and uebung hits Übung. */
export function foldGerman(input: string): string {
  return normalizeNfcTrim(input)
    .toLocaleLowerCase("de-DE")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss");
}

export function parseInquiry(raw: string): ParsedInquiry {
  const tokens = normalizeNfcTrim(raw).split(/\s+/).filter(Boolean);
  let article: ParsedInquiry["article"] = null;
  let topic: string | null = null;
  let pos: LexemePos | null = null;
  const kept: string[] = [];
  for (const token of tokens) {
    const lower = token.toLocaleLowerCase("de-DE");
    if ((lower === "der" || lower === "die" || lower === "das") && !article) {
      article = lower;
      continue;
    }
    if (lower.startsWith("#") && lower.length > 1) {
      topic = lower.slice(1);
      continue;
    }
    if (lower.startsWith("topic:")) {
      topic = lower.slice(6);
      continue;
    }
    if (lower.startsWith("pos:") && POS_VALUES.has(lower.slice(4) as LexemePos)) {
      pos = lower.slice(4) as LexemePos;
      continue;
    }
    if (POS_VALUES.has(lower as LexemePos) && tokens.length > 1) {
      pos = lower as LexemePos;
      continue;
    }
    kept.push(token);
  }
  const text = kept.join(" ");
  return { text, folded: foldGerman(text), article, topic, pos };
}

function scoreField(hay: string, needle: string, foldedNeedle: string): number {
  if (!needle) {
    return 0;
  }
  const plain = foldGerman(hay);
  if (plain === foldedNeedle) {
    return 100;
  }
  if (plain.startsWith(foldedNeedle)) {
    return 82;
  }
  if (plain.includes(foldedNeedle)) {
    return 48;
  }
  return 0;
}

function bestScore(fields: Array<[string, string]>, needle: string, folded: string): { score: number; matchedOn: string } {
  let score = 0;
  let matchedOn = "";
  for (const [field, label] of fields) {
    const next = scoreField(field, needle, folded);
    if (next > score) {
      score = next;
      matchedOn = label;
    }
  }
  return { score, matchedOn };
}

export function editDistance(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  const aLength = a.length;
  const bLength = b.length;
  if (Math.abs(aLength - bLength) > 2) {
    return 3;
  }
  const previous = Array.from({ length: bLength + 1 }, (_, index) => index);
  const current = new Array<number>(bLength + 1);
  for (let i = 1; i <= aLength; i += 1) {
    current[0] = i;
    const code = a.charCodeAt(i - 1);
    for (let j = 1; j <= bLength; j += 1) {
      const cost = code === b.charCodeAt(j - 1) ? 0 : 1;
      current[j] = Math.min((previous[j] ?? 0) + 1, (current[j - 1] ?? 0) + 1, (previous[j - 1] ?? 0) + cost);
    }
    for (let j = 0; j <= bLength; j += 1) {
      previous[j] = current[j] ?? 0;
    }
  }
  return previous[bLength] ?? 3;
}

function fuzzyScore(hay: string, foldedNeedle: string): number {
  const foldedHay = foldGerman(hay);
  const allowed = foldedNeedle.length >= 6 ? 2 : 1;
  const distance = editDistance(foldedHay, foldedNeedle);
  if (distance === 0 || distance > allowed) {
    return 0;
  }
  return distance === 1 ? 30 : 22;
}

function pushHit(hits: InquiryHit[], hit: InquiryHit, limit: number): void {
  if (hit.score <= 0) {
    return;
  }
  hits.push(hit);
  if (hits.length > limit * 3) {
    hits.sort(compareHits);
    hits.length = limit;
  }
}

function lexemeHit(lexeme: CoreLexeme, score: number, matchedOn: string): InquiryHit {
  return {
    id: lexeme.id,
    kind: "word",
    titleDe: lexeme.article ? `${lexeme.article} ${lexeme.de}` : lexeme.de,
    titleEn: lexeme.en,
    detailEn: lexeme.hookEn,
    score,
    matchedOn,
    href: `/learn/words?q=${encodeURIComponent(lexeme.de)}`,
    article: lexeme.article,
    speakText: lexeme.de,
    exampleDe: lexeme.exampleDe,
    lexemeId: lexeme.id,
  };
}

/** Deterministic cross-record lookup. No model, no remote dictionary. */
export function inquire(raw: string, corpus: InquiryCorpus, limit = 24): InquiryHit[] {
  const parsed = parseInquiry(raw);
  const hasText = parsed.folded.length > 0;
  const hasFilter = Boolean(parsed.article || parsed.topic || parsed.pos);
  if (!hasText && !hasFilter) {
    return [];
  }
  const hits: InquiryHit[] = [];
  const needle = parsed.text;
  const folded = parsed.folded;

  for (const lexeme of corpus.lexemes) {
    if (parsed.article && lexeme.article !== parsed.article) {
      continue;
    }
    if (parsed.topic && lexeme.topic !== parsed.topic) {
      continue;
    }
    if (parsed.pos && lexeme.pos !== parsed.pos) {
      continue;
    }
    const ranked = hasText
      ? bestScore(
          [
            [lexeme.de, "de"],
            [lexeme.en, "en"],
            ...lexeme.aliases.map((alias) => [alias, "alias"] as [string, string]),
            [lexeme.plural ?? "", "plural"],
            [lexeme.ipa, "ipa"],
            [lexeme.hookEn, "hook"],
          ],
          needle,
          folded,
        )
      : { score: 36, matchedOn: "filter" };
    pushHit(hits, lexemeHit(lexeme, ranked.score, ranked.matchedOn), limit);
  }

  if (!parsed.article && !parsed.pos) {
    for (const phrase of corpus.phrases) {
      if (parsed.topic && phrase.topic !== parsed.topic) {
        continue;
      }
      const ranked = hasText
        ? bestScore(
            [
              [phrase.de, "de"],
              [phrase.en, "en"],
              [phrase.situationEn, "situation"],
              [phrase.notesEn, "notes"],
            ],
            needle,
            folded,
          )
        : parsed.topic && phrase.topic === parsed.topic
          ? { score: 36, matchedOn: "filter" }
          : { score: 0, matchedOn: "" };
      pushHit(hits, {
        id: phrase.id,
        kind: "phrase",
        titleDe: phrase.de,
        titleEn: phrase.en,
        detailEn: phrase.situationEn,
        score: ranked.score,
        matchedOn: ranked.matchedOn,
        href: "/learn/phrases",
        speakText: phrase.de,
      }, limit);
    }

    for (const topic of corpus.grammar) {
      const ranked = hasText
        ? bestScore(
            [
              [topic.titleEn, "title"],
              [topic.summaryEn, "summary"],
              [topic.exampleDe, "example"],
              [topic.pointsEn.join(" "), "points"],
            ],
            needle,
            folded,
          )
        : { score: 0, matchedOn: "" };
      pushHit(hits, {
        id: topic.id,
        kind: "grammar",
        titleDe: topic.exampleDe,
        titleEn: topic.titleEn,
        detailEn: topic.summaryEn,
        score: ranked.score,
        matchedOn: ranked.matchedOn,
        href: "/learn/grammar",
        speakText: topic.exampleDe,
      }, limit);
    }

    for (const phoneme of corpus.phonemes) {
      const ranked = hasText
        ? bestScore(
            [
              [phoneme.ipa, "ipa"],
              [phoneme.spelling, "spelling"],
              [phoneme.exampleDe, "example"],
              [phoneme.approxEn, "approx"],
            ],
            needle,
            folded,
          )
        : { score: 0, matchedOn: "" };
      pushHit(hits, {
        id: phoneme.id,
        kind: "sound",
        titleDe: `/${phoneme.ipa}/ ${phoneme.exampleDe}`,
        titleEn: phoneme.exampleEn,
        detailEn: phoneme.noteEn,
        score: ranked.score,
        matchedOn: ranked.matchedOn,
        href: "/learn/sounds",
        speakText: phoneme.exampleDe,
      }, limit);
    }

    for (const letter of corpus.letters) {
      const ranked = hasText
        ? bestScore(
            [
              [letter.letter, "letter"],
              [letter.nameDe, "name"],
              [letter.exampleDe, "example"],
              [letter.exampleEn, "en"],
            ],
            needle,
            folded,
          )
        : { score: 0, matchedOn: "" };
      pushHit(hits, {
        id: `letter-${letter.letter}`,
        kind: "letter",
        titleDe: `${letter.letter} (${letter.nameDe})`,
        titleEn: letter.exampleEn,
        detailEn: letter.noteEn,
        score: ranked.score,
        matchedOn: ranked.matchedOn,
        href: "/learn/alphabet",
        speakText: `${letter.letter}. ${letter.exampleDe}.`,
      }, limit);
    }

    for (const source of corpus.sources) {
      const ranked = hasText
        ? bestScore(
            [
              [source.title, "title"],
              [source.useEn, "use"],
            ],
            needle,
            folded,
          )
        : { score: 0, matchedOn: "" };
      pushHit(hits, {
        id: source.id,
        kind: "source",
        titleDe: source.title,
        titleEn: source.title,
        detailEn: source.useEn,
        score: ranked.score,
        matchedOn: ranked.matchedOn,
        href: "/learn/sources",
      }, limit);
    }

    for (const skill of corpus.skills ?? []) {
      const ranked = hasText
        ? bestScore(
            [
              [skill.title, "title"],
              [skill.skill, "skill"],
              [skill.useEn, "use"],
            ],
            needle,
            folded,
          )
        : { score: 0, matchedOn: "" };
      pushHit(hits, {
        id: skill.id,
        kind: "skill",
        titleDe: skill.title,
        titleEn: skill.skill,
        detailEn: skill.useEn,
        score: ranked.score,
        matchedOn: ranked.matchedOn,
        href: "/learn/skills",
      }, limit);
    }
  }

  if (hasText && hits.every((hit) => hit.score < 48)) {
    for (const lexeme of corpus.lexemes) {
      if (parsed.article && lexeme.article !== parsed.article) {
        continue;
      }
      if (parsed.topic && lexeme.topic !== parsed.topic) {
        continue;
      }
      if (parsed.pos && lexeme.pos !== parsed.pos) {
        continue;
      }
      const deScore = fuzzyScore(lexeme.de, folded);
      const enScore = fuzzyScore(lexeme.en, folded);
      const score = Math.max(deScore, enScore);
      if (score > 0) {
        pushHit(hits, lexemeHit(lexeme, score, deScore >= enScore ? "fuzzy-de" : "fuzzy-en"), limit);
      }
    }
  }

  return hits.sort(compareHits).slice(0, limit);
}
