import { z } from "zod";
import { articleSchema, contentStatusSchema } from "./cards.js";

export const CURRICULUM_BOARD_ID = "lesson-core";

export const lexemePosSchema = z.enum([
  "noun",
  "verb",
  "adj",
  "adv",
  "prep",
  "conj",
  "pron",
  "num",
  "other",
]);

export const verbFormsSchema = z.object({
  ich: z.string().min(1).max(40),
  du: z.string().min(1).max(40),
  er: z.string().min(1).max(40),
  wir: z.string().min(1).max(40),
  ihr: z.string().min(1).max(40),
  sie: z.string().min(1).max(40),
});

export const coreLexemeSchema = z.object({
  id: z.string().min(6).max(80),
  pos: lexemePosSchema,
  article: articleSchema.nullable(),
  de: z.string().min(1).max(80),
  plural: z.string().max(80).nullable(),
  en: z.string().min(1).max(200),
  aliases: z.array(z.string().max(80)).max(8),
  ipa: z.string().min(1).max(120),
  topic: z.string().min(1).max(32),
  exampleDe: z.string().min(1).max(400),
  exampleEn: z.string().min(1).max(400),
  hookEn: z.string().min(1).max(280),
  forms: verbFormsSchema.optional(),
  transitive: z.boolean().optional(),
  contentStatus: z.literal("draft"),
});

export const phraseSchema = z.object({
  id: z.string().min(6).max(80),
  de: z.string().min(1).max(160),
  en: z.string().min(1).max(240),
  ipa: z.string().min(1).max(200),
  topic: z.string().min(1).max(32),
  situationEn: z.string().min(1).max(240),
  notesEn: z.string().min(1).max(400),
  contentStatus: z.literal("draft"),
});

export const letterSchema = z.object({
  letter: z.string().min(1).max(2),
  nameDe: z.string().min(1).max(24),
  nameIpa: z.string().min(1).max(24),
  exampleDe: z.string().min(1).max(40),
  exampleEn: z.string().min(1).max(80),
  noteEn: z.string().min(1).max(280),
});

export const phonemeSchema = z.object({
  id: z.string().min(3).max(40),
  ipa: z.string().min(1).max(16),
  spelling: z.string().min(1).max(40),
  kind: z.enum(["vowel", "diphthong", "consonant"]),
  exampleDe: z.string().min(1).max(40),
  exampleEn: z.string().min(1).max(80),
  approxEn: z.string().min(1).max(120),
  noteEn: z.string().min(1).max(400),
  frontness: z.number().min(0).max(1).optional(),
  height: z.number().min(0).max(1).optional(),
});

export const grammarTopicSchema = z.object({
  id: z.string().min(6).max(80),
  titleEn: z.string().min(1).max(120),
  summaryEn: z.string().min(1).max(400),
  pointsEn: z.array(z.string().min(1).max(400)).min(2).max(10),
  table: z
    .object({
      headers: z.array(z.string().min(1).max(40)).min(2).max(6),
      rows: z.array(z.array(z.string().min(1).max(80)).min(2).max(6)).min(1).max(16),
    })
    .optional(),
  exampleDe: z.string().min(1).max(200),
  exampleEn: z.string().min(1).max(200),
});

export const lessonKindSchema = z.enum([
  "alphabet",
  "sounds",
  "words",
  "phrases",
  "grammar",
  "mapper",
  "builder",
  "sources",
]);

export const lessonSchema = z.object({
  id: z.string().min(6).max(80),
  titleEn: z.string().min(1).max(120),
  kind: lessonKindSchema,
  summaryEn: z.string().min(1).max(400),
  minutes: z.number().int().min(5).max(40),
});

export const roadmapStationSchema = z.object({
  id: z.string().min(6).max(80),
  order: z.number().int().min(1).max(20),
  lessonId: z.string().min(6).max(80),
  titleEn: z.string().min(1).max(120),
  goalEn: z.string().min(1).max(240),
});

export const sourceCitationSchema = z.object({
  id: z.string().min(6).max(80),
  title: z.string().min(1).max(160),
  url: z
    .string()
    .url()
    .refine((value) => value.startsWith("https://"), "Only https: resource links are allowed."),
  useEn: z.string().min(1).max(320),
});

export const sentenceTemplateSchema = z.object({
  id: z.string().min(6).max(80),
  titleEn: z.string().min(1).max(120),
  explanationEn: z.string().min(1).max(400),
  kind: z.enum(["ident", "have", "adj", "place", "action", "where"]),
});

export type LexemePos = z.infer<typeof lexemePosSchema>;
export type VerbForms = z.infer<typeof verbFormsSchema>;
export type CoreLexeme = z.infer<typeof coreLexemeSchema>;
export type Phrase = z.infer<typeof phraseSchema>;
export type Letter = z.infer<typeof letterSchema>;
export type Phoneme = z.infer<typeof phonemeSchema>;
export type GrammarTopic = z.infer<typeof grammarTopicSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type RoadmapStation = z.infer<typeof roadmapStationSchema>;
export type SourceCitation = z.infer<typeof sourceCitationSchema>;
export type SentenceTemplate = z.infer<typeof sentenceTemplateSchema>;
export type ContentStatus = z.infer<typeof contentStatusSchema>;
