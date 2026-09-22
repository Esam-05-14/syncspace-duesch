import { createLecture, listLectures } from "@syncspace/personal-store";
import type { LectureNote } from "@syncspace/contracts";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

export function LecturesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<LectureNote[]>([]);
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void listLectures().then(setRows);
  }, []);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const note = await createLecture({ title, sourceUrl });
      navigate(`/learn/lectures/${note.id}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save that lecture note.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p>
        One note per YouTube video, Vimeo clip, or online class page. Notes, words, and facts stay
        on this device. They are not written to the shared board and are not sent to the sync
        server. We do not host the video.
      </p>
      <form className="lecture-create" onSubmit={(event) => void onCreate(event)}>
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="A1 class, week 3" />
        </label>
        <label>
          https link
          <input
            value={sourceUrl}
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
            autoComplete="off"
          />
        </label>
        <button type="submit" disabled={busy || !sourceUrl.trim()}>
          Create note
        </button>
      </form>
      {error ? <p className="banner">{error}</p> : null}
      {rows.length === 0 ? (
        <p className="meta">No lecture notes yet. Paste a class or video address above.</p>
      ) : (
        <div className="cards" style={{ marginTop: "1rem" }}>
          {rows.map((row) => (
            <article className="card" key={row.id}>
              <p className="meta">{row.sourceKind}</p>
              <h2>{row.title}</h2>
              <p className="meta">{row.facts.length} saved word{row.facts.length === 1 ? "" : "s"} or facts</p>
              <Link to={`/learn/lectures/${row.id}`}>Open note</Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
