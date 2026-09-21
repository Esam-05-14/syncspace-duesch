import { SKILL_GUIDES, SKILL_RESOURCES } from "@syncspace/content";
import type { LanguageSkill } from "@syncspace/contracts";
import { Link } from "react-router-dom";
import { StationComplete } from "../StationComplete.js";

const ORDER: LanguageSkill[] = ["listen", "read", "write", "speak"];

export function SkillsPage() {
  return (
    <>
      <p>
        Four language skills, each with official practice we do not host and a local drill on this
        device. Completing this page is not a CEFR result. Audio and exam papers stay on Goethe and
        Deutsche Welle.
      </p>
      <div className="skill-grid">
        {ORDER.map((skill) => {
          const guide = SKILL_GUIDES[skill];
          const resources = SKILL_RESOURCES.filter((row) => row.skill === skill);
          return (
            <section className="card" key={skill}>
              <p className="meta">{skill}</p>
              <h2>{guide.titleEn}</h2>
              <p>{guide.summaryEn}</p>
              <p className="meta">{guide.localEn}</p>
              <ul className="skill-list">
                {resources.map((row) => (
                  <li key={row.id}>
                    <a href={row.url} target="_blank" rel="noopener noreferrer">
                      {row.title}
                    </a>
                    <div className="meta">
                      {row.levelTag} · {row.useEn}
                    </div>
                    {row.localPath ? <Link to={row.localPath}>Local drill</Link> : null}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <StationComplete lessonId="lesson-skills" />
    </>
  );
}
