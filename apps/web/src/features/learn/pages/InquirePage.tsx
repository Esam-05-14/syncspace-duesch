import { PRACTICE_LEXICON, inquiryCorpus } from "@syncspace/content";
import { CURRICULUM_BOARD_ID, contentHash } from "@syncspace/contracts";
import { inquire, lexemeToReviewPrompt, parseInquiry, type InquiryKind } from "@syncspace/learning";
import { enrollInReview, listRecentInquiries, listSchedules, rememberInquiry } from "@syncspace/personal-store";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArticleBadge } from "../ArticleBadge.js";
import { SpeakButton } from "../SpeakButton.js";
import { StationComplete } from "../StationComplete.js";

const KINDS: Array<"all" | InquiryKind> = ["all", "word", "phrase", "grammar", "sound", "letter", "source", "skill"];

const EXAMPLES = [
  { q: "strasse", label: "strasse → Straße" },
  { q: "der tisch", label: "der Tisch" },
  { q: "#food apfel", label: "#food Apfel" },
  { q: "pos:verb gehen", label: "pos:verb" },
  { q: "listen", label: "listen (skill)" },
];

const corpus = inquiryCorpus();

export function InquirePage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const [draft, setDraft] = useState(query);
  const [kind, setKind] = useState<"all" | InquiryKind>("all");
  const [recent, setRecent] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [queued, setQueued] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setDraft(query);
  }, [query]);

  useEffect(() => {
    void listRecentInquiries().then(setRecent);
  }, [query]);

  useEffect(() => {
    void listSchedules().then((rows) => setQueued(new Set(rows.map((row) => row.cardId))));
  }, [message]);

  const parsed = useMemo(() => parseInquiry(query), [query]);
  const hits = useMemo(() => {
    const all = inquire(query, corpus);
    return kind === "all" ? all : all.filter((hit) => hit.kind === kind);
  }, [query, kind]);

  function applyQuery(next: string, remember: boolean) {
    const value = next.trim();
    setParams(value ? { q: value } : {}, { replace: true });
    if (remember && value.length >= 2) {
      void rememberInquiry(value).then(setRecent);
    }
  }

  async function enroll(id: string) {
    const lexeme = PRACTICE_LEXICON.find((row) => row.id === id);
    if (!lexeme) {
      return;
    }
    await enrollInReview({
      boardId: CURRICULUM_BOARD_ID,
      cardId: lexeme.id,
      contentHash: contentHash({
        de: lexeme.de,
        en: lexeme.en,
        article: lexeme.article,
        exampleDe: lexeme.exampleDe,
      }),
      prompt: lexemeToReviewPrompt(lexeme),
    });
    setMessage(`Added ${lexeme.de} to this profile’s private queue.`);
  }

  async function copyGerman(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
    } catch {
      setCopied(null);
    }
  }

  return (
    <>
      <p>
        One box for German or English. Umlauts fold (<code>strasse</code> finds Straße). Filters:{" "}
        <code>der</code>/<code>die</code>/<code>das</code>, <code>#topic</code>, <code>pos:verb</code>. A one-letter typo
        still hits the authored list. Nothing is sent to a translation API.
      </p>
      <form
        className="inquire-form"
        onSubmit={(event) => {
          event.preventDefault();
          applyQuery(draft, true);
        }}
      >
        <label>
          Look up
          <input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              applyQuery(event.target.value, false);
            }}
            placeholder="table, Straße, #food, pos:noun"
            autoComplete="off"
            autoFocus
            name="q"
          />
        </label>
        <button type="submit">Search</button>
      </form>
      <div className="row inquire-ops">
        {EXAMPLES.map((example) => (
          <button key={example.q} type="button" className="secondary" onClick={() => applyQuery(example.q, true)}>
            {example.label}
          </button>
        ))}
      </div>
      {query ? (
        <p className="meta">
          {parsed.article ? `article ${parsed.article} · ` : null}
          {parsed.topic ? `topic ${parsed.topic} · ` : null}
          {parsed.pos ? `pos ${parsed.pos} · ` : null}
          {parsed.text ? `text “${parsed.text}”` : "filter only"}
        </p>
      ) : (
        <p className="meta">Type a word, or press / from any lesson page to jump here.</p>
      )}
      <div className="row inquire-ops">
        {KINDS.map((value) => (
          <button
            key={value}
            type="button"
            className={kind === value ? undefined : "secondary"}
            onClick={() => setKind(value)}
          >
            {value}
          </button>
        ))}
      </div>
      {recent.length > 0 ? (
        <p className="meta">
          Recent on this device:{" "}
          {recent.map((row) => (
            <button key={row} type="button" className="secondary" onClick={() => applyQuery(row, true)}>
              {row}
            </button>
          ))}
        </p>
      ) : null}
      {message ? <p className="banner">{message}</p> : null}
      <p className="meta">
        {hits.length} hit{hits.length === 1 ? "" : "s"}
        {query ? ` for “${query}”` : ""}.
      </p>
      {query && hits.length === 0 ? (
        <p className="banner">No authored match. Try a shorter everyday word, an English gloss, or #food.</p>
      ) : null}
      <div className="cards" style={{ marginTop: "1rem" }}>
        {hits.map((hit) => (
          <article className="card" key={`${hit.kind}-${hit.id}`}>
            <p className="meta">
              {hit.kind}
              {hit.article ? (
                <>
                  {" "}
                  · <ArticleBadge article={hit.article} />
                </>
              ) : null}{" "}
              · {hit.matchedOn} · {hit.score}
            </p>
            <h2>{hit.titleDe}</h2>
            <p>{hit.titleEn}</p>
            <p className="meta">{hit.detailEn}</p>
            <div className="row">
              <Link to={hit.href}>Open</Link>
              {hit.speakText ? <SpeakButton text={hit.speakText} label="Speak" /> : null}
              {hit.exampleDe ? <SpeakButton text={hit.exampleDe} label="Hear example" /> : null}
              {hit.speakText ? (
                <button type="button" className="secondary" onClick={() => void copyGerman(hit.speakText ?? "", hit.id)}>
                  {copied === hit.id ? "Copied" : "Copy"}
                </button>
              ) : null}
              {hit.lexemeId ? (
                queued.has(hit.lexemeId) ? (
                  <span className="meta">In this profile’s queue</span>
                ) : (
                  <button type="button" className="secondary" onClick={() => void enroll(hit.lexemeId ?? "")}>
                    Private review
                  </button>
                )
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <StationComplete lessonId="lesson-inquire" />
    </>
  );
}
