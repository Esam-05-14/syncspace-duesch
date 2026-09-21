import { contentHash, createOpaqueId, type LexicalValue } from "@syncspace/contracts";
import { getNoteText, tombstoneCard, upsertExercise, upsertNote, upsertResource, upsertVocabulary } from "@syncspace/collab";
import { useMemo, useState } from "react";
import { NoteEditor } from "../../components/NoteEditor.js";
import { useBoardContext } from "./board-context.js";

const emptyLexical: LexicalValue = {
  partOfSpeech: "noun",
  article: "der",
  headword: "",
  plural: "",
  glossEn: "",
  exampleDe: "",
  tags: [],
};

export function BoardPage() {
  const { boardId, session, board } = useBoardContext();
  const [view, setView] = useState<"list" | "canvas">("list");
  const [lexical, setLexical] = useState<LexicalValue>(emptyLexical);
  const [noteTitle, setNoteTitle] = useState("Neue Notiz");
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [conflictDraft, setConflictDraft] = useState<string | null>(null);

  const notes = board?.cards.filter((card) => card.type === "note") ?? [];
  const ytext = useMemo(() => {
    if (!session || !selectedNote) {
      return null;
    }
    return getNoteText(session.doc, selectedNote);
  }, [session, selectedNote, board]);

  function addVocabulary() {
    if (!session || !lexical.headword.trim()) {
      return;
    }
    const previous = board?.cards.find((card) => card.type === "vocabulary" && card.lexical.headword === lexical.headword);
    try {
      upsertVocabulary(session.doc, {
        lexical: {
          ...lexical,
          plural: lexical.partOfSpeech === "noun" ? lexical.plural : null,
          article: lexical.partOfSpeech === "noun" ? lexical.article : null,
        },
      });
      if (previous && previous.type === "vocabulary") {
        const prev = JSON.stringify(previous.lexical);
        const next = JSON.stringify(lexical);
        if (prev !== next) {
          setConflictDraft(prev);
        }
      }
      setLexical(emptyLexical);
    } catch (error) {
      setConflictDraft(error instanceof Error ? error.message : "Save failed");
    }
  }

  function addNote() {
    if (!session) {
      return;
    }
    const id = upsertNote(session.doc, { title: noteTitle, text: "" });
    setSelectedNote(id);
  }

  function addArticleExercise() {
    if (!session || !lexical.headword || !lexical.article) {
      return;
    }
    const exercise = {
      kind: "article-recall" as const,
      prompt: `Wie lautet der Wörterbuchartikel von „${lexical.headword}“?`,
      noun: lexical.headword,
      acceptedArticles: [lexical.article] as ["der"] | ["die"] | ["das"],
      explanation: "Wörterbuchartikel, nicht Kasus. Draft until a human review is recorded.",
      normalization: "nfc-trim-lower" as const,
    };
    upsertExercise(session.doc, {
      id: createOpaqueId("ex"),
      type: "exercise",
      levelTag: "A1",
      contentStatus: "draft",
      position: { x: 60, y: 60 },
      exercise,
      contentHash: contentHash(exercise),
      createdAt: new Date().toISOString(),
    });
  }

  function addResource() {
    if (!session) {
      return;
    }
    upsertResource(session.doc, {
      title: "Goethe-Institut Übungsmaterial",
      url: "https://www.goethe.de/de/spr/prf/ueb.html",
    });
  }

  return (
    <>
      <div className="row">
        <button type="button" className={view === "list" ? "" : "secondary"} onClick={() => setView("list")}>
          List
        </button>
        <button type="button" className={view === "canvas" ? "" : "secondary"} onClick={() => setView("canvas")}>
          Canvas
        </button>
      </div>
      {conflictDraft ? (
        <div className="banner">
          Concurrent vocabulary saves keep one atomic JSON value. A losing local draft is kept here so
          you can copy and compare: <code>{conflictDraft}</code>
          <button type="button" className="secondary" onClick={() => setConflictDraft(null)}>
            Dismiss
          </button>
        </div>
      ) : null}

      <section className="cards" style={{ marginTop: "1rem" }}>
        <article className="card">
          <h2>Add vocabulary</h2>
          <label>
            Part of speech
            <select
              value={lexical.partOfSpeech}
              onChange={(event) =>
                setLexical((current) => ({
                  ...current,
                  partOfSpeech: event.target.value as LexicalValue["partOfSpeech"],
                }))
              }
            >
              <option value="noun">noun</option>
              <option value="verb">verb</option>
              <option value="other">other</option>
            </select>
          </label>
          {lexical.partOfSpeech === "noun" ? (
            <label>
              Dictionary article
              <select
                value={lexical.article ?? "der"}
                onChange={(event) =>
                  setLexical((current) => ({
                    ...current,
                    article: event.target.value as "der" | "die" | "das",
                  }))
                }
              >
                <option value="der">der</option>
                <option value="die">die</option>
                <option value="das">das</option>
              </select>
            </label>
          ) : null}
          <label>
            Headword
            <input
              value={lexical.headword}
              onChange={(event) => setLexical((current) => ({ ...current, headword: event.target.value }))}
            />
          </label>
          {lexical.partOfSpeech === "noun" ? (
            <label>
              Plural
              <input
                value={lexical.plural ?? ""}
                onChange={(event) => setLexical((current) => ({ ...current, plural: event.target.value }))}
              />
            </label>
          ) : null}
          <label>
            English gloss
            <input
              value={lexical.glossEn}
              onChange={(event) => setLexical((current) => ({ ...current, glossEn: event.target.value }))}
            />
          </label>
          <label>
            German example
            <input
              value={lexical.exampleDe}
              onChange={(event) => setLexical((current) => ({ ...current, exampleDe: event.target.value }))}
            />
          </label>
          <div className="row" style={{ marginTop: "0.6rem" }}>
            <button type="button" onClick={addVocabulary}>
              Save lexical tuple
            </button>
            <button type="button" className="secondary" onClick={addArticleExercise}>
              Add article exercise
            </button>
          </div>
        </article>
        <article className="card">
          <h2>Shared note</h2>
          <label>
            Title
            <input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} />
          </label>
          <button type="button" onClick={addNote}>
            Add note
          </button>
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <button type="button" className="secondary" onClick={() => setSelectedNote(note.id)}>
                  {note.type === "note" ? note.title : note.id}
                </button>
              </li>
            ))}
          </ul>
          {ytext ? (
            <NoteEditor ytext={ytext} awareness={session?.provider?.awareness} />
          ) : (
            <p className="meta">Select a note to edit through the CodeMirror binding.</p>
          )}
        </article>
        <article className="card">
          <h2>Resource</h2>
          <p className="meta">https links only. We link official practice; we do not redistribute exam papers.</p>
          <button type="button" className="secondary" onClick={addResource}>
            Add Goethe practice link
          </button>
        </article>
      </section>

      {view === "list" ? (
        <div className="table-wrap" style={{ marginTop: "1.25rem" }}>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Article / status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {board?.cards.map((card) => (
                <tr key={card.id}>
                  <td>{card.type}</td>
                  <td>
                    {card.type === "vocabulary"
                      ? card.lexical.headword
                      : card.type === "note"
                        ? card.title
                        : card.type === "exercise"
                          ? card.exercise.prompt
                          : card.title}
                  </td>
                  <td>
                    {card.type === "vocabulary" && card.lexical.article ? (
                      <span className="badge article">{card.lexical.article}</span>
                    ) : null}{" "}
                    <span className="badge draft">{card.contentStatus}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="secondary"
                      onClick={() => session && tombstoneCard(session.doc, card.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="canvas" aria-label="Lesson canvas">
          {board?.cards.map((card) => (
            <article
              key={card.id}
              className="canvas-card"
              style={{ left: card.position.x, top: card.position.y }}
            >
              <div className="badge">{card.type}</div>
              <strong>
                {card.type === "vocabulary"
                  ? `${card.lexical.article ?? ""} ${card.lexical.headword}`.trim()
                  : card.type === "note"
                    ? card.title
                    : card.type === "resource"
                      ? card.title
                      : card.exercise.noun}
              </strong>
            </article>
          ))}
        </div>
      )}
      <p className="footer-note">Board {boardId}. Delete writes a tombstone; undo would create a new card.</p>
    </>
  );
}
