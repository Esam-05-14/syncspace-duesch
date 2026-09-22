import { LECTURE_BOARD_ID, contentHash, type LectureFactKind, type LectureNote } from "@syncspace/contracts";
import {
  addLectureFact,
  deleteLecture,
  enrollInReview,
  getLecture,
  removeLectureFact,
  saveLecture,
} from "@syncspace/personal-store";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArticleBadge } from "../ArticleBadge.js";
import { MediaEmbed } from "../MediaEmbed.js";
import { ProofreadPanel } from "../ProofreadPanel.js";

const FACT_KINDS: LectureFactKind[] = ["word", "phrase", "fact"];
const ARTICLES = ["", "der", "die", "das"] as const;

export function LecturePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState<LectureNote | null>(null);
  const [missing, setMissing] = useState(false);
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [factKind, setFactKind] = useState<LectureFactKind>("word");
  const [factDe, setFactDe] = useState("");
  const [factEn, setFactEn] = useState("");
  const [factArticle, setFactArticle] = useState<(typeof ARTICLES)[number]>("");
  const [factNote, setFactNote] = useState("");
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    void getLecture(id).then((row) => {
      if (!row) {
        setMissing(true);
        return;
      }
      setLecture(row);
      setNotes(row.notes);
      setTitle(row.title);
    });
  }, [id]);

  function queueSave(next: LectureNote) {
    setLecture(next);
    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }
    saveTimer.current = window.setTimeout(() => {
      void saveLecture(next).then(setLecture);
    }, 400);
  }

  async function addFact(event: FormEvent) {
    event.preventDefault();
    if (!lecture || !factDe.trim()) {
      return;
    }
    const next = await addLectureFact(lecture.id, {
      kind: factKind,
      de: factDe.trim(),
      en: factEn.trim(),
      article: factArticle === "" ? null : factArticle,
      note: factNote.trim(),
    });
    setLecture(next);
    setFactDe("");
    setFactEn("");
    setFactNote("");
    setMessage("Saved on this device.");
  }

  async function enroll(factId: string) {
    const fact = lecture?.facts.find((row) => row.id === factId);
    if (!fact) {
      return;
    }
    await enrollInReview({
      boardId: LECTURE_BOARD_ID,
      cardId: fact.id,
      contentHash: contentHash({ de: fact.de, en: fact.en, article: fact.article }),
      prompt: {
        headword: fact.de,
        article: fact.article,
        plural: null,
        glossEn: fact.en || fact.de,
        exampleDe: fact.note || fact.de,
      },
    });
    setMessage(`Added ${fact.de} to this profile’s private queue.`);
  }

  if (missing) {
    return <p>That lecture note is not in this profile.</p>;
  }
  if (!lecture) {
    return <p className="meta">Opening the note saved on this device…</p>;
  }

  return (
    <>
      <p>
        <Link to="/learn/lectures">All lecture notes</Link>
        <span className="meta"> · saved on this device · {lecture.sourceKind}</span>
      </p>
      <label>
        Title
        <input
          value={title}
          onChange={(event) => {
            const nextTitle = event.target.value;
            setTitle(nextTitle);
            queueSave({ ...lecture, title: nextTitle || lecture.title, notes });
          }}
        />
      </label>
      <p>
        <a href={lecture.sourceUrl} target="_blank" rel="noreferrer">
          Open source in a new tab
        </a>
      </p>
      <MediaEmbed lecture={lecture} />
      <label>
        Notes, words in context, helpful facts
        <textarea
          rows={10}
          value={notes}
          onChange={(event) => {
            const nextNotes = event.target.value;
            setNotes(nextNotes);
            queueSave({ ...lecture, title: title || lecture.title, notes: nextNotes });
          }}
        />
      </label>
      <p className="meta">Autosaves in this profile. Not a shared-board edit.</p>
      <ProofreadPanel
        text={notes}
        onApply={(nextNotes) => {
          setNotes(nextNotes);
          queueSave({ ...lecture, title: title || lecture.title, notes: nextNotes });
        }}
      />
      <h2>Words and facts from this lecture</h2>
      <form className="lecture-fact" onSubmit={(event) => void addFact(event)}>
        <label>
          Kind
          <select value={factKind} onChange={(event) => setFactKind(event.target.value as LectureFactKind)}>
            {FACT_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </label>
        <label>
          Article
          <select value={factArticle} onChange={(event) => setFactArticle(event.target.value as (typeof ARTICLES)[number])}>
            {ARTICLES.map((article) => (
              <option key={article || "none"} value={article}>
                {article || "none"}
              </option>
            ))}
          </select>
        </label>
        <label>
          German
          <input value={factDe} onChange={(event) => setFactDe(event.target.value)} />
        </label>
        <label>
          English
          <input value={factEn} onChange={(event) => setFactEn(event.target.value)} />
        </label>
        <label>
          Note
          <input value={factNote} onChange={(event) => setFactNote(event.target.value)} />
        </label>
        <button type="submit">Add to this note</button>
      </form>
      {message ? <p className="banner">{message}</p> : null}
      <div className="cards" style={{ marginTop: "1rem" }}>
        {lecture.facts.map((fact) => (
          <article className="card" key={fact.id}>
            <p className="meta">
              {fact.kind}
              {fact.article ? (
                <>
                  {" "}
                  · <ArticleBadge article={fact.article} />
                </>
              ) : null}
            </p>
            <h3>{fact.de}</h3>
            {fact.en ? <p>{fact.en}</p> : null}
            {fact.note ? <p className="meta">{fact.note}</p> : null}
            <div className="row">
              <Link to={`/learn/inquire?q=${encodeURIComponent(fact.de)}`}>Inquire</Link>
              <button type="button" className="secondary" onClick={() => void enroll(fact.id)}>
                Private review
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => void removeLectureFact(lecture.id, fact.id).then(setLecture)}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="row" style={{ marginTop: "1.5rem" }}>
        <button
          type="button"
          className="secondary"
          onClick={() => {
            if (window.confirm("Delete this lecture note from this device?")) {
              void deleteLecture(lecture.id).then(() => navigate("/learn/lectures"));
            }
          }}
        >
          Delete note
        </button>
      </div>
    </>
  );
}
