import { normalizeArticleAnswer, isDictionaryArticle } from "./normalize.js";

export type ArticleCheck =
  | {
      ok: true;
      submitted: string;
      accepted: string;
      appliedRule: "nfc-trim-lower";
    }
  | {
      ok: false;
      submitted: string;
      accepted: string;
      appliedRule: "nfc-trim-lower";
      reason: "not-accepted" | "not-an-article";
    };

export function checkArticleRecall(raw: string, accepted: string): ArticleCheck {
  const submitted = normalizeArticleAnswer(raw);
  const expected = normalizeArticleAnswer(accepted);
  if (!isDictionaryArticle(submitted)) {
    return {
      ok: false,
      submitted,
      accepted: expected,
      appliedRule: "nfc-trim-lower",
      reason: "not-an-article",
    };
  }
  if (submitted !== expected) {
    return {
      ok: false,
      submitted,
      accepted: expected,
      appliedRule: "nfc-trim-lower",
      reason: "not-accepted",
    };
  }
  return { ok: true, submitted, accepted: expected, appliedRule: "nfc-trim-lower" };
}
