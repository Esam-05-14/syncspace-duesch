import { getLessonProgress, markLessonComplete } from "@syncspace/personal-store";
import { useEffect, useState } from "react";

export function useLessonProgress() {
  const [completed, setCompleted] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getLessonProgress().then((row) => setCompleted(row.completed));
  }, []);

  async function complete(lessonId: string) {
    setBusy(true);
    try {
      const next = await markLessonComplete(lessonId);
      setCompleted(next.completed);
    } finally {
      setBusy(false);
    }
  }

  return { completed, busy, complete, has: (id: string) => completed.includes(id) };
}
