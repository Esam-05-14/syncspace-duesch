import { describe, expect, it } from "vitest";
import { invitationPath } from "../../apps/web/src/lib/tokens.ts";

describe("invitation URLs", () => {
  it("open the board as a shared room and keep the token in the hash", () => {
    expect(invitationPath("room-alltag-a1b1", "abc")).toBe(
      "/board/room-alltag-a1b1?mode=shared#token=abc",
    );
  });
});
