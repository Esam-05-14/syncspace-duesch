import {
  coreLexemeSchema,
  grammarTopicSchema,
  lessonSchema,
  letterSchema,
  phonemeSchema,
  phraseSchema,
  roadmapStationSchema,
  sentenceTemplateSchema,
  skillResourceSchema,
  sourceCitationSchema,
  type CoreLexeme,
} from "@syncspace/contracts";
import { ALPHABET } from "./alphabet.js";
import { GRAMMAR_TOPICS } from "./grammar.js";
import { LESSONS, ROADMAP, SENTENCE_TEMPLATES } from "./lessons.js";
import { EXTRA_LEXICON, PRACTICE_LEXICON } from "./extra-practice.js";
import { CORE_LEXICON } from "./lexicon.js";
import { PHRASES } from "./phrases.js";
import { SKILL_RESOURCES } from "./skills.js";
import { PHONEMES } from "./sounds.js";
import { CURRICULUM_SOURCES } from "./sources.js";

export { ALPHABET } from "./alphabet.js";
export { GRAMMAR_TOPICS } from "./grammar.js";
export { LESSONS, ROADMAP, SENTENCE_TEMPLATES } from "./lessons.js";
export { EXTRA_LEXICON, PRACTICE_LEXICON, WEIL_CLAUSES, type WeilClause } from "./extra-practice.js";
export { CORE_LEXICON } from "./lexicon.js";
export { PHRASES } from "./phrases.js";
export { PHONEMES } from "./sounds.js";
export { CURRICULUM_SOURCES } from "./sources.js";
export { SKILL_GUIDES, SKILL_RESOURCES } from "./skills.js";

export const CURRICULUM_REVIEW =
  "All lesson records are original draft teaching material. No human German-language review has been recorded. Official Goethe and Deutsche Welle pages stay on their own sites.";

export type ValidatedCurriculum = {
  lexemes: CoreLexeme[];
  phrases: typeof PHRASES;
  letters: typeof ALPHABET;
  phonemes: typeof PHONEMES;
  grammar: typeof GRAMMAR_TOPICS;
  lessons: typeof LESSONS;
  roadmap: typeof ROADMAP;
  skills: typeof SKILL_RESOURCES;
};

export function inquiryCorpus() {
  return {
    lexemes: PRACTICE_LEXICON,
    phrases: PHRASES,
    grammar: GRAMMAR_TOPICS,
    phonemes: PHONEMES,
    letters: ALPHABET,
    sources: CURRICULUM_SOURCES,
    skills: SKILL_RESOURCES,
  };
}

export function validateCurriculum(): ValidatedCurriculum {
  const lexemes = CORE_LEXICON.map((row) => coreLexemeSchema.parse(row));
  const phrases = PHRASES.map((row) => phraseSchema.parse(row));
  const letters = ALPHABET.map((row) => letterSchema.parse(row));
  const phonemes = PHONEMES.map((row) => phonemeSchema.parse(row));
  const grammar = GRAMMAR_TOPICS.map((row) => grammarTopicSchema.parse(row));
  const lessons = LESSONS.map((row) => lessonSchema.parse(row));
  const roadmap = ROADMAP.map((row) => roadmapStationSchema.parse(row));
  const skills = SKILL_RESOURCES.map((row) => skillResourceSchema.parse(row));
  CURRICULUM_SOURCES.forEach((row) => sourceCitationSchema.parse(row));
  SENTENCE_TEMPLATES.forEach((row) => sentenceTemplateSchema.parse(row));
  EXTRA_LEXICON.forEach((row) => coreLexemeSchema.parse(row));
  return { lexemes, phrases, letters, phonemes, grammar, lessons, roadmap, skills };
}

export function lexiconTopics(): string[] {
  return [...new Set(PRACTICE_LEXICON.map((row) => row.topic))].sort((a, b) => a.localeCompare(b));
}
