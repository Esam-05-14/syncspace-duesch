import { z } from "zod";
import { SCHEDULER_VERSION } from "../ids.js";

export const ratingSchema = z.enum(["again", "got-it"]);

export const reviewEventSchema = z.object({
  eventId: z.string().min(8).max(80),
  profileId: z.string().min(4).max(80),
  boardId: z.string().min(3).max(80),
  cardId: z.string().min(6).max(80),
  contentHash: z.string().length(64),
  rating: ratingSchema,
  priorBox: z.number().int().min(0).max(5),
  resultingBox: z.number().int().min(0).max(5),
  ratedAt: z.string().min(10),
  dueAt: z.string().min(10),
  schedulerVersion: z.literal(SCHEDULER_VERSION),
});

export const reviewScheduleSchema = z.object({
  profileId: z.string(),
  boardId: z.string(),
  cardId: z.string().min(6).max(80),
  contentHash: z.string().length(64),
  box: z.number().int().min(0).max(5),
  dueAt: z.string().min(10),
  active: z.boolean(),
});

export const personalReviewBackupSchema = z.object({
  kind: z.literal("personal-review-backup"),
  profileId: z.string(),
  exportedAt: z.string(),
  events: z.array(reviewEventSchema),
  schedules: z.array(reviewScheduleSchema),
});

export type ReviewEvent = z.infer<typeof reviewEventSchema>;
export type ReviewSchedule = z.infer<typeof reviewScheduleSchema>;
export type PersonalReviewBackup = z.infer<typeof personalReviewBackupSchema>;
