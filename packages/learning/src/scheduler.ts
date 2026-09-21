import { SCHEDULER_VERSION, createOpaqueId, type ReviewEvent, type ReviewPrompt, type ReviewSchedule } from "@syncspace/contracts";

export const BOX_INTERVALS_MS = {
  0: 10 * 60 * 1000,
  1: 24 * 60 * 60 * 1000,
  2: 3 * 24 * 60 * 60 * 1000,
  3: 7 * 24 * 60 * 60 * 1000,
  4: 14 * 24 * 60 * 60 * 1000,
  5: 30 * 24 * 60 * 60 * 1000,
} as const;

export const BOX_LABELS = {
  0: "10 min",
  1: "1 day",
  2: "3 days",
  3: "7 days",
  4: "14 days",
  5: "30 days",
} as const;

export type Box = 0 | 1 | 2 | 3 | 4 | 5;
export type Rating = "again" | "got-it";

export function describeBox(box: Box): string {
  return `box ${box} (${BOX_LABELS[box]})`;
}

export function describeDue(dueAt: string, now = new Date()): string {
  const due = Date.parse(dueAt);
  if (Number.isNaN(due)) {
    return dueAt;
  }
  const delta = due - now.getTime();
  if (delta <= 0) {
    return "due now";
  }
  if (delta < 60_000) {
    return "due in under a minute";
  }
  if (delta < 60 * 60 * 1000) {
    const minutes = Math.max(1, Math.round(delta / 60_000));
    return `due in ${minutes} min`;
  }
  if (delta < 36 * 60 * 60 * 1000) {
    const hours = Math.max(1, Math.round(delta / (60 * 60 * 1000)));
    return `due in ${hours} h`;
  }
  const days = Math.max(1, Math.round(delta / (24 * 60 * 60 * 1000)));
  return `due in ${days} d`;
}

export function nextBox(current: Box, rating: Rating): Box {
  if (rating === "again") {
    return 0;
  }
  return Math.min(5, current + 1) as Box;
}

export function dueAtFor(box: Box, now: Date): Date {
  return new Date(now.getTime() + BOX_INTERVALS_MS[box]);
}

export function enrollCard(input: {
  profileId: string;
  boardId: string;
  cardId: string;
  contentHash: string;
  now: Date;
  prompt?: ReviewPrompt;
}): ReviewSchedule {
  return {
    profileId: input.profileId,
    boardId: input.boardId,
    cardId: input.cardId,
    contentHash: input.contentHash,
    box: 0,
    dueAt: input.now.toISOString(),
    active: true,
    ...(input.prompt ? { prompt: input.prompt } : {}),
  };
}

export function applyRating(input: {
  schedule: ReviewSchedule;
  rating: Rating;
  now: Date;
  eventId?: string;
}): { schedule: ReviewSchedule; event: ReviewEvent } {
  const priorBox = input.schedule.box as Box;
  const resultingBox = nextBox(priorBox, input.rating);
  const due = dueAtFor(resultingBox, input.now);
  const schedule: ReviewSchedule = {
    ...input.schedule,
    box: resultingBox,
    dueAt: due.toISOString(),
    active: true,
  };
  const event: ReviewEvent = {
    eventId: input.eventId ?? createOpaqueId("evt"),
    profileId: input.schedule.profileId,
    boardId: input.schedule.boardId,
    cardId: input.schedule.cardId,
    contentHash: input.schedule.contentHash,
    rating: input.rating,
    priorBox,
    resultingBox,
    ratedAt: input.now.toISOString(),
    dueAt: due.toISOString(),
    schedulerVersion: SCHEDULER_VERSION,
  };
  return { schedule, event };
}

export function compareDue(a: ReviewSchedule, b: ReviewSchedule): number {
  const time = a.dueAt.localeCompare(b.dueAt);
  return time !== 0 ? time : a.cardId.localeCompare(b.cardId);
}

export function isDue(schedule: ReviewSchedule, now: Date): boolean {
  return schedule.active && Date.parse(schedule.dueAt) <= now.getTime();
}
