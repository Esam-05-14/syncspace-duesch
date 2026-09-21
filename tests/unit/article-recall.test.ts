import { describe, expect, it } from "vitest";
import { checkArticleRecall } from "@syncspace/learning";

describe("checkArticleRecall", () => {
  it("accepts der/die/das after whitespace", () => {
    expect(checkArticleRecall(" Die ", "die").ok).toBe(true);
  });

  it("rejects a different article", () => {
    const result = checkArticleRecall("der", "das");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("not-accepted");
    }
  });

  it("rejects non-articles instead of treating them as German impossibility", () => {
    const result = checkArticleRecall("dem", "der");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe("not-an-article");
    }
  });
});
