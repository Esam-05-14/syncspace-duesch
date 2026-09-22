import { CORE_LEXICON, PHRASES } from "@syncspace/content";
import { CURRICULUM_BOARD_ID, contentHash, createOpaqueId } from "@syncspace/contracts";
import { checkArticleRecall, lexemeToReviewPrompt, pickDrillSession } from "@syncspace/learning";
import { enrollInReview, listDue, listSchedules, rateCard } from "@syncspace/personal-store";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleBadge } from "../ArticleBadge.js";
import { SpeakButton } from "../SpeakButton.js";

const ARTICLES = ["der", "die", "das"] as const;

export function DrillPage() {
  const day = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [dueIds, setDueIds] = useState<string[]>([]);
  const [queued, setQueued] = useState<Set<string>>(new Set());
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [articleOk, setArticleOk] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(0);

  useEffect(() => {
    void Promise.all([listDue(new Date()), listSchedules()]).then(([due, schedules]) => {
      setDueIds(due.map((row) => row.cardId));
      setQueued(new Set(schedules.map((row) => row.cardId)));
    });
  }, [message, done]);

  const items = useMemo(
    () => pickDrillSession({ lexemes: CORE_LEXICON, phrases: PHRASES, dueCardIds: dueIds, day }),
    [dueIds, day],
  );
  const current = items[index];
  const enrolled = Boolean(current?.lexemeId && queued.has(current.lexemeId));

  function advance() {
    setRevealed(false);
    setArticleOk(null);
    setIndex((value) => (value + 1) % Math.max(items.length, 1));
    setDone((value) => value + 1);
  }

  async function enroll() {
    if (!current?.lexemeId) {
      return;
    }
    const lexeme = CORE_LEXICON.find((row) => row.id === current.lexemeId);
    if (!lexeme) {
      return;
    }
    await enrollInReview({
      boardId: CURRICULUM_BOARD_ID,
      cardId: lexeme.id,
      contentHash: contentHash({
        de: lexeme.de,
        en: lexeme.en,
        article: lexeme.article,
        exampleDe: lexeme.exampleDe,
      }),
      prompt: lexemeToReviewPrompt(lexeme),
    });
    setMessage(`Added ${lexeme.de} to this profile’s private queue.`);
  }

  async function rate(rating: "again" | "got-it") {
    if (!current?.lexemeId || !enrolled) {
      advance();
      return;
    }
    await rateCard({
      cardId: current.lexemeId,
      rating,
      eventId: createOpaqueId("evt"),
    });
    setMessage(rating === "got-it" ? "Saved as Got it on this device." : "Saved as Again on this device.");
    advance();
  }

  if (!current) {
    return <p>No drill items in the authored list.</p>;
  }

  return (
    <>
      <p>
        Cover the English, say the German, then reveal. Today’s set is a fixed mix from the core
        list (due nouns first). Checking an article uses the authored key. Ratings write only if
        the word is already in this profile’s queue.
      </p>
      <p className="meta">
        {day} · card {index + 1} of {items.length} · {done} seen this visit
      </p>
      {message ? <p className="banner">{message}</p> : null}
      <article className="card drill-card">
        <p className="meta">
          {current.kind}
          {current.article ? (
            <>
              {" "}
              · hide article until you pick
            </>
          ) : null}
        </p>
        <h2 className="drill-front">{current.kind === "word" ? current.speakText : current.frontDe}</h2>
        {current.kind === "word" && current.article && !revealed ? (
          <div className="row">
            {ARTICLES.map((article) => (
              <button
                key={article}
                type="button"
                className="secondary"
                onClick={() => {
                  const result = checkArticleRecall(article, current.article ?? article);
                  setArticleOk(result.ok);
                  setRevealed(true);
                }}
              >
                {article}
              </button>
            ))}
          </div>
        ) : null}
        {!revealed && !(current.kind === "word" && current.article) ? (
          <button type="button" onClick={() => setRevealed(true)}>
            Reveal English
          </button>
        ) : null}
        {revealed ? (
          <section className="drill-back">
            {articleOk !== null ? (
              <p>{articleOk ? "Matches the authored article." : "Not the authored dictionary article."}</p>
            ) : null}
            <p>
              <ArticleBadge article={current.article} /> <strong>{current.speakText}</strong>
            </p>
            <p>{current.backEn}</p>
            <p className="meta">{current.detailEn}</p>
            <div className="row">
              <SpeakButton text={current.speakText} label="Speak" />
              {current.lexemeId ? (
                <Link to={`/learn/builder?noun=${encodeURIComponent(current.speakText)}`}>Use in a sentence</Link>
              ) : (
                <Link to="/learn/phrases">Open phrases</Link>
              )}
              {current.lexemeId && !enrolled ? (
                <button type="button" className="secondary" onClick={() => void enroll()}>
                  Private review
                </button>
              ) : null}
            </div>
            <div className="row" style={{ marginTop: "0.75rem" }}>
              {enrolled ? (
                <>
                  <button type="button" className="secondary" onClick={() => void rate("again")}>
                    Again
                  </button>
                  <button type="button" onClick={() => void rate("got-it")}>
                    Got it
                  </button>
                </>
              ) : (
                <button type="button" onClick={advance}>
                  Next
                </button>
              )}
            </div>
          </section>
        ) : (
          <p className="meta">Recall the English{current.article ? " and the article" : ""} before you reveal.</p>
        )}
      </article>
    </>
  );
}
