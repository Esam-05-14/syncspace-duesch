import { createOpaqueId } from "@syncspace/contracts";
import { listDue, listEvents, listSchedules, rateCard } from "@syncspace/personal-store";
import { useEffect, useState } from "react";
import type { ReviewEvent, ReviewSchedule } from "@syncspace/contracts";

export function ReviewPage() {
  const [due, setDue] = useState<ReviewSchedule[]>([]);
  const [events, setEvents] = useState<ReviewEvent[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = due[0];

  async function reload() {
    const [nextDue, nextEvents] = await Promise.all([listDue(new Date()), listEvents()]);
    setDue(nextDue);
    setEvents(nextEvents);
    setRevealed(false);
  }

  useEffect(() => {
    void reload();
  }, []);

  async function rate(rating: "again" | "got-it") {
    if (!current || busy) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await rateCard({
        cardId: current.cardId,
        rating,
        eventId: createOpaqueId("evt"),
      });
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Rating was not saved.");
    } finally {
      setBusy(false);
    }
  }

  const [all, setAll] = useState<ReviewSchedule[]>([]);
  useEffect(() => {
    void listSchedules().then(setAll);
  }, [events.length]);

  return (
    <main className="page">
      <h1>Private review</h1>
      <p className="lede">
        Self-rating only. This queue lives in a separate IndexedDB. It is not on the shared board, not
        in awareness, and not sent to the sync server.
      </p>
      {error ? <p className="banner">{error}</p> : null}
      {!current ? (
        <p>Nothing due for this profile right now. Add nouns from a vocabulary table.</p>
      ) : (
        <article className="card">
          <p className="meta">
            Card {current.cardId} · box {current.box} · due {current.dueAt}
          </p>
          <button type="button" className="secondary" onClick={() => setRevealed(true)}>
            Reveal reminder
          </button>
          {revealed ? (
            <p>
              Look at the shared board for the current article, plural, and example. Then rate your
              recall. This is not an objective score.
            </p>
          ) : null}
          <div className="row">
            <button type="button" disabled={busy || !revealed} onClick={() => void rate("again")}>
              Again
            </button>
            <button type="button" disabled={busy || !revealed} onClick={() => void rate("got-it")}>
              Got it
            </button>
          </div>
        </article>
      )}
      <h2>This profile</h2>
      <p className="meta">
        Completed ratings: {events.length}. Active cards: {all.length}. No CEFR level is computed.
      </p>
    </main>
  );
}
