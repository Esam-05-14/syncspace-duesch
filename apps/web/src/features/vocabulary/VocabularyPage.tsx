import { contentHash, type LexicalValue } from "@syncspace/contracts";
import { enrollInReview, listSchedules } from "@syncspace/personal-store";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useBoardContext } from "../boards/board-context.js";

function promptFromLexical(lexical: LexicalValue) {
  return {
    headword: lexical.headword,
    article: lexical.article,
    plural: lexical.plural,
    glossEn: lexical.glossEn,
    exampleDe: lexical.exampleDe,
  };
}

export function VocabularyPage() {
  const { boardId, board } = useBoardContext();
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [queued, setQueued] = useState<Set<string>>(new Set());
  const nouns = (board?.cards ?? []).filter((card) => card.type === "vocabulary");
  const visible = nouns.filter((card) =>
    card.lexical.headword.toLowerCase().includes(filter.toLocaleLowerCase("de-DE")),
  );

  useEffect(() => {
    void listSchedules().then((rows) => setQueued(new Set(rows.map((row) => row.cardId))));
  }, [message]);

  async function addToReview(cardId: string, lexical: LexicalValue) {
    await enrollInReview({
      boardId,
      cardId,
      contentHash: contentHash(lexical),
      prompt: promptFromLexical(lexical),
    });
    setMessage(`Added ${lexical.headword} to this profile’s private queue.`);
  }

  async function addVisibleNouns() {
    const targets = visible.filter((card) => card.lexical.partOfSpeech === "noun");
    await Promise.all(
      targets.map((card) =>
        enrollInReview({
          boardId,
          cardId: card.id,
          contentHash: contentHash(card.lexical),
          prompt: promptFromLexical(card.lexical),
        }),
      ),
    );
    setMessage(`Queued ${targets.length} noun${targets.length === 1 ? "" : "s"} on this device.`);
  }

  return (
    <>
      <p className="meta">
        Private review is this profile only. After you add nouns, study them under{" "}
        <Link to="/review">Review</Link> without opening the board.
      </p>
      <label>
        Filter
        <input value={filter} onChange={(event) => setFilter(event.target.value)} />
      </label>
      <div className="row" style={{ marginTop: "0.75rem" }}>
        <button type="button" className="secondary" onClick={() => void addVisibleNouns()}>
          Add visible nouns to private review
        </button>
      </div>
      {message ? <p className="banner">{message}</p> : null}
      <div className="table-wrap" style={{ marginTop: "1rem" }}>
        <table>
          <thead>
            <tr>
              <th>Article</th>
              <th>Headword</th>
              <th>Plural</th>
              <th>Gloss</th>
              <th>Example</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((card) => (
              <tr key={card.id}>
                <td>
                  {card.lexical.article ? (
                    <span className="badge article">{card.lexical.article}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{card.lexical.headword}</td>
                <td>{card.lexical.plural ?? "—"}</td>
                <td>{card.lexical.glossEn}</td>
                <td>{card.lexical.exampleDe}</td>
                <td>
                  {card.lexical.partOfSpeech === "noun" ? (
                    queued.has(card.id) ? (
                      <span className="meta">In this profile’s queue</span>
                    ) : (
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => void addToReview(card.id, card.lexical)}
                      >
                        Private review
                      </button>
                    )
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
