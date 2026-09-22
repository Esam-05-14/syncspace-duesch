import { openPersonalDb } from "./db.js";

const LAST_LESSON_KEY = "last-lesson";
const LANGUAGE_TOOL_CONSENT_KEY = "languagetool-consent";
const REVIEW_EXPORT_AT_KEY = "review-export-at";

function isLessonPath(path: string): boolean {
  return path.startsWith("/learn");
}

export async function getLastLesson(): Promise<string | null> {
  const db = await openPersonalDb();
  const row = await db.get("settings", LAST_LESSON_KEY);
  if (!row || !isLessonPath(row.value)) {
    return null;
  }
  return row.value;
}

export async function rememberLastLesson(path: string): Promise<void> {
  if (!isLessonPath(path)) {
    return;
  }
  const db = await openPersonalDb();
  await db.put("settings", { key: LAST_LESSON_KEY, value: path });
}

export async function getLanguageToolConsent(): Promise<boolean> {
  const db = await openPersonalDb();
  const row = await db.get("settings", LANGUAGE_TOOL_CONSENT_KEY);
  return row?.value === "yes";
}

export async function setLanguageToolConsent(allowed: boolean): Promise<void> {
  const db = await openPersonalDb();
  if (allowed) {
    await db.put("settings", { key: LANGUAGE_TOOL_CONSENT_KEY, value: "yes" });
    return;
  }
  await db.delete("settings", LANGUAGE_TOOL_CONSENT_KEY);
}

export async function getReviewExportAt(): Promise<string | null> {
  const db = await openPersonalDb();
  const row = await db.get("settings", REVIEW_EXPORT_AT_KEY);
  return row?.value ?? null;
}

export async function rememberReviewExport(at = new Date()): Promise<string> {
  const value = at.toISOString();
  const db = await openPersonalDb();
  await db.put("settings", { key: REVIEW_EXPORT_AT_KEY, value });
  return value;
}
