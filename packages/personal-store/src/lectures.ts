import { createOpaqueId, lectureNoteSchema, type LectureFact, type LectureNote } from "@syncspace/contracts";
import { parseMediaUrl } from "@syncspace/learning";
import { openPersonalDb } from "./db.js";

export async function listLectures(): Promise<LectureNote[]> {
  const db = await openPersonalDb();
  const rows = await db.getAll("lectures");
  return rows.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export async function getLecture(id: string): Promise<LectureNote | null> {
  const db = await openPersonalDb();
  return (await db.get("lectures", id)) ?? null;
}

export async function saveLecture(note: LectureNote): Promise<LectureNote> {
  const next = lectureNoteSchema.parse({ ...note, updatedAt: new Date().toISOString() });
  const db = await openPersonalDb();
  await db.put("lectures", next);
  return next;
}

export async function createLecture(input: { title?: string; sourceUrl: string }): Promise<LectureNote> {
  const media = parseMediaUrl(input.sourceUrl);
  const now = new Date().toISOString();
  const title = input.title?.trim() || media.label;
  const note = lectureNoteSchema.parse({
    id: createOpaqueId("lec"),
    title,
    sourceUrl: media.sourceUrl,
    sourceKind: media.kind,
    videoId: media.videoId,
    notes: "",
    facts: [],
    createdAt: now,
    updatedAt: now,
  });
  const db = await openPersonalDb();
  await db.put("lectures", note);
  return note;
}

export async function deleteLecture(id: string): Promise<void> {
  const db = await openPersonalDb();
  await db.delete("lectures", id);
}

export async function addLectureFact(
  lectureId: string,
  fact: Omit<LectureFact, "id">,
): Promise<LectureNote> {
  const current = await getLecture(lectureId);
  if (!current) {
    throw new Error("That lecture note is not on this device.");
  }
  const nextFact: LectureFact = { ...fact, id: createOpaqueId("fact") };
  return saveLecture({ ...current, facts: [...current.facts, nextFact] });
}

export async function removeLectureFact(lectureId: string, factId: string): Promise<LectureNote> {
  const current = await getLecture(lectureId);
  if (!current) {
    throw new Error("That lecture note is not on this device.");
  }
  return saveLecture({ ...current, facts: current.facts.filter((row) => row.id !== factId) });
}
