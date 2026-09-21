import { HocuspocusProvider } from "@hocuspocus/provider";
import {
  applyMaterializedBoard,
  initBoardDoc,
  materializeBoard,
} from "@syncspace/collab";
import { createStarterBoard } from "@syncspace/content";
import { rememberBoard, getRememberedToken } from "@syncspace/personal-store";
import type { MaterializedBoard, SyncEvent } from "@syncspace/contracts";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { createSyncEvent, pushEvent } from "./sync-log.js";
import { getToken, setToken } from "./tokens.js";

const SYNC_WS = import.meta.env.VITE_SYNC_WS ?? "ws://127.0.0.1:4357";
const SYNC_HTTP = import.meta.env.VITE_SYNC_HTTP ?? "http://127.0.0.1:4357";

export type SessionStatus = {
  localRestore: boolean;
  connected: boolean;
  authorized: boolean;
  initialSync: boolean;
  lastCheckpoint: string | null;
  offlineLocalChanges: boolean;
  storageError: string | null;
};

export type BoardSession = {
  doc: Y.Doc;
  persistence: IndexeddbPersistence;
  provider: HocuspocusProvider | null;
  status: SessionStatus;
  events: SyncEvent[];
};

const sessions = new Map<string, BoardSession>();
const listeners = new Map<string, Set<() => void>>();

function emit(boardId: string): void {
  for (const listener of listeners.get(boardId) ?? []) {
    listener();
  }
}

function note(session: BoardSession, category: SyncEvent["category"], detail: string): void {
  session.events = pushEvent(session.events, createSyncEvent(category, detail));
}

export function subscribeSession(boardId: string, listener: () => void): () => void {
  const set = listeners.get(boardId) ?? new Set();
  set.add(listener);
  listeners.set(boardId, set);
  return () => set.delete(listener);
}

export function getSession(boardId: string): BoardSession | undefined {
  return sessions.get(boardId);
}

export async function openBoardSession(input: {
  boardId: string;
  title?: string;
  mode: "standalone" | "shared";
  seedStarter?: boolean;
}): Promise<BoardSession> {
  const existing = sessions.get(input.boardId);
  if (existing) {
    if (input.mode === "shared" && !existing.provider) {
      let token = getToken(input.boardId);
      if (!token) {
        token = await getRememberedToken(input.boardId);
        if (token) {
          setToken(input.boardId, token);
        }
      }
      if (token) {
        attachProvider(existing, input.boardId, token);
        watchCheckpoints(existing, input.boardId);
      }
    }
    return existing;
  }

  const doc = new Y.Doc();
  const persistence = new IndexeddbPersistence(`syncspace-ydoc-${input.boardId}`, doc);
  const session: BoardSession = {
    doc,
    persistence,
    provider: null,
    status: {
      localRestore: false,
      connected: false,
      authorized: false,
      initialSync: false,
      lastCheckpoint: null,
      offlineLocalChanges: false,
      storageError: null,
    },
    events: [],
  };
  sessions.set(input.boardId, session);

  persistence.on("synced", () => {
    session.status.localRestore = true;
    note(session, "local-restore", "Local document restore completed on this device.");
    const meta = doc.getMap("meta");
    if (!meta.get("boardId") && input.mode === "standalone") {
      if (input.seedStarter) {
        applyMaterializedBoard(doc, createStarterBoard(input.boardId));
      } else {
        initBoardDoc(doc, {
          boardId: input.boardId,
          title: input.title ?? "Neue Lektion",
          mode: input.mode,
        });
      }
    }
    void rememberBoard({
      id: input.boardId,
      title: String(meta.get("title") ?? input.title ?? "Lektion"),
      kind: input.mode,
      updatedAt: new Date().toISOString(),
    });
    emit(input.boardId);
  });

  persistence.on("error", () => {
    session.status.storageError = "Browser storage failed. Export if you can.";
    note(session, "storage-failure", "IndexedDB persistence reported an error.");
    emit(input.boardId);
  });

  doc.on("update", () => {
    if (input.mode === "shared" && !session.status.initialSync) {
      session.status.offlineLocalChanges = true;
    } else if (input.mode === "shared" && !session.status.connected) {
      session.status.offlineLocalChanges = true;
    }
    try {
      const board = materializeBoard(doc);
      void rememberBoard({
        id: board.boardId,
        title: board.title,
        kind: board.mode,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // Incomplete document during first attach.
    }
    emit(input.boardId);
  });

  if (input.mode === "shared") {
    let token = getToken(input.boardId);
    if (!token) {
      token = await getRememberedToken(input.boardId);
      if (token) {
        setToken(input.boardId, token);
        note(session, "authorized", "Loaded a remembered room token from this browser profile.");
      }
    }
    if (!token) {
      note(session, "storage-failure", "No room token in memory. This device is not authorized.");
    } else {
      attachProvider(session, input.boardId, token);
      watchCheckpoints(session, input.boardId);
    }
  }

  return session;
}

function attachProvider(session: BoardSession, boardId: string, token: string): void {
  const provider = new HocuspocusProvider({
    url: SYNC_WS,
    name: boardId,
    document: session.doc,
    token,
  });
  session.provider = provider;

  provider.on("connect", () => {
    session.status.connected = true;
    note(session, "authorized", "Provider socket connected. Authorization is still being checked.");
    emit(boardId);
  });
  provider.on("authenticated", () => {
    session.status.authorized = true;
    note(session, "authorized", "Room token accepted for this document.");
    emit(boardId);
  });
  provider.on("synced", () => {
    session.status.initialSync = true;
    session.status.offlineLocalChanges = false;
    note(session, "initial-sync", "Initial synchronization completed.");
    emit(boardId);
  });
  provider.on("disconnect", () => {
    session.status.connected = false;
    session.status.authorized = false;
    note(session, "connection-lost", "Provider disconnected.");
    emit(boardId);
  });
  provider.on("authenticationFailed", () => {
    session.status.authorized = false;
    note(session, "storage-failure", "Invalid or missing room token. Server rejected write access.");
    emit(boardId);
  });
  let remoteNoted = false;
  provider.on("message", () => {
    if (!remoteNoted) {
      note(session, "remote-update", "A remote update was received.");
      remoteNoted = true;
      window.setTimeout(() => {
        remoteNoted = false;
      }, 800);
    }
    emit(boardId);
  });
}

const checkpointWatches = new Set<string>();

function watchCheckpoints(session: BoardSession, boardId: string): void {
  if (checkpointWatches.has(boardId) || typeof window === "undefined") {
    return;
  }
  checkpointWatches.add(boardId);
  const tick = async () => {
    try {
      const response = await fetch(`${SYNC_HTTP}/dev/snapshot/${boardId}`);
      if (!response.ok) {
        return;
      }
      const body = (await response.json()) as { sequence?: number };
      if (typeof body.sequence !== "number") {
        return;
      }
      const label = `seq ${body.sequence}`;
      if (session.status.lastCheckpoint !== label) {
        session.status.lastCheckpoint = label;
        note(session, "checkpoint", `Server checkpoint recorded: sequence ${body.sequence}.`);
        emit(boardId);
      }
    } catch {
      // Inspector and status stay honest if the server is unreachable.
    }
  };
  void tick();
  window.setInterval(() => void tick(), 4000);
}

export function simulateDisconnect(boardId: string): void {
  const session = sessions.get(boardId);
  if (!session?.provider) {
    return;
  }
  session.provider.disconnect();
  note(session, "connection-lost", "Development disconnect control. This is not browser-offline.");
  emit(boardId);
}

export function simulateReconnect(boardId: string): void {
  const session = sessions.get(boardId);
  if (!session?.provider) {
    return;
  }
  note(session, "reconnect-attempt", "Development reconnect control.");
  session.provider.connect();
  emit(boardId);
}

export function currentBoard(boardId: string): MaterializedBoard | null {
  const session = sessions.get(boardId);
  if (!session) {
    return null;
  }
  try {
    return materializeBoard(session.doc);
  } catch {
    return null;
  }
}
