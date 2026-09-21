import { z } from "zod";

export const partOfSpeechSchema = z.enum(["noun", "verb", "other"]);
export const contentStatusSchema = z.enum(["draft", "reviewed"]);
export const cardTypeSchema = z.enum(["vocabulary", "note", "exercise", "resource"]);
export const exerciseKindSchema = z.enum(["article-recall", "gap-fill", "token-order"]);
export const articleSchema = z.enum(["der", "die", "das"]);
export const connectionKindSchema = z.enum(["example-of", "related-to"]);

export const positionSchema = z.object({
  x: z.number().min(-4000).max(4000),
  y: z.number().min(-4000).max(4000),
});

export const lexicalValueSchema = z.object({
  partOfSpeech: partOfSpeechSchema,
  article: articleSchema.nullable(),
  headword: z.string().min(1).max(120),
  plural: z.string().max(120).nullable(),
  glossEn: z.string().min(1).max(200),
  exampleDe: z.string().min(1).max(400),
  tags: z.array(z.string().max(32)).max(8),
});

export const vocabularyCardSchema = z.object({
  id: z.string().min(6).max(80),
  type: z.literal("vocabulary"),
  levelTag: z.string().max(16).default("A1"),
  contentStatus: contentStatusSchema,
  position: positionSchema,
  lexical: lexicalValueSchema,
  createdAt: z.string().datetime({ offset: true }).or(z.string().min(10)),
});

export const noteCardSchema = z.object({
  id: z.string().min(6).max(80),
  type: z.literal("note"),
  title: z.string().min(1).max(160),
  levelTag: z.string().max(16).default("A1"),
  contentStatus: contentStatusSchema,
  position: positionSchema,
  text: z.string().max(10_000),
  createdAt: z.string().min(10),
});

export const articleRecallExerciseSchema = z.object({
  kind: z.literal("article-recall"),
  prompt: z.string().min(1).max(240),
  noun: z.string().min(1).max(120),
  acceptedArticles: z.array(articleSchema).min(1).max(1),
  explanation: z.string().min(1).max(800),
  normalization: z.literal("nfc-trim-lower"),
});

export const exerciseDefinitionSchema = articleRecallExerciseSchema;

export const exerciseCardSchema = z.object({
  id: z.string().min(6).max(80),
  type: z.literal("exercise"),
  levelTag: z.string().max(16).default("A1"),
  contentStatus: contentStatusSchema,
  position: positionSchema,
  exercise: exerciseDefinitionSchema,
  contentHash: z.string().length(64),
  createdAt: z.string().min(10),
});

export const resourceCardSchema = z.object({
  id: z.string().min(6).max(80),
  type: z.literal("resource"),
  title: z.string().min(1).max(160),
  url: z
    .string()
    .url()
    .refine((value) => value.startsWith("https://"), "Only https: resource links are allowed."),
  contentStatus: contentStatusSchema,
  position: positionSchema,
  createdAt: z.string().min(10),
});

export const cardSchema = z.discriminatedUnion("type", [
  vocabularyCardSchema,
  noteCardSchema,
  exerciseCardSchema,
  resourceCardSchema,
]);

export const connectionSchema = z.object({
  id: z.string().min(6).max(80),
  fromId: z.string().min(6),
  toId: z.string().min(6),
  kind: connectionKindSchema,
});

export const tombstoneSchema = z.object({
  id: z.string().min(6),
  deletedAt: z.string().min(10),
});

export type LexicalValue = z.infer<typeof lexicalValueSchema>;
export type VocabularyCard = z.infer<typeof vocabularyCardSchema>;
export type NoteCard = z.infer<typeof noteCardSchema>;
export type ExerciseCard = z.infer<typeof exerciseCardSchema>;
export type ResourceCard = z.infer<typeof resourceCardSchema>;
export type Card = z.infer<typeof cardSchema>;
export type Connection = z.infer<typeof connectionSchema>;
export type Tombstone = z.infer<typeof tombstoneSchema>;
