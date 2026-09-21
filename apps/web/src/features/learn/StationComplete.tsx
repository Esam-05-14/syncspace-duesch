import { useLessonProgress } from "./useLessonProgress.js";

export function StationComplete({ lessonId }: { lessonId: string }) {
  const { has, complete, busy } = useLessonProgress();
  const done = has(lessonId);

  return (
    <div className="row" style={{ marginTop: "1.25rem" }}>
      <button type="button" disabled={busy || done} onClick={() => void complete(lessonId)}>
        {done ? "Ticked on this device" : "Mark station complete"}
      </button>
      <span className="meta">Saved in this profile only. Not sent to the sync server.</span>
    </div>
  );
}
