import type { BoardSession } from "../lib/board-session.js";

export function StatusBar({ session }: { session?: BoardSession }) {
  const status = session?.status;
  return (
    <div className="status-strip" aria-live="polite">
      <span>
        Saved on this device: <b>{status?.localRestore ? "yes" : "not yet"}</b>
      </span>
      <span>
        Connected: <b>{status?.connected ? "yes" : "no"}</b>
      </span>
      <span>
        Authorized: <b>{status?.authorized ? "yes" : "no"}</b>
      </span>
      <span>
        Initial sync: <b>{status?.initialSync ? "complete" : "not complete"}</b>
      </span>
      <span>
        Server checkpoint: <b>{status?.lastCheckpoint ?? "not shown here"}</b>
      </span>
    </div>
  );
}
