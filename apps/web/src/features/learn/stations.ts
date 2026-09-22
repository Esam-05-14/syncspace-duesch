import { ROADMAP } from "@syncspace/content";
import type { RoadmapStation } from "@syncspace/contracts";

export const LESSON_PATH: Record<string, string> = {
  "lesson-alphabet": "/learn/alphabet",
  "lesson-sounds": "/learn/sounds",
  "lesson-words": "/learn/words",
  "lesson-phrases": "/learn/phrases",
  "lesson-grammar": "/learn/grammar",
  "lesson-mapper": "/learn/mapper",
  "lesson-builder": "/learn/builder",
  "lesson-inquire": "/learn/inquire",
  "lesson-skills": "/learn/skills",
  "lesson-sources": "/learn/sources",
};

export function pathForLesson(lessonId: string): string {
  return LESSON_PATH[lessonId] ?? "/learn";
}

export function nextOpenStation(completed: readonly string[]): RoadmapStation | null {
  return ROADMAP.find((station) => !completed.includes(station.lessonId)) ?? null;
}

export function stationAfter(lessonId: string): RoadmapStation | null {
  const index = ROADMAP.findIndex((station) => station.lessonId === lessonId);
  if (index < 0) {
    return null;
  }
  return ROADMAP[index + 1] ?? null;
}
