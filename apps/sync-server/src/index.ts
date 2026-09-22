import { resolve } from "node:path";
import { ensureSampleRoom } from "./documents/rooms.js";
import { assertHostedOrigins, resolveSyncAccess } from "./http/access.js";
import { openSyncDatabase } from "./persistence/sqlite.js";
import { createSyncServer } from "./sync/server.js";

const access = resolveSyncAccess({
  host: process.env.SYNCSPACE_HOST,
  nodeEnv: process.env.NODE_ENV,
  allowedOrigins: process.env.SYNCSPACE_ALLOWED_ORIGINS,
  enableSampleRoom: process.env.SYNCSPACE_ENABLE_SAMPLE_ROOM,
  enableDevSnapshot: process.env.SYNCSPACE_ENABLE_DEV_SNAPSHOT,
});
assertHostedOrigins(access);

const port = Number(process.env.PORT ?? process.env.SYNCSPACE_SYNC_PORT ?? 4357);
const dataDir = resolve(process.env.SYNCSPACE_DATA_DIR ?? "./data");

const db = openSyncDatabase(dataDir);
const sample = ensureSampleRoom(db);
const server = createSyncServer({ db, host: access.bindHost, port, access });

await server.listen();

const scheme = access.loopbackOnly ? "ws" : "wss (put TLS in front)";
console.log(`SyncSpace sync listening on ${scheme} ${access.bindHost}:${port}`);
console.log(`Health: http://${access.bindHost}:${port}/health`);
console.log(`Sample room seeded: ${sample.roomId}`);
if (access.sampleRoomEnabled) {
  console.log(`Development invitation helper: http://${access.bindHost}:${port}/dev/sample-room`);
} else {
  console.log("Development invitation helper is off. Share a runtime token out of band.");
}
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
