import { CORE_LEXICON, lexiconTopics } from "@syncspace/content";
import { CURRICULUM_BOARD_ID, contentHash } from "@syncspace/contracts";
import { articleMix, foldGerman, lexemeToReviewPrompt } from "@syncspace/learning";
import { enrollInReview, listSchedules } from "@syncspace/personal-store";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SpeakButton } from "../SpeakButton.js";
import { StationComplete } from "../StationComplete.js";
import { ArticleMix } from "../visualizers/ArticleMix.js";

export function WordsPage() {
  const topics = useMemo(() => ["all", ...lexiconTopics()], []);
  const [params] = useSearchParams();
  const [topic, setTopic] = useState("all");
  const [filter, setFilter] = useState(params.get("q") ?? "");
  const [limit, setLimit] = useState(60);
  const [message, setMessage] = useState<string | null>(null);
  const [queued, setQueued] = useState<Set<string>>(new Set());

  useEffect(() => {
    const next = params.get("q");
    if (next) {
      setFilter(next);
    }
  }, [params]);

  const visible = CORE_LEXICON.filter((row) => {
    if (topic !== "all" && row.topic !== topic) {
      return false;
    }
    const needle = foldGerman(filter);
    if (!needle) {
      return true;
    }
    return foldGerman(row.de).includes(needle) || foldGerman(row.en).includes(needle);
  });

  const mix = articleMix(topic === "all" ? CORE_LEXICON : visible);

  useEffect(() => {
    void listSchedules().then((rows) => setQueued(new Set(rows.map((row) => row.cardId))));
  }, [message]);

  async function enroll(id: string) {
    const lexeme = CORE_LEXICON.find((row) => row.id === id);
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

  async function enrollVisibleNouns() {
    const nouns = visible.filter((row) => row.pos === "noun");
    await Promise.all(nouns.map((row) => enroll(row.id)));
    setMessage(`Queued ${nouns.length} noun${nouns.length === 1 ? "" : "s"} from this view.`);
  }

  return (
    <>
      <p>
        Five hundred everyday lemmas authored for this app. Not the Goethe A1 Wortliste. Gender
        on nouns is the dictionary article only. After you add a card, study it under{" "}
        <Link to="/review">private review</Link>.
      </p>
      <ArticleMix mix={mix} />
      <div className="row" style={{ margin: "0.75rem 0", alignItems: "end" }}>
        <label style={{ minWidth: "10rem" }}>
          Topic
          <select value={topic} onChange={(event) => setTopic(event.target.value)}>
            {topics.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label style={{ flex: "1 1 12rem" }}>
          Filter
          <input value={filter} onChange={(event) => setFilter(event.target.value)} />
        </label>
        <button type="button" className="secondary" onClick={() => void enrollVisibleNouns()}>
          Add visible nouns to private review
        </button>
      </div>
      <p className="meta">
        Showing {visible.length} of {CORE_LEXICON.length}.
      </p>
      {message ? <p className="banner">{message}</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Article</th>
              <th>German</th>
              <th>English</th>
              <th>IPA</th>
              <th>Hook</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.slice(0, limit).map((row) => (
              <tr key={row.id}>
                <td>
                  {row.article ? <span className="badge article">{row.article}</span> : row.pos}
                </td>
                <td>
                  <strong>{row.de}</strong>
                  {row.plural ? <div className="meta">pl. {row.plural}</div> : null}
                </td>
                <td>{row.en}</td>
                <td className="ipa">/{row.ipa}/</td>
                <td>
                  {row.hookEn}
                  <div className="meta">
                    {row.exampleDe} — {row.exampleEn}
                  </div>
                </td>
                <td>
                  <SpeakButton text={row.de} label="Speak" />
                  {queued.has(row.id) ? (
                    <div className="meta">In this profile’s queue</div>
                  ) : (
                    <button type="button" className="secondary" onClick={() => void enroll(row.id)}>
                      Private review
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visible.length > limit ? (
        <button type="button" className="secondary" onClick={() => setLimit(visible.length)}>
          Show all {visible.length} in this filter
        </button>
      ) : null}
      <StationComplete lessonId="lesson-words" />
    </>
  );
}
