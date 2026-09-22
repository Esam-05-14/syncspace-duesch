import { Database } from "@hocuspocus/extension-database";
import { Server } from "@hocuspocus/server";
import { SCHEMA_VERSION } from "@syncspace/contracts";
import { materializeBoard, materializeDigest } from "@syncspace/collab";
import type DatabaseType from "better-sqlite3";
import * as Y from "yjs";
import { authorizeRoom } from "../auth/authorize.js";
import { getSampleInvitation } from "../documents/rooms.js";
import {
  assertHostedOrigins,
  corsHeaders,
  isLoopbackHostHeader,
  resolveSyncAccess,
  type SyncAccess,
} from "../http/access.js";
import { activeTokenHashes, fetchSnapshot, storeSnapshot } from "../persistence/sqlite.js";

export function createSyncServer(input: {
  db: DatabaseType.Database;
  host: string;
  port: number;
  debounce?: number;
  maxDebounce?: number;
  quiet?: boolean;
  access?: SyncAccess;
}): ReturnType<typeof Server.configure> {
  const { db, host, port, debounce = 2000, maxDebounce = 8000, quiet = false } = input;
  const access = input.access ?? resolveSyncAccess({ host });
  assertHostedOrigins(access);

  return Server.configure({
    name: "syncspace-deutsch",
    address: host,
    port,
    debounce,
    maxDebounce,
    timeout: 30_000,
    quiet,
    stopOnSignals: false,
    extensions: [
      new Database({
        fetch: async ({ documentName }) => {
          const row = fetchSnapshot(db, documentName);
          return row ? new Uint8Array(row.yjs_state) : null;
        },
        store: async ({ documentName, state }) => {
          let digest: string | undefined;
          try {
            const doc = new Y.Doc();
            Y.applyUpdate(doc, state);
            digest = materializeDigest(materializeBoard(doc));
            doc.destroy();
          } catch {
            digest = undefined;
          }
          const row = storeSnapshot(db, {
            documentId: documentName,
            schemaVersion: SCHEMA_VERSION,
            state,
            digest,
          });
          console.log(
            `[checkpoint] ${documentName} seq=${row.checkpoint_seq} at=${row.persisted_at}`,
          );
        },
      }),
    ],
    async onAuthenticate({ token, documentName }) {
      authorizeRoom(documentName, token, activeTokenHashes(db, documentName));
    },
    async onConnect({ request }) {
      const origin = typeof request.headers.origin === "string" ? request.headers.origin : "";
      if (!access.loopbackOnly && origin && !corsHeaders(origin, access)["access-control-allow-origin"]) {
        throw new Error("origin not allowed");
      }
    },
    async onRequest(data) {
      const { request, response } = data;
      const hostHeader = request.headers.host;
      const url = new URL(request.url ?? "/", `http://${hostHeader ?? "127.0.0.1"}`);
      const origin = typeof request.headers.origin === "string" ? request.headers.origin : "";
      const cors = corsHeaders(origin, access);

      const finish = (status: number, headers: Record<string, string>, body: string): never => {
        response.writeHead(status, headers);
        response.end(body);
        // Hocuspocus writes a default "OK" unless this hook rejects with a falsy error.
        throw undefined;
      };

      if (access.loopbackOnly && !isLoopbackHostHeader(hostHeader)) {
        finish(403, { "content-type": "text/plain; charset=utf-8" }, "loopback only");
      }

      if (request.method === "OPTIONS") {
        finish(204, cors, "");
      }

      if (url.pathname === "/health") {
        finish(200, { "content-type": "application/json; charset=utf-8", ...cors }, JSON.stringify({ ok: true, service: "syncspace-sync" }));
      }

      if (url.pathname === "/dev/sample-room") {
        if (!access.sampleRoomEnabled) {
          finish(404, { "content-type": "text/plain; charset=utf-8", ...cors }, "not found");
        }
        const sample = getSampleInvitation();
        if (!sample) {
          finish(503, { "content-type": "application/json; charset=utf-8", ...cors }, JSON.stringify({ error: "sample-room-not-ready" }));
        } else {
          finish(
            200,
            {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "no-store",
              ...cors,
            },
            JSON.stringify({ ...sample, developmentOnly: true }),
          );
        }
      }

      if (url.pathname.startsWith("/dev/snapshot/")) {
        if (!access.snapshotEnabled) {
          finish(404, { "content-type": "text/plain; charset=utf-8", ...cors }, "not found");
        }
        const documentId = decodeURIComponent(url.pathname.slice("/dev/snapshot/".length));
        const row = fetchSnapshot(db, documentId);
        if (!row) {
          finish(404, { "content-type": "application/json; charset=utf-8", ...cors }, JSON.stringify({ error: "no-checkpoint" }));
        } else {
          finish(
            200,
            {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "no-store",
              ...cors,
            },
            JSON.stringify({
              documentId: row.document_id,
              sequence: row.checkpoint_seq,
              serverTime: row.persisted_at,
              digest: row.digest,
            }),
          );
        }
      }

      if (url.pathname === "/") {
        finish(
          200,
          { "content-type": "text/plain; charset=utf-8" },
          access.loopbackOnly
            ? "SyncSpace Deutsch sync server. Loopback only."
            : "SyncSpace Deutsch sync server. Trusted-group host. Not multi-tenant and not end-to-end encrypted.",
        );
      }

      finish(404, { "content-type": "text/plain; charset=utf-8" }, "not found");
    },
  });
}
