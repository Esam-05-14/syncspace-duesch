import type { ReviewEvent, ReviewSchedule } from "@syncspace/contracts";
import { personalReviewBackupSchema } from "@syncspace/contracts";
import { applyRating, compareDue, enrollCard, isDue, type Rating } from "@syncspace/learning";
import { openPersonalDb } from "./db.js";

export const DEFAULT_PROFILE_ID = "local-profile";

export async function getDisplayName(): Promise<string> {
  const db = await openPersonalDb();
  const row = await db.get("settings", "displayName");
  return row?.value ?? "Learner";
}

export async function setDisplayName(name: string): Promise<void> {
  const db = await openPersonalDb();
  await db.put("settings", { key: "displayName", value: name.trim() || "Learner" });
}

export async function enrollInReview(input: {
  profileId?: string;
  boardId: string;
  cardId: string;
  contentHash: string;
  now?: Date;
}): Promise<ReviewSchedule> {
  const profileId = input.profileId ?? DEFAULT_PROFILE_ID;
  const db = await openPersonalDb();
  const existing = await db.get("schedules", [profileId, input.cardId]);
  if (existing) {
    return existing;
  }
  const schedule = enrollCard({
    profileId,
    boardId: input.boardId,
    cardId: input.cardId,
    contentHash: input.contentHash,
    now: input.now ?? new Date(),
  });
  await db.put("schedules", schedule);
  return schedule;
}

export async function rateCard(input: {
  profileId?: string;
  cardId: string;
  rating: Rating;
  eventId: string;
  now?: Date;
}): Promise<{ schedule: ReviewSchedule; event: ReviewEvent; duplicate: boolean }> {
  const profileId = input.profileId ?? DEFAULT_PROFILE_ID;
  const db = await openPersonalDb();
  const duplicate = await db.get("events", input.eventId);
  if (duplicate) {
    const schedule = await db.get("schedules", [profileId, input.cardId]);
    if (!schedule) {
      throw new Error("Duplicate event without a schedule.");
    }
    return { schedule, event: duplicate, duplicate: true };
  }
  const current = await db.get("schedules", [profileId, input.cardId]);
  if (!current) {
    throw new Error("Card is not in the private review queue.");
  }
  const result = applyRating({
    schedule: current,
    rating: input.rating,
    now: input.now ?? new Date(),
    eventId: input.eventId,
  });
  const tx = db.transaction(["events", "schedules"], "readwrite");
  const writes = Promise.all([
    tx.objectStore("events").add(result.event),
    tx.objectStore("schedules").put(result.schedule),
    tx.done,
  ]);
  await writes;
  return { ...result, duplicate: false };
}

export async function listDue(now = new Date(), profileId = DEFAULT_PROFILE_ID): Promise<ReviewSchedule[]> {
  const db = await openPersonalDb();
  const all = await db.getAll("schedules");
  return all.filter((row) => row.profileId === profileId && isDue(row, now)).sort(compareDue);
}

export async function listSchedules(profileId = DEFAULT_PROFILE_ID): Promise<ReviewSchedule[]> {
  const db = await openPersonalDb();
  const all = await db.getAll("schedules");
  return all.filter((row) => row.profileId === profileId).sort(compareDue);
}

export async function listEvents(profileId = DEFAULT_PROFILE_ID): Promise<ReviewEvent[]> {
  const db = await openPersonalDb();
  const all = await db.getAll("events");
  return all.filter((row) => row.profileId === profileId);
}

export async function clearReviewHistory(profileId = DEFAULT_PROFILE_ID): Promise<void> {
  const db = await openPersonalDb();
  const events = (await db.getAll("events")).filter((row) => row.profileId === profileId);
  const schedules = (await db.getAll("schedules")).filter((row) => row.profileId === profileId);
  const tx = db.transaction(["events", "schedules"], "readwrite");
  await Promise.all([
    ...events.map((event) => tx.objectStore("events").delete(event.eventId)),
    ...schedules.map((schedule) => tx.objectStore("schedules").delete([schedule.profileId, schedule.cardId])),
    tx.done,
  ]);
}

export async function restoreReviewBackup(
  raw: unknown,
  profileId = DEFAULT_PROFILE_ID,
): Promise<{ importedEvents: number; importedSchedules: number; skippedEvents: number }> {
  const backup = personalReviewBackupSchema.parse(raw);
  const db = await openPersonalDb();
  const existingIds = new Set((await db.getAll("events")).map((row) => row.eventId));
  const events: ReviewEvent[] = [];
  let skippedEvents = 0;
  for (const event of backup.events) {
    if (existingIds.has(event.eventId)) {
      skippedEvents += 1;
      continue;
    }
    existingIds.add(event.eventId);
    events.push({ ...event, profileId });
  }
  const schedules: ReviewSchedule[] = backup.schedules.map((schedule) => ({ ...schedule, profileId }));
  const tx = db.transaction(["events", "schedules"], "readwrite");
  await Promise.all([
    ...events.map((event) => tx.objectStore("events").add(event)),
    ...schedules.map((schedule) => tx.objectStore("schedules").put(schedule)),
    tx.done,
  ]);
  return {
    importedEvents: events.length,
    importedSchedules: schedules.length,
    skippedEvents,
  };
}
