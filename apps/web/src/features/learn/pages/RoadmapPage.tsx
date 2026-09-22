import { LESSONS, ROADMAP } from "@syncspace/content";
import { Link } from "react-router-dom";
import { nextOpenStation, pathForLesson } from "../stations.js";
import { useLessonProgress } from "../useLessonProgress.js";

export function RoadmapPage() {
  const { completed, has } = useLessonProgress();
  const total = ROADMAP.length;
  const done = ROADMAP.filter((station) => has(station.lessonId)).length;
  const next = nextOpenStation(completed);
  const percent = Math.round((done / total) * 100);

  return (
    <>
      <p className="meta">
        {done} of {total} stations ticked on this device. A tick is not a level or an exam result.
      </p>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      {next ? (
        <p>
          Next open station: <Link to={pathForLesson(next.lessonId)}>{next.titleEn}</Link>
          <span className="meta"> — {next.goalEn}</span>
        </p>
      ) : (
        <p>
          Path ticked. Keep the words warm with the <Link to="/learn/drill">cover drill</Link>.
        </p>
      )}
      <div className="roadmap">
        {ROADMAP.map((station) => {
          const lesson = LESSONS.find((row) => row.id === station.lessonId);
          const doneStation = has(station.lessonId);
          const current = next?.id === station.id;
          return (
            <article
              className="card roadmap-card"
              key={station.id}
              data-done={doneStation ? "yes" : "no"}
              data-current={current ? "yes" : "no"}
            >
              <p className="meta">
                Station {station.order}
                {doneStation ? " · ticked" : current ? " · next" : ""}
              </p>
              <h2>{station.titleEn}</h2>
              <p>{station.goalEn}</p>
              <p className="meta">{lesson ? `About ${lesson.minutes} min.` : null}</p>
              <Link to={pathForLesson(station.lessonId)}>{current ? "Continue" : "Open lesson"}</Link>
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
