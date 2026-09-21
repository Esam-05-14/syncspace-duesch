import { openPersonalDb } from "./db.js";

const KEY = "lesson-progress";

export type LessonProgress = {
  completed: string[];
  updatedAt: string;
};

export async function getLessonProgress(): Promise<LessonProgress> {
  const db = await openPersonalDb();
  const row = await db.get("settings", KEY);
  if (!row) {
    return { completed: [], updatedAt: new Date(0).toISOString() };
  }
  try {
    const parsed = JSON.parse(row.value) as LessonProgress;
    if (Array.isArray(parsed.completed)) {
      return {
        completed: parsed.completed.filter((id) => typeof id === "string"),
        updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date(0).toISOString(),
      };
    }
  } catch {
    // Corrupt ticks are ignored; the learner can mark the station again.
  }
  return { completed: [], updatedAt: new Date(0).toISOString() };
}

export async function markLessonComplete(lessonId: string): Promise<LessonProgress> {
  const current = await getLessonProgress();
  const completed = current.completed.includes(lessonId) ? current.completed : [...current.completed, lessonId];
  const next = { completed, updatedAt: new Date().toISOString() };
  const db = await openPersonalDb();
  await db.put("settings", { key: KEY, value: JSON.stringify(next) });
  return next;
}

export async function clearLessonProgress(): Promise<void> {
  const db = await openPersonalDb();
  await db.delete("settings", KEY);
}
