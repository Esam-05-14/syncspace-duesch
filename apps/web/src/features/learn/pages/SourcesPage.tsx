import { CURRICULUM_SOURCES } from "@syncspace/content";
import { StationComplete } from "../StationComplete.js";

export function SourcesPage() {
  return (
    <>
      <p>
        Reliable public pages we cite. We do not host their videos, PDFs, or exam items. Open
        them in your browser when you want official practice.
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
      <StationComplete lessonId="lesson-sources" />
    </>
  );
}
