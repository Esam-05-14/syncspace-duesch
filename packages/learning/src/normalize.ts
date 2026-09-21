/** Always NFC + boundary trim. Further transforms only when an exercise declares them. */
export function normalizeNfcTrim(input: string): string {
  return input.normalize("NFC").trim();
}

export function normalizeArticleAnswer(input: string): string {
  return normalizeNfcTrim(input).toLowerCase();
}

export const ARTICLE_ANSWERS = ["der", "die", "das"] as const;
export type DictionaryArticle = (typeof ARTICLE_ANSWERS)[number];

export function isDictionaryArticle(value: string): value is DictionaryArticle {
  return (ARTICLE_ANSWERS as readonly string[]).includes(value);
}
