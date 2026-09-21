import { createOpaqueId } from "@syncspace/contracts";
import { listDue, listEvents, listSchedules, rateCard } from "@syncspace/personal-store";
import { checkArticleRecall, describeBox, describeDue, type Box } from "@syncspace/learning";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { ArticleCheck } from "@syncspace/learning";
import type { ReviewEvent, ReviewSchedule } from "@syncspace/contracts";

const ARTICLES = ["der", "die", "das"] as const;

export function ReviewPage() {
  const [due, setDue] = useState<ReviewSchedule[]>([]);
  const [events, setEvents] = useState<ReviewEvent[]>([]);
  const [all, setAll] = useState<ReviewSchedule[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [check, setCheck] = useState<ArticleCheck | null>(null);
  const [revealed, setRevealed] = useState(false);
  const current = due[0];
  const needsArticle = Boolean(current?.prompt?.article);
  const canRate = needsArticle ? check !== null : revealed;

  async function reload() {
    const now = new Date();
    const [nextDue, nextEvents, nextAll] = await Promise.all([
      listDue(now),
      listEvents(),
      listSchedules(),
    ]);
    setDue(nextDue);
    setEvents(nextEvents);
    setAll(nextAll);
    setCheck(null);
    setRevealed(false);
  }

  useEffect(() => {
    void reload();
  }, []);

  async function rate(rating: "again" | "got-it") {
    if (!current || busy || !canRate) {
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

  const upcoming = all.filter((row) => !due.some((item) => item.cardId === row.cardId)).slice(0, 8);

  return (
    <main className="page">
      <h1>Private review</h1>
      <p className="lede">
        This queue is only on this device. It is not on the shared board, not in awareness, and not
        sent to the sync server. Checking der/die/das uses the authored key. Again / Got it is your
        own rating.
      </p>
      {error ? <p className="banner">{error}</p> : null}
      {!current ? (
        <article className="card">
          <p>Nothing due for this profile right now.</p>
          {all[0] ? (
            <p className="meta">
              Next card {describeDue(all[0].dueAt)}. {describeBox(all[0].box as Box)}.
            </p>
          ) : (
            <p className="meta">
              Open a board saved on this device, then add nouns from Vocabulary.{" "}
              <Link to="/">Go to boards</Link>
            </p>
          )}
        </article>
      ) : (
        <article className="card">
          <p className="meta">
            {describeBox(current.box as Box)} · {describeDue(current.dueAt)} ·{" "}
            {due.length} due
          </p>
          <h2>{current.prompt?.headword ?? current.cardId}</h2>
          {current.prompt?.article ? (
            <>
              <p className="meta">Dictionary article only: der, die, or das. This is not a case question.</p>
              <div className="row">
                {ARTICLES.map((article) => (
                  <button
                    key={article}
                    type="button"
                    className="secondary"
                    disabled={busy}
                    onClick={() => {
                      setCheck(checkArticleRecall(article, current.prompt?.article ?? article));
                      setRevealed(true);
                    }}
                  >
                    {article}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button type="button" className="secondary" onClick={() => setRevealed(true)}>
              Reveal reminder
            </button>
          )}
          {check ? (
            <p style={{ marginTop: "0.75rem" }}>
              {check.ok ? "Matches the authored key." : "Not the authored dictionary article."}{" "}
              <span className="meta">
                Submitted <code>{check.submitted}</code>
                {revealed ? (
                  <>
                    {" "}
                    · key <code>{check.accepted}</code>
                  </>
                ) : null}
              </span>
            </p>
          ) : null}
          {revealed && current.prompt ? (
            <section style={{ marginTop: "1rem" }}>
              <p>
                {current.prompt.article ? (
                  <span className="badge article">{current.prompt.article}</span>
                ) : null}{" "}
                <strong>{current.prompt.headword}</strong>
                {current.prompt.plural ? ` · plural ${current.prompt.plural}` : ""}
              </p>
              <p>{current.prompt.glossEn}</p>
              <p className="meta">{current.prompt.exampleDe}</p>
              <p className="meta">Prompt saved on this device when you enrolled the card. Starter keys stay draft.</p>
            </section>
          ) : null}
          {!current.prompt ? (
            <p className="meta">
              This card was enrolled without a study prompt. Open its board vocabulary table and add it
              again to attach the headword on this device.
            </p>
          ) : null}
          <div className="row" style={{ marginTop: "0.75rem" }}>
            <button type="button" disabled={busy || !canRate} onClick={() => void rate("again")}>
              Again
            </button>
            <button type="button" disabled={busy || !canRate} onClick={() => void rate("got-it")}>
              Got it
            </button>
          </div>
        </article>
      )}
      <h2>This profile</h2>
      <p className="meta">
        Completed ratings: {events.length}. Active cards: {all.length}. No CEFR level is computed.
      </p>
      {upcoming.length > 0 ? (
        <ul>
          {upcoming.map((row) => (
            <li key={row.cardId} className="meta">
              {row.prompt?.headword ?? row.cardId} · {describeBox(row.box as Box)} ·{" "}
              {describeDue(row.dueAt)}
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
