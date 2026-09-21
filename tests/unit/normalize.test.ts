import { describe, expect, it } from "vitest";
import { normalizeArticleAnswer, normalizeNfcTrim } from "@syncspace/learning";

describe("normalizeNfcTrim", () => {
  it("composes combining marks to NFC", () => {
    const decomposed = "Stra\u0301e".normalize("NFD");
    expect(normalizeNfcTrim(` ${decomposed} `)).toBe("Stra\u0301e".normalize("NFC"));
  });

  it("does not strip umlauts or map ß", () => {
    expect(normalizeNfcTrim("Größe")).toBe("Größe");
    expect(normalizeNfcTrim("Straße")).toBe("Straße");
  });
});

describe("normalizeArticleAnswer", () => {
  it("lowercases after NFC trim", () => {
    expect(normalizeArticleAnswer(" DER ")).toBe("der");
  });
});
