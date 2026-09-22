import { GRAMMAR_TOPICS } from "@syncspace/content";
import { useState } from "react";
import { SpeakButton } from "../SpeakButton.js";
import { StationComplete } from "../StationComplete.js";
import { WordOrderViz } from "../visualizers/WordOrderViz.js";

export function GrammarPage() {
  const [openId, setOpenId] = useState(GRAMMAR_TOPICS[0]?.id ?? "");
  const current = GRAMMAR_TOPICS.find((row) => row.id === openId) ?? GRAMMAR_TOPICS[0];
  if (!current) {
    return <p>Grammar records are missing.</p>;
  }

  return (
    <>
      <p>
        Nine first-grammar topics in English. Tables use the same draft keys as the core list.
        This is not a full case course and not a CEFR grammar syllabus.
      </p>
      <WordOrderViz />
      <div className="row" style={{ margin: "0.75rem 0" }}>
        {GRAMMAR_TOPICS.map((topic) => (
          <button
            key={topic.id}
            type="button"
            className={topic.id === current.id ? undefined : "secondary"}
            onClick={() => setOpenId(topic.id)}
          >
            {topic.titleEn}
          </button>
        ))}
      </div>
      {current ? (
        <article className="card">
          <p className="badge draft">draft</p>
          <h2>{current.titleEn}</h2>
          <p>{current.summaryEn}</p>
          <ul>
            {current.pointsEn.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          {current.table ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {current.table.headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {current.table.rows.map((row) => (
                    <tr key={row.join("|")}>
                      {row.map((cell) => (
                        <td key={cell}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <p style={{ marginTop: "0.75rem" }}>
            <strong>{current.exampleDe}</strong>
            <span className="meta"> — {current.exampleEn}</span>
          </p>
          <SpeakButton text={current.exampleDe} />
        </article>
      ) : null}
      <StationComplete lessonId="lesson-grammar" />
    </>
  );
}
