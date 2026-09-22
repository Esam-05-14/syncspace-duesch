import { PRACTICE_LEXICON, SENTENCE_TEMPLATES } from "@syncspace/content";
import { buildSentence } from "@syncspace/learning";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SpeakButton } from "../SpeakButton.js";
import { StationComplete } from "../StationComplete.js";

export function BuilderPage() {
  const nouns = useMemo(() => PRACTICE_LEXICON.filter((row) => row.pos === "noun" && row.article), []);
  const adjectives = useMemo(() => PRACTICE_LEXICON.filter((row) => row.pos === "adj"), []);
  const verbs = useMemo(
    () => PRACTICE_LEXICON.filter((row) => row.pos === "verb" && row.forms && row.transitive),
    [],
  );
  const [params] = useSearchParams();
  const [templateId, setTemplateId] = useState(SENTENCE_TEMPLATES[0]?.id ?? "");
  const [nounId, setNounId] = useState(nouns.find((row) => row.de === "Tisch")?.id ?? nouns[0]?.id ?? "");
  const [adjId, setAdjId] = useState(adjectives.find((row) => row.de === "klein")?.id ?? adjectives[0]?.id ?? "");
  const [verbId, setVerbId] = useState(verbs.find((row) => row.de === "haben")?.id ?? verbs[0]?.id ?? "");
  const [definite, setDefinite] = useState(true);

  useEffect(() => {
    const requested = params.get("noun");
    if (!requested) {
      return;
    }
    const found = nouns.find((row) => row.de === requested || row.id === requested);
    if (found) {
      setNounId(found.id);
    }
  }, [params, nouns]);

  const template = SENTENCE_TEMPLATES.find((row) => row.id === templateId) ?? SENTENCE_TEMPLATES[0];
  const noun = nouns.find((row) => row.id === nounId);
  const adjective = adjectives.find((row) => row.id === adjId);
  const verb = verbs.find((row) => row.id === verbId);

  const result = useMemo(() => {
    if (!template) {
      return { built: null, error: null as string | null };
    }
    try {
      return { built: buildSentence({ template, noun, adjective, verb, definite }), error: null };
    } catch (reason) {
      return {
        built: null,
        error: reason instanceof Error ? reason.message : "Could not build that pattern.",
      };
    }
  }, [template, noun, adjective, verb, definite]);
  const { built, error } = result;

  return (
    <>
      <p>
        Pick an A1 pattern and fill it from the core list. The German string is assembled by a
        function, not a model. Accusative is only applied where the pattern says so.
      </p>
      <div className="grid builder-grid">
        <label>
          Pattern
          <select value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
            {SENTENCE_TEMPLATES.map((row) => (
              <option key={row.id} value={row.id}>
                {row.titleEn}
              </option>
            ))}
          </select>
        </label>
        <label>
          Noun
          <select value={nounId} onChange={(event) => setNounId(event.target.value)}>
            {nouns.map((row) => (
              <option key={row.id} value={row.id}>
                {row.article} {row.de} — {row.en}
              </option>
            ))}
          </select>
        </label>
        {template?.kind === "adj" ? (
          <label>
            Adjective
            <select value={adjId} onChange={(event) => setAdjId(event.target.value)}>
              {adjectives.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.de} — {row.en}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {template?.kind === "action" ? (
          <label>
            Verb
            <select value={verbId} onChange={(event) => setVerbId(event.target.value)}>
              {verbs.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.de} — {row.en}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {template?.kind === "have" || template?.kind === "action" ? (
          <label>
            Article
            <select value={definite ? "def" : "indef"} onChange={(event) => setDefinite(event.target.value === "def")}>
              <option value="def">definite (der/die/das → accusative if needed)</option>
              <option value="indef">indefinite (ein/eine/einen)</option>
            </select>
          </label>
        ) : null}
      </div>
      {template ? <p className="meta">{template.explanationEn}</p> : null}
      {error ? <p className="banner">{error}</p> : null}
      {built ? (
        <article className="card" style={{ marginTop: "1rem" }}>
          <p className="badge draft">draft pattern</p>
          <h2>{built.de}</h2>
          <p>{built.en}</p>
          {built.notes.map((note) => (
            <p className="meta" key={note}>
              {note}
            </p>
          ))}
          <SpeakButton text={built.de} />
        </article>
      ) : null}
      <StationComplete lessonId="lesson-builder" />
    </>
  );
}
