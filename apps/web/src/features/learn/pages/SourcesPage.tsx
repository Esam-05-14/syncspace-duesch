import { CURRICULUM_SOURCES } from "@syncspace/content";
import { Link } from "react-router-dom";
import { StationComplete } from "../StationComplete.js";

export function SourcesPage() {
  return (
    <>
      <p>
        Reliable public pages we cite. We do not host their videos, PDFs, or exam items. Open
        them in your browser when you want official practice. For listening, reading, writing, and
        speaking grouped by skill, open <Link to="/learn/skills">Four skills</Link>. For a video or
        class you opened elsewhere, keep a note under <Link to="/learn/lectures">Lectures</Link>.
      </p>
      <div className="cards">
        {CURRICULUM_SOURCES.map((source) => (
          <article className="card" key={source.id}>
            <h2>{source.title}</h2>
            <p>{source.useEn}</p>
            <a href={source.url} target="_blank" rel="noreferrer">
              Open official page
            </a>
          </article>
        ))}
      </div>
      <article className="card" style={{ marginTop: "1rem" }}>
        <h2>Duden API (preferred, free key)</h2>
        <p>
          Best German spelling, grammar, and punctuation check we found that still issues a free
          key. Register at{" "}
          <a href="https://www.duden.de/api">duden.de/api</a>, choose the free package if offered,
          and paste the key in Settings. Text leaves this device only after consent. Not a human
          review.
        </p>
      </article>
      <article className="card" style={{ marginTop: "1rem" }}>
        <h2>LanguageTool public proofreading API</h2>
        <p>
          Fallback when no Duden key is saved. Free, no signup, user-started. Text leaves this
          device only after consent. It is not a human review and not guaranteed German. Required
          attribution: <a href="https://languagetool.org">languagetool.org</a>.
        </p>
      </article>
      <StationComplete lessonId="lesson-sources" />
    </>
  );
}
