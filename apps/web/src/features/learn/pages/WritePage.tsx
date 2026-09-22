import { CORE_LEXICON, SENTENCE_TEMPLATES } from "@syncspace/content";
import { checkArticleRecall, checkWordOrder, pickArticleFill, pickWordOrder } from "@syncspace/learning";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleBadge } from "../ArticleBadge.js";
import { SpeakButton } from "../SpeakButton.js";

const ARTICLES = ["der", "die", "das"] as const;

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
  const [mode, setMode] = useState<"article-fill" | "word-order">("article-fill");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [articleOk, setArticleOk] = useState<boolean | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [orderCheck, setOrderCheck] = useState<ReturnType<typeof checkWordOrder> | null>(null);

  const fills = useMemo(() => pickArticleFill({ lexemes: CORE_LEXICON, day }), [day]);
  const orders = useMemo(
    () => pickWordOrder({ lexemes: CORE_LEXICON, templates: SENTENCE_TEMPLATES, day }),
    [day],
  );

  const fill = fills[index % Math.max(fills.length, 1)];
  const order = orders[index % Math.max(orders.length, 1)];
  const unused = order ? takeOnce(order.tokens, picked) : [];

  useEffect(() => {
    setRevealed(false);
    setArticleOk(null);
    setPicked([]);
    setOrderCheck(null);
  }, [mode, index]);

  function gradeArticle(article: (typeof ARTICLES)[number]) {
    if (!fill || revealed) {
      return;
    }
    setArticleOk(checkArticleRecall(article, fill.article).ok);
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
      if (mode !== "article-fill" || revealed) {
        return;
      }
      if (event.key === "1") {
        gradeArticle("der");
      } else if (event.key === "2") {
        gradeArticle("die");
      } else if (event.key === "3") {
        gradeArticle("das");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <>
      <p>
        Finite writing drills from the authored list. Article fill is dictionary gender, not case.
        Word order uses the same sentence patterns as the builder. This is not a teacher mark and
        not a Goethe writing paper.
      </p>
      <p className="meta">
        {day} · 1 der · 2 die · 3 das · <Link to="/learn/builder">Open the builder</Link>
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
          className={mode === "word-order" ? undefined : "secondary"}
          onClick={() => {
            setMode("word-order");
            setIndex(0);
          }}
        >
          Word order
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
    </>
  );
}
