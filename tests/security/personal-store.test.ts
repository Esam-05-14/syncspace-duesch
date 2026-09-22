import { afterEach, describe, expect, it } from "vitest";
import "fake-indexeddb/auto";
import { createOpaqueId, personalReviewBackupSchema } from "@syncspace/contracts";
import {
  clearLessonProgress,
  clearRecentInquiries,
  clearReviewHistory,
  enrollInReview,
  createLecture,
  getDudenApiKey,
  getLanguageToolConsent,
  hasDudenApiKey,
  getLastLesson,
  getLecture,
  getLessonProgress,
  listLectures,
  listDue,
  listEvents,
  listRecentInquiries,
  listSchedules,
  markLessonComplete,
  rememberInquiry,
  rememberLastLesson,
  setDudenApiKey,
  setLanguageToolConsent,
  rateCard,
  restoreReviewBackup,
  setPersonalDatabaseNameForTests,
} from "@syncspace/personal-store";

const HASH = "b".repeat(64);

async function rateOnce(cardId: string) {
  await enrollInReview({ boardId: "board-privacy", cardId, contentHash: HASH });
  return rateCard({
    cardId,
    rating: "got-it",
    eventId: createOpaqueId("evt"),
    now: new Date("2026-09-21T12:00:00.000Z"),
  });
}

describe("isolated personal review stores", () => {
  afterEach(() => {
    setPersonalDatabaseNameForTests(null);
  });

  it("keeps Alice's ratings out of Bob's profile database", async () => {
    setPersonalDatabaseNameForTests("syncspace-alice");
    const rated = await rateOnce("voc_zug");
    expect(rated.duplicate).toBe(false);
    expect((await listEvents()).map((event) => event.cardId)).toEqual(["voc_zug"]);

    setPersonalDatabaseNameForTests("syncspace-bob");
    expect(await listEvents()).toEqual([]);
    expect(await listSchedules()).toEqual([]);
    expect(await listDue(new Date("2026-09-21T12:00:00.000Z"))).toEqual([]);

    setPersonalDatabaseNameForTests("syncspace-alice");
    expect((await listEvents())[0]?.eventId).toBe(rated.event.eventId);
  });

  it("restores a personal-review backup into this profile and skips duplicate events", async () => {
    setPersonalDatabaseNameForTests("syncspace-restore");
    const first = await rateOnce("voc_tisch");
    const backup = personalReviewBackupSchema.parse({
      kind: "personal-review-backup",
      profileId: "other-device",
      exportedAt: "2026-09-21T13:00:00.000Z",
      events: [
        first.event,
        {
          ...first.event,
          eventId: "evt_imported-apple",
          cardId: "voc_name",
        },
      ],
      schedules: [
        first.schedule,
        {
          ...first.schedule,
          cardId: "voc_name",
          box: 2,
          dueAt: "2026-09-24T12:00:00.000Z",
        },
      ],
    });
    const result = await restoreReviewBackup(backup);
    expect(result.skippedEvents).toBe(1);
    expect(result.importedEvents).toBe(1);
    expect(result.importedSchedules).toBe(2);
    const events = await listEvents();
    expect(events.some((event) => event.eventId === "evt_imported-apple")).toBe(true);
    expect(events.every((event) => event.profileId === "local-profile")).toBe(true);
    expect((await listSchedules()).some((row) => row.cardId === "voc_name" && row.box === 2)).toBe(true);
  });

  it("rejects a board export as a review backup", async () => {
    setPersonalDatabaseNameForTests("syncspace-restore-reject");
    await expect(
      restoreReviewBackup({
        kind: "board-content-json",
        boardId: "board-x",
      }),
    ).rejects.toThrow();
  });

  it("clears this profile's review history in one transaction", async () => {
    setPersonalDatabaseNameForTests("syncspace-clear");
    await rateOnce("voc_zug");
    await clearReviewHistory();
    expect(await listEvents()).toEqual([]);
    expect(await listSchedules()).toEqual([]);
  });

  it("stores a private study prompt that never needs the shared board", async () => {
    setPersonalDatabaseNameForTests("syncspace-prompt");
    const schedule = await enrollInReview({
      boardId: "board-local",
      cardId: "voc_tisch",
      contentHash: HASH,
      prompt: {
        headword: "Tisch",
        article: "der",
        plural: "Tische",
        glossEn: "table",
        exampleDe: "Der Tisch steht in der Küche.",
      },
    });
    expect(schedule.prompt?.headword).toBe("Tisch");
    const again = await enrollInReview({
      boardId: "board-local",
      cardId: "voc_tisch",
      contentHash: HASH,
    });
    expect(again.prompt?.headword).toBe("Tisch");
    const backup = personalReviewBackupSchema.parse({
      kind: "personal-review-backup",
      profileId: "local-profile",
      exportedAt: "2026-09-21T13:00:00.000Z",
      events: [],
      schedules: [schedule],
    });
    expect(backup.schedules[0]?.prompt?.article).toBe("der");
  });

  it("stores lesson ticks in this profile only", async () => {
    setPersonalDatabaseNameForTests("syncspace-lessons");
    await clearLessonProgress();
    const first = await markLessonComplete("lesson-alphabet");
    expect(first.completed).toEqual(["lesson-alphabet"]);
    expect((await getLessonProgress()).completed).toEqual(["lesson-alphabet"]);
  });

  it("keeps recent inquiry strings in this profile only", async () => {
    setPersonalDatabaseNameForTests("syncspace-inquire");
    await clearRecentInquiries();
    await rememberInquiry("strasse");
    await rememberInquiry("der tisch");
    expect(await listRecentInquiries()).toEqual(["der tisch", "strasse"]);
    setPersonalDatabaseNameForTests("syncspace-inquire-b");
    expect(await listRecentInquiries()).toEqual([]);
  });

  it("remembers the last lesson path in this profile only", async () => {
    setPersonalDatabaseNameForTests("syncspace-last-lesson");
    await rememberLastLesson("/learn/sounds");
    expect(await getLastLesson()).toBe("/learn/sounds");
    await rememberLastLesson("/board/not-a-lesson");
    expect(await getLastLesson()).toBe("/learn/sounds");
    setPersonalDatabaseNameForTests("syncspace-last-lesson-b");
    expect(await getLastLesson()).toBeNull();
  });

  it("keeps lecture notes in this profile only", async () => {
    setPersonalDatabaseNameForTests("syncspace-lectures");
    const note = await createLecture({
      title: "Nicos Weg 1",
      sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
    expect(note.sourceKind).toBe("youtube");
    expect((await listLectures()).map((row) => row.id)).toEqual([note.id]);
    expect((await getLecture(note.id))?.title).toBe("Nicos Weg 1");
    setPersonalDatabaseNameForTests("syncspace-lectures-b");
    expect(await listLectures()).toEqual([]);
  });

  it("stores LanguageTool consent in this profile only", async () => {
    setPersonalDatabaseNameForTests("syncspace-lt-consent");
    expect(await getLanguageToolConsent()).toBe(false);
    await setLanguageToolConsent(true);
    expect(await getLanguageToolConsent()).toBe(true);
    setPersonalDatabaseNameForTests("syncspace-lt-consent-b");
    expect(await getLanguageToolConsent()).toBe(false);
  });

  it("stores a Duden API key in this profile only", async () => {
    setPersonalDatabaseNameForTests("syncspace-duden-key");
    expect(await hasDudenApiKey()).toBe(false);
    await setDudenApiKey("duden-test-key-ok");
    expect(await getDudenApiKey()).toBe("duden-test-key-ok");
    await expect(setDudenApiKey("short")).rejects.toThrow(/does not look like/);
    setPersonalDatabaseNameForTests("syncspace-duden-key-b");
    expect(await getDudenApiKey()).toBeNull();
  });
});
