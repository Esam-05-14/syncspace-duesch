import { LANGUAGETOOL_HOME, LANGUAGETOOL_PRIVACY, applyProofreadFix, type ProofreadReport } from "@syncspace/learning";
import { getLanguageToolConsent, setLanguageToolConsent } from "@syncspace/personal-store";
import { useEffect, useState } from "react";
import { checkGermanWithLanguageTool } from "../../lib/languagetool.js";

export function ProofreadPanel({
  text,
  onApply,
}: {
  text: string;
  onApply: (next: string) => void;
}) {
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ProofreadReport | null>(null);

  useEffect(() => {
    void getLanguageToolConsent().then(setConsent);
  }, []);

  async function runCheck() {
    if (!consent) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setReport(await checkGermanWithLanguageTool(text));
    } catch (reason) {
      setReport(null);
      setError(reason instanceof Error ? reason.message : "The check did not finish.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="proofread">
      <p>
        Optional spelling and grammar check for German, via{" "}
        <a href={LANGUAGETOOL_HOME}>LanguageTool</a>. The public API is free, needs no key, and is
        not a human review. Suggestions can be wrong. Nothing is sent until you consent and click
        Check.
      </p>
      <label className="row">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => {
            const next = event.target.checked;
            setConsent(next);
            void setLanguageToolConsent(next);
          }}
        />
        Send this text to LanguageTool. It leaves this device. See their{" "}
        <a href={LANGUAGETOOL_PRIVACY}>privacy policy</a>.
      </label>
      <div className="row">
        <button type="button" disabled={!consent || busy || !text.trim()} onClick={() => void runCheck()}>
          {busy ? "Checking…" : "Check German"}
        </button>
      </div>
      {error ? <p className="banner">{error}</p> : null}
      {report ? (
        <div>
          <p className="meta">
            {report.matches.length === 0
              ? `No issues reported for ${report.language}. That is not a guarantee.`
              : `${report.matches.length} issue${report.matches.length === 1 ? "" : "s"} reported for ${report.language}.`}
          </p>
          {report.matches.map((match, index) => (
            <article className="card" key={`${match.ruleId}-${match.offset}-${index}`}>
              <p className="meta">
                {match.kind}
                {match.shortMessage ? ` · ${match.shortMessage}` : ""}
              </p>
              <p>{match.message}</p>
              {match.snippet ? <p className="meta">{match.snippet}</p> : null}
              <div className="row">
                {match.replacements.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="secondary"
                    onClick={() => {
                      try {
                        onApply(applyProofreadFix(text, match.offset, match.length, value));
                        setReport(null);
                      } catch (reason) {
                        setError(reason instanceof Error ? reason.message : "Could not apply that suggestion.");
                      }
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
