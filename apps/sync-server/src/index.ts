import { resolve } from "node:path";
import { ensureSampleRoom } from "./documents/rooms.js";
import { openSyncDatabase } from "./persistence/sqlite.js";
import { createSyncServer } from "./sync/server.js";

const host = process.env.SYNCSPACE_HOST ?? "127.0.0.1";
const port = Number(process.env.SYNCSPACE_SYNC_PORT ?? 4357);
const dataDir = resolve(process.env.SYNCSPACE_DATA_DIR ?? "./data");

const db = openSyncDatabase(dataDir);
const sample = ensureSampleRoom(db);
const server = createSyncServer({ db, host, port });

await server.listen();

console.log(`SyncSpace sync listening on ws://${host}:${port}`);
console.log(`Health: http://${host}:${port}/health`);
console.log(`Development sample room: ${sample.roomId}`);
console.log(`Development invitation helper: http://${host}:${port}/dev/sample-room`);
console.log("The invitation token is not written to disk or committed.");

const shutdown = async () => {
  console.log("Shutting down: stop accepting work, flush, then close.");
  try {
    await server.destroy();
  } finally {
    db.close();
    process.exit(0);
  }
};

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
