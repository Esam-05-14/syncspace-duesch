import { contentHash, createOpaqueId, type LexicalValue, type VocabularyCard } from "@syncspace/contracts";
import {
  detectLostLexicalDraft,
  getNoteText,
  lexicalJson,
  tombstoneCard,
  upsertExercise,
  upsertNote,
  upsertResource,
  upsertVocabulary,
  type LostLexicalDraft,
} from "@syncspace/collab";
import { useEffect, useMemo, useState } from "react";
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

function preparedLexical(value: LexicalValue): LexicalValue {
  return {
    ...value,
    plural: value.partOfSpeech === "noun" ? value.plural : null,
    article: value.partOfSpeech === "noun" ? value.article : null,
  };
}

export function BoardPage() {
  const { boardId, session, board } = useBoardContext();
  const [view, setView] = useState<"list" | "canvas">("list");
  const [lexical, setLexical] = useState<LexicalValue>(emptyLexical);
  const [noteTitle, setNoteTitle] = useState("Neue Notiz");
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [baselineJson, setBaselineJson] = useState<string | null>(null);
  const [conflict, setConflict] = useState<LostLexicalDraft | null>(null);

  const notes = board?.cards.filter((card) => card.type === "note") ?? [];
  const ytext = useMemo(() => {
    if (!session || !selectedNote) {
      return null;
    }
    return getNoteText(session.doc, selectedNote);
  }, [session, selectedNote, board]);

  useEffect(() => {
    if (!board || !editingId || !baselineJson) {
      return;
    }
    const card = board.cards.find((row) => row.id === editingId);
    const lost = detectLostLexicalDraft({
      baselineJson,
      localForm: preparedLexical(lexical),
      remoteLexical: card && card.type === "vocabulary" ? card.lexical : null,
    });
    if (!lost) {
      return;
    }
    setConflict(lost);
    if (lost.kind === "lww") {
      setBaselineJson(lexicalJson(lost.remoteAccepted));
    }
  }, [board, editingId, baselineJson, lexical]);

  function beginEdit(card: VocabularyCard) {
    setEditingId(card.id);
    setLexical(card.lexical);
    setBaselineJson(lexicalJson(card.lexical));
    setConflict(null);
  }

  function clearEditor() {
    setEditingId(null);
    setLexical(emptyLexical);
    setBaselineJson(null);
    setConflict(null);
  }

  function addVocabulary() {
    if (!session || !lexical.headword.trim()) {
      return;
    }
    const next = preparedLexical(lexical);
    upsertVocabulary(session.doc, {
      id: editingId ?? undefined,
      lexical: next,
    });
    clearEditor();
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

  function loadAccepted() {
    if (conflict?.kind !== "lww") {
      return;
    }
    setLexical(conflict.remoteAccepted);
    setBaselineJson(lexicalJson(conflict.remoteAccepted));
    setConflict(null);
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
      <p className="meta">
        List is the editing surface on a narrow screen. Canvas stacks cards under 720px; it is not a
        mobile redesign.
      </p>
      {conflict?.kind === "lww" ? (
        <div className="banner">
          Simultaneous vocabulary saves keep one atomic JSON value. This tab’s form lost. A short-lived
          local draft is still in the fields so you can copy it. Accepted value:{" "}
          <code>{lexicalJson(conflict.remoteAccepted)}</code>
          <div className="row" style={{ marginTop: "0.5rem" }}>
            <button type="button" className="secondary" onClick={loadAccepted}>
              Load accepted value
            </button>
            <button type="button" className="secondary" onClick={() => setConflict(null)}>
              Keep my draft in the form
            </button>
          </div>
        </div>
      ) : null}
      {conflict?.kind === "tombstone" ? (
        <div className="banner">
          A delete won. The card stays gone. This form is a local draft only. Undo would create a new
          card, not resurrect the old id.
          <div className="row" style={{ marginTop: "0.5rem" }}>
            <button type="button" className="secondary" onClick={clearEditor}>
              Dismiss draft
            </button>
          </div>
        </div>
      ) : null}

      <section className="cards board-editors">
        <article className="card">
          <h2>{editingId ? "Edit vocabulary" : "Add vocabulary"}</h2>
          {editingId ? <p className="meta">Editing {editingId}. Last-writer-wins on this lexical JSON.</p> : null}
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
              {editingId ? "Save this card" : "Save lexical tuple"}
            </button>
            {editingId ? (
              <button type="button" className="secondary" onClick={clearEditor}>
                Cancel edit
              </button>
            ) : null}
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
                    <div className="row">
                      {card.type === "vocabulary" ? (
                        <button type="button" className="secondary" onClick={() => beginEdit(card)}>
                          Edit
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => session && tombstoneCard(session.doc, card.id)}
                      >
                        Delete
                      </button>
                    </div>
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
