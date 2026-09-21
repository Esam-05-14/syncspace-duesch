import { describe, expect, it } from "vitest";
import { STARTER_BOARD, validateStarterBoard } from "@syncspace/content";

describe("starter pack", () => {
  it("validates against the board schema", () => {
    const board = validateStarterBoard();
    expect(board.cards.filter((card) => card.type === "vocabulary")).toHaveLength(24);
    expect(board.cards.filter((card) => card.type === "note")).toHaveLength(4);
    expect(board.cards.filter((card) => card.type === "exercise").length).toBeGreaterThan(0);
  });

  it("marks every supplied record draft", () => {
    expect(STARTER_BOARD.cards.every((card) => card.contentStatus === "draft")).toBe(true);
  });

  it("keeps unique card ids", () => {
    const ids = STARTER_BOARD.cards.map((card) => card.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("does not force noun fields onto verbs", () => {
    const verbs = STARTER_BOARD.cards.filter(
      (card) => card.type === "vocabulary" && card.lexical.partOfSpeech === "verb",
    );
    expect(verbs.length).toBe(4);
    expect(verbs.every((card) => card.type === "vocabulary" && card.lexical.article === null)).toBe(true);
  });
});
