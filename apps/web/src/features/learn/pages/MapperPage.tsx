import { PRACTICE_LEXICON } from "@syncspace/content";
import { mapEnglishToGerman } from "@syncspace/learning";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleBadge } from "../ArticleBadge.js";
import { SpeakButton } from "../SpeakButton.js";
import { StationComplete } from "../StationComplete.js";

export function MapperPage() {
  const [query, setQuery] = useState("table");
  const hits = useMemo(() => mapEnglishToGerman(query, PRACTICE_LEXICON).slice(0, 12), [query]);

  return (
    <>
      <p>
        Type an English gloss. The matcher only searches this authored list (NFC, trim, lower
        case). It does not call a translation API and it does not invent German. For German first,
        use <Link to="/learn/inquire">inquiry</Link> or the <Link to="/learn/drill">cover drill</Link>.
      </p>
      <label>
        English
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="house, please, to buy"
          autoComplete="off"
        />
      </label>
      <p className="meta">
        {hits.length} hit{hits.length === 1 ? "" : "s"} in the authored practice list.
      </p>
      {hits.length === 0 && query.trim() ? (
        <p className="banner">No authored match. Try a shorter everyday word, or open the word list.</p>
      ) : null}
      <div className="cards" style={{ marginTop: "1rem" }}>
        {hits.map((hit) => (
          <article className="card" key={hit.lexeme.id}>
            <p className="meta">
              matched on {hit.matchedOn}
              {hit.lexeme.article ? (
                <>
                  {" "}
                  · <ArticleBadge article={hit.lexeme.article} />
                </>
              ) : (
                <> · {hit.lexeme.pos}</>
              )}
            </p>
            <h2>
              {hit.lexeme.de} <span className="ipa">/{hit.lexeme.ipa}/</span>
            </h2>
            <p>{hit.lexeme.en}</p>
            <p>{hit.lexeme.hookEn}</p>
            <p className="meta">
              {hit.lexeme.exampleDe} — {hit.lexeme.exampleEn}
            </p>
            <div className="row">
              <SpeakButton text={hit.lexeme.de} />
              <SpeakButton text={hit.lexeme.exampleDe} label="Hear example" />
              {hit.lexeme.pos === "noun" ? (
                <Link to={`/learn/builder?noun=${encodeURIComponent(hit.lexeme.de)}`}>Use in a sentence</Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <StationComplete lessonId="lesson-mapper" />
    </>
  );
}
