import { SAMPLE_ROOM_ID, createOpaqueId } from "@syncspace/contracts";
import { listLocalBoards } from "@syncspace/personal-store";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../../lib/tokens.js";

const SYNC_HTTP = import.meta.env.VITE_SYNC_HTTP ?? "http://127.0.0.1:4357";

type BoardRow = { id: string; title: string; kind: string; updatedAt: string };

export function HomePage() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardRow[]>([]);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    void listLocalBoards().then(setBoards);
  }, []);

  async function openSample() {
    setJoinError(null);
    try {
      const response = await fetch(`${SYNC_HTTP}/dev/sample-room`);
      if (!response.ok) {
        throw new Error("The development join helper is not available. Is the sync server running on loopback?");
      }
      const body = (await response.json()) as { roomId: string; token: string };
      setToken(body.roomId, body.token);
      navigate(`/board/${body.roomId}?mode=shared`);
    } catch (error) {
      setJoinError(error instanceof Error ? error.message : "Could not open the sample room.");
    }
  }

  function createStandalone(seedStarter: boolean) {
    const id = createOpaqueId("board").replace(/_/g, "-").toLowerCase();
    navigate(`/board/${id}?mode=standalone${seedStarter ? "&seed=1" : ""}`);
  }

  return (
    <main className="page">
      <section className="hero">
        <h1>Study together. Keep ratings to yourself.</h1>
        <p className="lede">
          SyncSpace Deutsch is a small-group German lesson board. Shared notes and vocabulary travel
          through Yjs. Private review stays in this browser profile. Starter German is draft teaching
          material, not a reviewed curriculum.
        </p>
      </section>

      <div className="cards" style={{ marginTop: "1.5rem" }}>
        <article className="card">
          <h2>Sample shared lesson</h2>
          <p>Open the server-seeded A1–B1 board. The invitation is generated at runtime and is not in git.</p>
          <button type="button" onClick={() => void openSample()}>
            Open {SAMPLE_ROOM_ID}
          </button>
          {joinError ? <p className="banner">{joinError}</p> : null}
        </article>
        <article className="card">
          <h2>Standalone board</h2>
          <p>Saved on this device. Publishing later would create a new room identity, never overwrite an existing one.</p>
          <div className="row">
            <button type="button" onClick={() => createStandalone(false)}>
              Empty board
            </button>
            <button type="button" className="secondary" onClick={() => createStandalone(true)}>
              Local starter copy
            </button>
          </div>
        </article>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Recent on this device</h2>
      {boards.length === 0 ? <p className="meta">No local boards yet.</p> : null}
      <div className="cards">
        {boards.map((board) => (
          <article className="card" key={board.id}>
            <h3>{board.title}</h3>
            <p className="meta">
              {board.kind} · {board.id}
            </p>
            <Link to={`/board/${board.id}?mode=${board.kind}`}>Open</Link>
          </article>
        ))}
      </div>
      <p className="footer-note">
        A green connection later will not mean every keystroke is on disk. Two tabs in one profile are
        not a two-client test.
      </p>
    </main>
  );
}
