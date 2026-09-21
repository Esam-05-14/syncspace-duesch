import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { simulateDisconnect, simulateReconnect } from "../../lib/board-session.js";
import { useBoard } from "../../lib/use-board.js";

const SYNC_HTTP = import.meta.env.VITE_SYNC_HTTP ?? "http://127.0.0.1:4357";

type Receipt = {
  documentId: string;
  sequence: number;
  serverTime: string;
  digest?: string | null;
};

export function SyncPage() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const mode = params.get("mode") === "shared" ? "shared" : "standalone";
  const { session } = useBoard(id, mode, params.get("seed") === "1");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`${SYNC_HTTP}/dev/snapshot/${id}`);
        if (!response.ok) {
          return;
        }
        const body = (await response.json()) as Receipt;
        if (!cancelled) {
          setReceipt(body);
          if (session) {
            session.status.lastCheckpoint = `seq ${body.sequence}`;
          }
        }
      } catch {
        // Inspector stays honest if the server is down.
      }
    }
    void load();
    const timer = window.setInterval(() => void load(), 4000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [id, session]);

  return (
    <main className="page">
      <h1>Sync inspector</h1>
      <p className="lede">
        Real events only. Tokens, note text, and private answers are excluded. A development disconnect
        is not the same as turning the browser offline after a production build.
      </p>
      {receipt ? (
        <p className="meta">
          Last known server checkpoint for {receipt.documentId}: sequence {receipt.sequence} at{" "}
          {receipt.serverTime}
          {receipt.digest ? ` · digest ${receipt.digest.slice(0, 12)}…` : ""}. That receipt describes
          the checkpoint, not later local edits.
        </p>
      ) : (
        <p className="meta">No server checkpoint receipt visible (standalone board, or server unreachable).</p>
      )}
      <div className="row">
        <button type="button" className="secondary" onClick={() => simulateDisconnect(id)}>
          Simulate disconnect
        </button>
        <button type="button" className="secondary" onClick={() => simulateReconnect(id)}>
          Reconnect provider
        </button>
      </div>
      <ol className="event-log">
        {(session?.events ?? []).slice().reverse().map((event) => (
          <li key={event.id}>
            <strong>{event.category}</strong>
            <div className="meta">{event.at}</div>
            <div>{event.detail}</div>
          </li>
        ))}
      </ol>
    </main>
  );
}
