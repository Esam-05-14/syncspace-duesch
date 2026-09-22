import { PRACTICE_LEXICON, SENTENCE_TEMPLATES, WEIL_CLAUSES } from "@syncspace/content";
import {
  checkAccusativeForm,
  checkArticleRecall,
  checkWordOrder,
  pickAccusativeFill,
  pickArticleFill,
  pickWeilClause,
  pickWordOrder,
} from "@syncspace/learning";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleBadge } from "../ArticleBadge.js";
import { SpeakButton } from "../SpeakButton.js";

const ARTICLES = ["der", "die", "das"] as const;
const ACCUSATIVE = ["den", "die", "das"] as const;

function takeOnce(tokens: readonly string[], used: readonly string[]): string[] {
  const remaining = [...used];
  return tokens.filter((token) => {
    const at = remaining.indexOf(token);
    if (at < 0) {
      return true;
    }
    remaining.splice(at, 1);
    return false;
  });
}

export function WritePage() {
  const day = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [mode, setMode] = useState<"article-fill" | "accusative-fill" | "word-order" | "weil-clause">(
    "article-fill",
  );
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [articleOk, setArticleOk] = useState<boolean | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [orderCheck, setOrderCheck] = useState<ReturnType<typeof checkWordOrder> | null>(null);

  const fills = useMemo(() => pickArticleFill({ lexemes: PRACTICE_LEXICON, day }), [day]);
  const accusatives = useMemo(() => pickAccusativeFill({ lexemes: PRACTICE_LEXICON, day }), [day]);
  const orders = useMemo(
    () => pickWordOrder({ lexemes: PRACTICE_LEXICON, templates: SENTENCE_TEMPLATES, day }),
    [day],
  );
  const weils = useMemo(() => pickWeilClause({ clauses: WEIL_CLAUSES, day }), [day]);

  const fill = fills[index % Math.max(fills.length, 1)];
  const accusative = accusatives[index % Math.max(accusatives.length, 1)];
  const order = orders[index % Math.max(orders.length, 1)];
  const weil = weils[index % Math.max(weils.length, 1)];
  const tokenItem = mode === "weil-clause" ? weil : order;
  const unused = tokenItem ? takeOnce(tokenItem.tokens, picked) : [];

  useEffect(() => {
    setRevealed(false);
    setArticleOk(null);
    setPicked([]);
    setOrderCheck(null);
  }, [mode, index]);

  function gradeArticle(article: (typeof ARTICLES)[number]) {
    if (!fill || revealed || mode !== "article-fill") {
      return;
    }
    setArticleOk(checkArticleRecall(article, fill.article).ok);
    setRevealed(true);
  }

  function gradeAccusative(form: (typeof ACCUSATIVE)[number]) {
    if (!accusative || revealed || mode !== "accusative-fill") {
      return;
    }
    setArticleOk(checkAccusativeForm(form, accusative.accepted).ok);
    setRevealed(true);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }
      if (revealed) {
        return;
      }
      if (mode === "article-fill") {
        if (event.key === "1") {
          gradeArticle("der");
        } else if (event.key === "2") {
          gradeArticle("die");
        } else if (event.key === "3") {
          gradeArticle("das");
        }
      } else if (mode === "accusative-fill") {
        if (event.key === "1") {
          gradeAccusative("den");
        } else if (event.key === "2") {
          gradeAccusative("die");
        } else if (event.key === "3") {
          gradeAccusative("das");
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <p>
        Finite writing drills from the authored list. Article fill is dictionary gender, not case.
        Accusative fill is only after <em>haben</em>: der becomes den. Word order uses the same
        sentence patterns as the builder. Weil puts the finite verb of the reason clause last. This
        is not a teacher mark and not a Goethe writing paper.
      </p>
      <p className="meta">
        {day} · 1 / 2 / 3 pick the form · <Link to="/learn/builder">Open the builder</Link>
      </p>
      <div className="row">
        <button
          type="button"
          className={mode === "article-fill" ? undefined : "secondary"}
          onClick={() => {
            setMode("article-fill");
            setIndex(0);
          }}
        >
          Article fill
        </button>
        <button
          type="button"
          className={mode === "accusative-fill" ? undefined : "secondary"}
          onClick={() => {
            setMode("accusative-fill");
            setIndex(0);
          }}
        >
          Accusative
        </button>
        <button
          type="button"
          className={mode === "word-order" ? undefined : "secondary"}
          onClick={() => {
            setMode("word-order");
            setIndex(0);
          }}
        >
          Word order
        </button>
        <button
          type="button"
          className={mode === "weil-clause" ? undefined : "secondary"}
          onClick={() => {
            setMode("weil-clause");
            setIndex(0);
          }}
        >
          Weil
        </button>
      </div>

      {mode === "article-fill" && fill ? (
        <article className="card drill-card">
          <p className="meta">
            Card {(index % fills.length) + 1} of {fills.length}
          </p>
          <h2 className="drill-front">___ {fill.nounDe}</h2>
          <p className="meta">{fill.glossEn}</p>
          {!revealed ? (
            <div className="row">
              {ARTICLES.map((article) => (
                <button key={article} type="button" className="secondary" onClick={() => gradeArticle(article)}>
                  {article}
                </button>
              ))}
            </div>
          ) : (
            <section className="drill-back">
              <p>{articleOk ? "Matches the authored dictionary article." : "Not the authored dictionary article."}</p>
              <p>
                <ArticleBadge article={fill.article} /> <strong>{fill.nounDe}</strong>
              </p>
              <p className="meta">{fill.exampleDe}</p>
              <SpeakButton text={`${fill.article} ${fill.nounDe}`} label="Speak" />
              <SpeakButton text={fill.exampleDe} label="Hear example" />
            </section>
          )}
          <div className="row" style={{ marginTop: "0.75rem" }}>
            <button type="button" onClick={() => setIndex((value) => value + 1)}>
              Next
            </button>
          </div>
        </article>
      ) : null}

      {mode === "accusative-fill" && accusative ? (
        <article className="card drill-card">
          <p className="meta">
            Card {(index % accusatives.length) + 1} of {accusatives.length} · dictionary{" "}
            {accusative.dictionaryArticle} {accusative.nounDe}
          </p>
          <h2 className="drill-front">{accusative.frameDe}</h2>
          <p className="meta">{accusative.glossEn}</p>
          {!revealed ? (
            <div className="row">
              {ACCUSATIVE.map((form) => (
                <button key={form} type="button" className="secondary" onClick={() => gradeAccusative(form)}>
                  {form}
                </button>
              ))}
            </div>
          ) : (
            <section className="drill-back">
              <p>{articleOk ? "Matches the authored accusative form." : "Not the authored accusative form."}</p>
              <p>
                <strong>{accusative.expectedDe}</strong>
              </p>
              <p className="meta">{accusative.noteEn}</p>
              <SpeakButton text={accusative.expectedDe} label="Speak" />
            </section>
          )}
          <div className="row" style={{ marginTop: "0.75rem" }}>
            <button type="button" onClick={() => setIndex((value) => value + 1)}>
              Next
            </button>
          </div>
        </article>
      ) : null}

      {mode === "word-order" && order ? (
        <article className="card drill-card">
          <p className="meta">
            Card {(index % orders.length) + 1} of {orders.length} · tap tokens in order
          </p>
          <p>{order.expectedEn}</p>
          <div className="token-answer" aria-label="Your order">
            {picked.length === 0 ? <span className="meta">Build the German clause here.</span> : null}
            {picked.map((token, tokenIndex) => (
              <button
                key={`${token}-${tokenIndex}`}
                type="button"
                className="secondary"
                disabled={Boolean(orderCheck)}
                onClick={() => setPicked((current) => current.filter((_, itemIndex) => itemIndex !== tokenIndex))}
              >
                {token}
              </button>
            ))}
          </div>
          <div className="token-bank" aria-label="Remaining words">
            {unused.map((token, tokenIndex) => (
              <button
                key={`${token}-${tokenIndex}-bank`}
                type="button"
                className="secondary"
                disabled={Boolean(orderCheck)}
                onClick={() => setPicked((current) => [...current, token])}
              >
                {token}
              </button>
            ))}
          </div>
          {orderCheck ? (
            <section className="drill-back">
              <p>{orderCheck.ok ? "Matches the authored clause." : "Not the authored word order."}</p>
              <p>
                <strong>{order.expectedDe}</strong>
              </p>
              <p className="meta">{order.notes[1] ?? order.notes[0]}</p>
              <SpeakButton text={order.expectedDe} label="Speak" />
            </section>
          ) : (
            <div className="row">
              <button
                type="button"
                onClick={() => setOrderCheck(checkWordOrder(picked, order.expected))}
                disabled={picked.length === 0}
              >
                Check order
              </button>
              <button type="button" className="secondary" onClick={() => setPicked([])}>
                Clear
              </button>
            </div>
          )}
          <div className="row" style={{ marginTop: "0.75rem" }}>
            <button type="button" onClick={() => setIndex((value) => value + 1)}>
              Next
            </button>
          </div>
        </article>
      ) : null}

      {mode === "weil-clause" && weil ? (
        <article className="card drill-card">
          <p className="meta">
            Card {(index % weils.length) + 1} of {weils.length} · tap tokens in order
          </p>
          <p>{weil.expectedEn}</p>
          <div className="token-answer" aria-label="Your order">
            {picked.length === 0 ? <span className="meta">Build the German clause here.</span> : null}
            {picked.map((token, tokenIndex) => (
              <button
                key={`${token}-${tokenIndex}`}
                type="button"
                className="secondary"
                disabled={Boolean(orderCheck)}
                onClick={() => setPicked((current) => current.filter((_, itemIndex) => itemIndex !== tokenIndex))}
              >
                {token}
              </button>
            ))}
          </div>
          <div className="token-bank" aria-label="Remaining words">
            {unused.map((token, tokenIndex) => (
              <button
                key={`${token}-${tokenIndex}-bank`}
                type="button"
                className="secondary"
                disabled={Boolean(orderCheck)}
                onClick={() => setPicked((current) => [...current, token])}
              >
                {token}
              </button>
            ))}
          </div>
          {orderCheck ? (
            <section className="drill-back">
              <p>{orderCheck.ok ? "Matches the authored weil-clause." : "Not the authored word order."}</p>
              <p>
                <strong>{weil.expectedDe}</strong>
              </p>
              <p className="meta">{weil.noteEn}</p>
              <SpeakButton text={weil.expectedDe} label="Speak" />
            </section>
          ) : (
            <div className="row">
              <button
                type="button"
                onClick={() => setOrderCheck(checkWordOrder(picked, weil.expected))}
                disabled={picked.length === 0}
              >
                Check order
              </button>
              <button type="button" className="secondary" onClick={() => setPicked([])}>
                Clear
              </button>
            </div>
          )}
          <div className="row" style={{ marginTop: "0.75rem" }}>
            <button type="button" onClick={() => setIndex((value) => value + 1)}>
              Next
            </button>
          </div>
        </article>
      ) : null}
    </>
  );
}
