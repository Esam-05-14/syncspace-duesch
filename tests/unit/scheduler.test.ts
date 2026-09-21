import { describe, expect, it } from "vitest";
import { applyRating, describeBox, describeDue, enrollCard, isDue, nextBox } from "@syncspace/learning";

const NOW = new Date("2026-09-20T12:00:00.000Z");

describe("scheduler v1", () => {
  it("enrolls in box 0 and immediately due", () => {
    const schedule = enrollCard({
      profileId: "p1",
      boardId: "b1",
      cardId: "c1",
      contentHash: "a".repeat(64),
      now: NOW,
    });
    expect(schedule.box).toBe(0);
    expect(isDue(schedule, NOW)).toBe(true);
  });

  it("Again returns to box 0 and +10 minutes", () => {
    const schedule = enrollCard({
      profileId: "p1",
      boardId: "b1",
      cardId: "c1",
      contentHash: "a".repeat(64),
      now: NOW,
    });
    const rated = applyRating({ schedule, rating: "again", now: NOW, eventId: "evt_1" });
    expect(rated.schedule.box).toBe(0);
    expect(rated.event.dueAt).toBe("2026-09-20T12:10:00.000Z");
  });

  it("Got it walks boxes 1 through 5", () => {
    let box = nextBox(0, "got-it");
    expect(box).toBe(1);
    box = nextBox(4, "got-it");
    expect(box).toBe(5);
    box = nextBox(5, "got-it");
    expect(box).toBe(5);
  });

  it("does not advance twice on a reused event id at the function layer", () => {
    const schedule = enrollCard({
      profileId: "p1",
      boardId: "b1",
      cardId: "c1",
      contentHash: "a".repeat(64),
      now: NOW,
    });
    const first = applyRating({ schedule, rating: "got-it", now: NOW, eventId: "evt_dup" });
    expect(first.event.eventId).toBe("evt_dup");
    expect(first.schedule.box).toBe(1);
  });

  it("describes due times and keeps an enrolled study prompt", () => {
    const schedule = enrollCard({
      profileId: "p1",
      boardId: "b1",
      cardId: "voc_zug",
      contentHash: "a".repeat(64),
      now: NOW,
      prompt: {
        headword: "Zug",
        article: "der",
        plural: "Züge",
        glossEn: "train",
        exampleDe: "Der Zug fährt um acht Uhr ab.",
      },
    });
    expect(describeDue(schedule.dueAt, NOW)).toBe("due now");
    expect(describeDue("2026-09-20T12:10:00.000Z", NOW)).toBe("due in 10 min");
    expect(describeBox(0)).toBe("box 0 (10 min)");
    const rated = applyRating({ schedule, rating: "got-it", now: NOW, eventId: "evt_keep_prompt" });
    expect(rated.schedule.prompt?.headword).toBe("Zug");
  });
});
