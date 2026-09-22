import { z } from "zod";
import { articleSchema } from "./cards.js";

export const LECTURE_BOARD_ID = "lecture-notes";

export const lectureSourceKindSchema = z.enum(["youtube", "vimeo", "page"]);
export const lectureFactKindSchema = z.enum(["word", "phrase", "fact"]);

export const lectureFactSchema = z.object({
  id: z.string().min(6).max(80),
  kind: lectureFactKindSchema,
  de: z.string().min(1).max(200),
  en: z.string().max(200),
  article: articleSchema.nullable(),
  note: z.string().max(400),
});

export const lectureNoteSchema = z.object({
  id: z.string().min(6).max(80),
  title: z.string().min(1).max(160),
  sourceUrl: z
    .string()
    .url()
    .refine((value) => value.startsWith("https://"), "Only https: lecture links are allowed."),
  sourceKind: lectureSourceKindSchema,
  videoId: z.string().max(32).nullable(),
  notes: z.string().max(20000),
  facts: z.array(lectureFactSchema).max(80),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type LectureSourceKind = z.infer<typeof lectureSourceKindSchema>;
export type LectureFactKind = z.infer<typeof lectureFactKindSchema>;
export type LectureFact = z.infer<typeof lectureFactSchema>;
export type LectureNote = z.infer<typeof lectureNoteSchema>;
