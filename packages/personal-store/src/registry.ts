import { openPersonalDb, type LocalBoardRecord, type RememberedRoom } from "./db.js";

export async function listLocalBoards(): Promise<LocalBoardRecord[]> {
  const db = await openPersonalDb();
  const boards = await db.getAll("boards");
  return boards.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function rememberBoard(record: LocalBoardRecord): Promise<void> {
  const db = await openPersonalDb();
  await db.put("boards", record);
}

export async function forgetBoard(id: string): Promise<void> {
  const db = await openPersonalDb();
  await db.delete("boards", id);
}

export async function rememberRoom(room: RememberedRoom): Promise<void> {
  const db = await openPersonalDb();
  await db.put("rooms", room);
}

export async function listRememberedRooms(): Promise<RememberedRoom[]> {
  const db = await openPersonalDb();
  return db.getAll("rooms");
}

export async function forgetRoom(roomId: string): Promise<void> {
  const db = await openPersonalDb();
  await db.delete("rooms", roomId);
}

export async function getRememberedToken(roomId: string): Promise<string | undefined> {
  const db = await openPersonalDb();
  return (await db.get("rooms", roomId))?.token;
}
