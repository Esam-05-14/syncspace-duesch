import type { BoardSession } from "../lib/board-session.js";

export function StatusBar({
  session,
  mode = "shared",
}: {
  session?: BoardSession;
  mode?: "standalone" | "shared";
}) {
  const status = session?.status;
  return (
    <div className="status-strip" aria-live="polite">
      <span>
        Saved on this device: <b>{status?.localRestore ? "yes" : "not yet"}</b>
      </span>
      {mode === "shared" ? (
        <>
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
            Server checkpoint recorded: <b>{status?.lastCheckpoint ?? "not yet"}</b>
          </span>
        </>
      ) : null}
    </div>
  );
}
