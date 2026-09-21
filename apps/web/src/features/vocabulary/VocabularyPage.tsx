import { contentHash } from "@syncspace/contracts";
import { enrollInReview } from "@syncspace/personal-store";
import { useState } from "react";
import { useBoardContext } from "../boards/board-context.js";

export function VocabularyPage() {
  const { boardId, board } = useBoardContext();
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const nouns = (board?.cards ?? []).filter((card) => card.type === "vocabulary");
  const visible = nouns.filter((card) =>
    card.lexical.headword.toLowerCase().includes(filter.toLocaleLowerCase("de-DE")),
  );

  async function addToReview(cardId: string, lexical: (typeof nouns)[number]["lexical"]) {
    const hash = contentHash(lexical);
    await enrollInReview({ boardId, cardId, contentHash: hash });
    setMessage(`Added to this profile’s private queue. Other learners will not see it.`);
  }

  return (
    <>
      <label>
        Filter
        <input value={filter} onChange={(event) => setFilter(event.target.value)} />
      </label>
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
                    <button type="button" className="secondary" onClick={() => void addToReview(card.id, card.lexical)}>
                      Private review
                    </button>
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
