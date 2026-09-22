import { openPersonalDb } from "./db.js";

const LAST_LESSON_KEY = "last-lesson";
const LANGUAGE_TOOL_CONSENT_KEY = "languagetool-consent";
const DUDEN_API_KEY = "duden-api-key";
const DUDEN_KEY_MAX = 256;

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

export async function getDudenApiKey(): Promise<string | null> {
  const db = await openPersonalDb();
  const row = await db.get("settings", DUDEN_API_KEY);
  return row?.value?.trim() || null;
}

export async function hasDudenApiKey(): Promise<boolean> {
  return (await getDudenApiKey()) !== null;
}

export async function setDudenApiKey(raw: string): Promise<void> {
  const value = raw.trim();
  if (value.length < 8 || value.length > DUDEN_KEY_MAX || /\s/.test(value)) {
    throw new Error("That does not look like a Duden API key.");
  }
  const db = await openPersonalDb();
  await db.put("settings", { key: DUDEN_API_KEY, value });
}

export async function clearDudenApiKey(): Promise<void> {
  const db = await openPersonalDb();
  await db.delete("settings", DUDEN_API_KEY);
}
