import { LESSONS, ROADMAP } from "@syncspace/content";
import { Link } from "react-router-dom";
import { useLessonProgress } from "../useLessonProgress.js";

const PATH: Record<string, string> = {
  "lesson-alphabet": "/learn/alphabet",
  "lesson-sounds": "/learn/sounds",
  "lesson-words": "/learn/words",
  "lesson-phrases": "/learn/phrases",
  "lesson-grammar": "/learn/grammar",
  "lesson-mapper": "/learn/mapper",
  "lesson-builder": "/learn/builder",
  "lesson-sources": "/learn/sources",
};

export function RoadmapPage() {
  const { completed, has } = useLessonProgress();
  const total = ROADMAP.length;
  const done = ROADMAP.filter((station) => has(station.lessonId)).length;

  return (
    <>
      <p className="meta">
        {done} of {total} stations ticked on this device. A tick is not a level or an exam result.
      </p>
      <div className="roadmap">
        {ROADMAP.map((station) => {
          const lesson = LESSONS.find((row) => row.id === station.lessonId);
          const doneStation = has(station.lessonId);
          return (
            <article className="card roadmap-card" key={station.id} data-done={doneStation ? "yes" : "no"}>
              <p className="meta">
                Station {station.order}
                {doneStation ? " · ticked" : ""}
              </p>
              <h2>{station.titleEn}</h2>
              <p>{station.goalEn}</p>
              <p className="meta">{lesson ? `About ${lesson.minutes} min.` : null}</p>
              <Link to={PATH[station.lessonId] ?? "/learn"}>Open lesson</Link>
            </article>
          );
        })}
      </div>
      {completed.length === 0 ? (
        <p className="footer-note">Nothing ticked yet. Open Alphabet to start from letters and sounds.</p>
      ) : null}
    </>
  );
}
