import { SAMPLE_ROOM_ID, createOpaqueId } from "@syncspace/contracts";
import { getLastLesson, getLessonProgress, listDue, listLocalBoards, listSchedules } from "@syncspace/personal-store";
import { describeDue } from "@syncspace/learning";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { nextOpenStation, pathForLesson } from "../learn/stations.js";
import { setToken } from "../../lib/tokens.js";

const SYNC_HTTP = import.meta.env.VITE_SYNC_HTTP ?? "http://127.0.0.1:4357";

type BoardRow = { id: string; title: string; kind: string; updatedAt: string };

export function HomePage() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardRow[]>([]);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [dueCount, setDueCount] = useState(0);
  const [nextDue, setNextDue] = useState<string | null>(null);
  const [queueSize, setQueueSize] = useState(0);
  const [lastLesson, setLastLesson] = useState<string | null>(null);
  const [nextStation, setNextStation] = useState<{ titleEn: string; path: string } | null>(null);

  useEffect(() => {
    void Promise.all([
      listLocalBoards(),
      listDue(new Date()),
      listSchedules(),
      getLastLesson(),
      getLessonProgress(),
    ]).then(([local, due, schedules, last, progress]) => {
      setBoards(local);
      setDueCount(due.length);
      setQueueSize(schedules.length);
      setNextDue(schedules[0] ? describeDue(schedules[0].dueAt) : null);
      setLastLesson(last);
      const station = nextOpenStation(progress.completed);
      setNextStation(station ? { titleEn: station.titleEn, path: pathForLesson(station.lessonId) } : null);
    });
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

  const lastStandalone = boards.find((board) => board.kind === "standalone");
  const continuePath = dueCount > 0 ? "/review" : lastLesson && lastLesson !== "/learn" ? lastLesson : nextStation?.path ?? "/learn";
  const continueLabel =
    dueCount > 0
      ? `Review ${dueCount} due`
      : lastLesson && lastLesson !== "/learn"
        ? "Continue last lesson"
        : nextStation
          ? `Open ${nextStation.titleEn}`
          : "Open lessons";

  return (
    <main className="page">
      <section className="hero">
        <h1>Study on this device. Keep ratings private.</h1>
        <p className="lede">
          A local lesson board and a private Again / Got it queue are enough for one learner. Partner
          sync is optional. Starter German is draft teaching material, not a reviewed curriculum.
        </p>
      </section>

      <section className="study-strip">
        <p>
          <b>{dueCount}</b> due now
          {queueSize > 0 && dueCount === 0 ? <span className="meta"> · next {nextDue}</span> : null}
        </p>
        <p>
          Next station:{" "}
          {nextStation ? <Link to={nextStation.path}>{nextStation.titleEn}</Link> : <span>path ticked</span>}
        </p>
        <div className="row">
          <button type="button" onClick={() => navigate(continuePath)}>
            {continueLabel}
          </button>
          <button type="button" className="secondary" onClick={() => navigate("/learn/drill")}>
            Cover drill
          </button>
        </div>
      </section>

      <div className="cards" style={{ marginTop: "1.5rem" }}>
        <article className="card">
          <h2>Lessons from scratch</h2>
          <p>
            Alphabet, sounds, a draft core-500, inquiry, four-skill resources, and a sentence
            builder. Official Goethe and DW pages stay on their own sites.
          </p>
          <div className="row">
            <button type="button" onClick={() => navigate("/learn")}>
              Open lessons
            </button>
            <button type="button" className="secondary" onClick={() => navigate("/learn/inquire")}>
              Fast inquiry
            </button>
                <button type="button" className="secondary" onClick={() => navigate("/learn/skills")}>
                  Four skills
                </button>
                <button type="button" className="secondary" onClick={() => navigate("/learn/lectures")}>
                  Lecture notes
                </button>
          </div>
        </article>
        <article className="card">
          <h2>Private review</h2>
          <p>
            {dueCount > 0
              ? `${dueCount} card${dueCount === 1 ? "" : "s"} due now.`
              : queueSize > 0
                ? `Nothing due. ${nextDue ?? ""}`.trim()
                : "No cards in this profile’s queue yet. Cover a noun, then add it to the queue."}
          </p>
          <div className="row">
            <button type="button" onClick={() => navigate("/review")}>
              Open review
            </button>
            {lastStandalone ? (
              <button
                type="button"
                className="secondary"
                onClick={() => navigate(`/board/${lastStandalone.id}?mode=standalone`)}
              >
                Continue local board
              </button>
            ) : null}
          </div>
        </article>
        <article className="card">
          <h2>Lesson on this device</h2>
          <p>Saved on this device. You can study without the sync server. Publishing later would create a new room identity.</p>
          <div className="row">
            <button type="button" onClick={() => createStandalone(true)}>
              Local starter copy
            </button>
            <button type="button" className="secondary" onClick={() => createStandalone(false)}>
              Empty board
            </button>
          </div>
        </article>
        <article className="card">
          <h2>Study with a partner</h2>
          <p>Open the server-seeded A1–B1 board. Needs the sync process on loopback. The invitation is generated at runtime and is not in git.</p>
          <button type="button" className="secondary" onClick={() => void openSample()}>
            Open {SAMPLE_ROOM_ID}
          </button>
          {joinError ? <p className="banner">{joinError}</p> : null}
        </article>
      </div>

      <h2 style={{ marginTop: "2rem" }}>Recent on this device</h2>
      {boards.length === 0 ? <p className="meta">No local boards yet.</p> : null}
      <div className="cards">
        {boards.map((board) => (
          <article className="card" key={board.id}>
            <h3>{board.title}</h3>
            <p className="meta">
              {board.kind === "standalone" ? "saved on this device" : "shared board"} · {board.id}
            </p>
            <Link to={`/board/${board.id}?mode=${board.kind}`}>Open</Link>
          </article>
        ))}
      </div>
      <p className="footer-note">
        Connected later will not mean every keystroke is on disk. Two tabs in one profile are not a
        two-client test.
      </p>
    </main>
  );
}
