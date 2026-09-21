import { describe, expect, it } from "vitest";
import { personalReviewBackupSchema, reviewEventSchema } from "@syncspace/contracts";

describe("review contracts", () => {
  it("accepts starter ids such as voc_zug", () => {
    const event = reviewEventSchema.parse({
      eventId: "evt_zug-rating",
      profileId: "local-profile",
      boardId: "room-alltag-a1b1",
      cardId: "voc_zug",
      contentHash: "c".repeat(64),
      rating: "got-it",
      priorBox: 0,
      resultingBox: 1,
      ratedAt: "2026-09-21T12:00:00.000Z",
      dueAt: "2026-09-22T12:00:00.000Z",
      schedulerVersion: 1,
    });
    expect(event.cardId).toBe("voc_zug");
    const backup = personalReviewBackupSchema.parse({
      kind: "personal-review-backup",
      profileId: "local-profile",
      exportedAt: "2026-09-21T12:00:00.000Z",
      events: [event],
      schedules: [
        {
          profileId: "local-profile",
          boardId: "room-alltag-a1b1",
          cardId: "voc_zug",
          contentHash: event.contentHash,
          box: 1,
          dueAt: event.dueAt,
          active: true,
        },
      ],
    });
    expect(backup.events).toHaveLength(1);
  });
});
