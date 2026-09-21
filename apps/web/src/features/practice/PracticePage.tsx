import { contentHash } from "@syncspace/contracts";
import { checkArticleRecall } from "@syncspace/learning";
import { enrollInReview } from "@syncspace/personal-store";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { STARTER_PACK_REVIEW } from "@syncspace/content";
import { useBoardContext } from "../boards/board-context.js";

export function PracticePage() {
  const { boardId, board } = useBoardContext();
  const exercises = useMemo(
    () => (board?.cards ?? []).filter((card) => card.type === "exercise" && card.exercise.kind === "article-recall"),
    [board],
  );
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ReturnType<typeof checkArticleRecall> | null>(null);
  const [queueMessage, setQueueMessage] = useState<string | null>(null);
  const current = exercises[index];

  function submit() {
    if (!current || current.type !== "exercise") {
      return;
    }
    const accepted = current.exercise.acceptedArticles[0] ?? "der";
    setResult(checkArticleRecall(answer, accepted));
  }

  async function addCurrentNoun() {
    if (!current || current.type !== "exercise" || !board) {
      return;
    }
    const noun = board.cards.find(
      (card) => card.type === "vocabulary" && card.lexical.headword === current.exercise.noun,
    );
    if (!noun || noun.type !== "vocabulary") {
      setQueueMessage("No matching vocabulary card on this board.");
      return;
    }
    await enrollInReview({
      boardId,
      cardId: noun.id,
      contentHash: contentHash(noun.lexical),
      prompt: {
        headword: noun.lexical.headword,
        article: noun.lexical.article,
        plural: noun.lexical.plural,
        glossEn: noun.lexical.glossEn,
        exampleDe: noun.lexical.exampleDe,
      },
    });
    setQueueMessage(`Added ${noun.lexical.headword} to this profile’s private queue.`);
  }

  if (!current || current.type !== "exercise") {
    return <p>No article-recall exercises on this board yet.</p>;
  }

  return (
    <>
      <div className="banner">{STARTER_PACK_REVIEW}</div>
      <article className="card">
        <p className="badge draft">{current.contentStatus} · {current.exercise.normalization}</p>
        <h2>{current.exercise.prompt}</h2>
        <p className="meta">Dictionary article only: der, die, or das. This is not a case question.</p>
        <label>
          Answer
          <input
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            autoComplete="off"
            aria-label="Dictionary article"
          />
        </label>
        <div className="row" style={{ marginTop: "0.75rem" }}>
          <button type="button" onClick={submit}>
            Check
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setIndex((value) => (value + 1) % exercises.length);
              setAnswer("");
              setResult(null);
              setQueueMessage(null);
            }}
          >
            Next
          </button>
          {result ? (
            <button type="button" className="secondary" onClick={() => void addCurrentNoun()}>
              Private review
            </button>
          ) : null}
        </div>
        {queueMessage ? <p className="banner">{queueMessage}</p> : null}
        {result ? (
          <section style={{ marginTop: "1rem" }}>
            <p>
              {result.ok ? "Matches the authored key." : "Not one of the accepted answers for this exercise."}
            </p>
            <p className="meta">
              Applied rule: {result.appliedRule}. Submitted <code>{result.submitted}</code>. Authored key{" "}
              <code>{result.accepted}</code>.
            </p>
            <p>{current.exercise.explanation}</p>
            <p className="meta">
              Ratings live under <Link to="/review">private review</Link>. Checking here does not record a
              box rating.
            </p>
          </section>
        ) : null}
      </article>
    </>
  );
}
