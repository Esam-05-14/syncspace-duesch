import { openDB, type IDBPDatabase } from "idb";
import type { LectureNote, ReviewEvent, ReviewSchedule } from "@syncspace/contracts";

const DB_NAME = "syncspace-personal";
const DB_VERSION = 2;

let activeName = DB_NAME;

/** Test isolation only. Production always uses `syncspace-personal`. */
export function setPersonalDatabaseNameForTests(name: string | null): void {
  activeName = name ?? DB_NAME;
}

export type RememberedRoom = {
  roomId: string;
  token: string;
  rememberedAt: string;
};

export type LocalBoardRecord = {
  id: string;
  title: string;
  kind: "standalone" | "shared";
  updatedAt: string;
};

export type PersonalSchema = {
  settings: {
    key: string;
    value: string;
  };
  events: ReviewEvent;
  schedules: ReviewSchedule;
  boards: LocalBoardRecord;
  rooms: RememberedRoom;
  lectures: LectureNote;
};

export async function openPersonalDb(): Promise<IDBPDatabase<PersonalSchema>> {
  return openDB<PersonalSchema>(activeName, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("events")) {
        const events = db.createObjectStore("events", { keyPath: "eventId" });
        events.createIndex("by-profile", "profileId");
      }
      if (!db.objectStoreNames.contains("schedules")) {
        db.createObjectStore("schedules", { keyPath: ["profileId", "cardId"] });
      }
      if (!db.objectStoreNames.contains("boards")) {
        db.createObjectStore("boards", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("rooms")) {
        db.createObjectStore("rooms", { keyPath: "roomId" });
      }
      if (!db.objectStoreNames.contains("lectures")) {
        db.createObjectStore("lectures", { keyPath: "id" });
      }
    },
  });
}
