import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";

export type SnapshotRow = {
  document_id: string;
  schema_version: string;
  yjs_state: Buffer;
  checkpoint_seq: number;
  persisted_at: string;
  digest: string | null;
};

export type RoomRow = {
  document_id: string;
  schema_version: string;
  created_at: string;
};

export function openSyncDatabase(dataDir: string): Database.Database {
  const file = resolve(dataDir, "syncspace.sqlite");
  mkdirSync(dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      document_id TEXT PRIMARY KEY,
      schema_version TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS capabilities (
      document_id TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      revoked_at TEXT,
      PRIMARY KEY (document_id, token_hash)
    );
    CREATE TABLE IF NOT EXISTS snapshots (
      document_id TEXT PRIMARY KEY,
      schema_version TEXT NOT NULL,
      yjs_state BLOB NOT NULL,
      checkpoint_seq INTEGER NOT NULL,
      persisted_at TEXT NOT NULL,
      digest TEXT
    );
  `);
  return db;
}

export function getRoom(db: Database.Database, documentId: string): RoomRow | undefined {
  return db.prepare("SELECT * FROM rooms WHERE document_id = ?").get(documentId) as RoomRow | undefined;
}

export function insertRoom(db: Database.Database, documentId: string, schemaVersion: string): void {
  db.prepare("INSERT INTO rooms (document_id, schema_version, created_at) VALUES (?, ?, ?)").run(
    documentId,
    schemaVersion,
    new Date().toISOString(),
  );
}

export function insertCapability(db: Database.Database, documentId: string, tokenHash: string): void {
  db.prepare(
    "INSERT OR IGNORE INTO capabilities (document_id, token_hash, created_at, revoked_at) VALUES (?, ?, ?, NULL)",
  ).run(documentId, tokenHash, new Date().toISOString());
}

export function activeTokenHashes(db: Database.Database, documentId: string): string[] {
  const rows = db
    .prepare("SELECT token_hash FROM capabilities WHERE document_id = ? AND revoked_at IS NULL")
    .all(documentId) as Array<{ token_hash: string }>;
  return rows.map((row) => row.token_hash);
}

export function revokeCapability(db: Database.Database, documentId: string, tokenHash: string): boolean {
  const result = db
    .prepare(
      "UPDATE capabilities SET revoked_at = ? WHERE document_id = ? AND token_hash = ? AND revoked_at IS NULL",
    )
    .run(new Date().toISOString(), documentId, tokenHash);
  return result.changes > 0;
}

export function fetchSnapshot(db: Database.Database, documentId: string): SnapshotRow | undefined {
  return db.prepare("SELECT * FROM snapshots WHERE document_id = ?").get(documentId) as SnapshotRow | undefined;
}

export function storeSnapshot(
  db: Database.Database,
  input: { documentId: string; schemaVersion: string; state: Uint8Array; digest?: string },
): SnapshotRow {
  const existing = fetchSnapshot(db, input.documentId);
  const sequence = (existing?.checkpoint_seq ?? 0) + 1;
  const persistedAt = new Date().toISOString();
  const state = Buffer.from(input.state);
  db.prepare(
    `INSERT INTO snapshots (document_id, schema_version, yjs_state, checkpoint_seq, persisted_at, digest)
     VALUES (@document_id, @schema_version, @yjs_state, @checkpoint_seq, @persisted_at, @digest)
     ON CONFLICT(document_id) DO UPDATE SET
       schema_version = excluded.schema_version,
       yjs_state = excluded.yjs_state,
       checkpoint_seq = excluded.checkpoint_seq,
       persisted_at = excluded.persisted_at,
       digest = excluded.digest`,
  ).run({
    document_id: input.documentId,
    schema_version: input.schemaVersion,
    yjs_state: state,
    checkpoint_seq: sequence,
    persisted_at: persistedAt,
    digest: input.digest ?? null,
  });
  return {
    document_id: input.documentId,
    schema_version: input.schemaVersion,
    yjs_state: state,
    checkpoint_seq: sequence,
    persisted_at: persistedAt,
    digest: input.digest ?? null,
  };
}
