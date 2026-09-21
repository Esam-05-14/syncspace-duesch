import { PHRASES } from "@syncspace/content";
import { useMemo, useState } from "react";
import { SpeakButton } from "../SpeakButton.js";
import { StationComplete } from "../StationComplete.js";

export function PhrasesPage() {
  const topics = useMemo(() => ["all", ...new Set(PHRASES.map((row) => row.topic))], []);
  const [topic, setTopic] = useState("all");
  const visible = PHRASES.filter((row) => topic === "all" || row.topic === topic);

  return (
    <>
      <p>
        Fixed everyday lines with a situation in English. These are stock classroom phrases, not
        quotes from Nicos Weg or Goethe exam papers.
      </p>
      <div className="row" style={{ margin: "0.75rem 0" }}>
        {topics.map((value) => (
          <button
            key={value}
            type="button"
            className={topic === value ? undefined : "secondary"}
            onClick={() => setTopic(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="cards">
        {visible.map((row) => (
          <article className="card" key={row.id}>
            <p className="badge draft">{row.contentStatus}</p>
            <h2>{row.de}</h2>
            <p>{row.en}</p>
            <p className="ipa">/{row.ipa}/</p>
            <p className="meta">{row.situationEn}</p>
            <p>{row.notesEn}</p>
            <SpeakButton text={row.de} />
          </article>
        ))}
      </div>
      <StationComplete lessonId="lesson-phrases" />
    </>
  );
}
