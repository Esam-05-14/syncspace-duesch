import { afterEach, describe, expect, it } from "vitest";
import "fake-indexeddb/auto";
import { createOpaqueId, personalReviewBackupSchema } from "@syncspace/contracts";
import {
  clearReviewHistory,
  enrollInReview,
  listDue,
  listEvents,
  listSchedules,
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
});
