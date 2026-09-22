import {
  DUDEN_HOME,
  DUDEN_PRIVACY,
  LANGUAGETOOL_HOME,
  LANGUAGETOOL_PRIVACY,
  applyProofreadFix,
  type ProofreadReport,
} from "@syncspace/learning";
import { getLanguageToolConsent, hasDudenApiKey, setLanguageToolConsent } from "@syncspace/personal-store";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { checkGerman } from "../../lib/proofread.js";

export function ProofreadPanel({
  text,
  onApply,
}: {
  text: string;
  onApply: (next: string) => void;
}) {
  const [consent, setConsent] = useState(false);
  const [useDuden, setUseDuden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ProofreadReport | null>(null);

  useEffect(() => {
    void getLanguageToolConsent().then(setConsent);
    void hasDudenApiKey().then(setUseDuden);
  }, []);

  async function runCheck() {
    if (!consent) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setReport(await checkGerman(text));
    } catch (reason) {
      setReport(null);
      setError(reason instanceof Error ? reason.message : "The check did not finish.");
    } finally {
      setBusy(false);
    }
  }

  const checkerName = useDuden ? "Duden" : "LanguageTool";
  const checkerHome = useDuden ? DUDEN_HOME : LANGUAGETOOL_HOME;
  const privacyHref = useDuden ? DUDEN_PRIVACY : LANGUAGETOOL_PRIVACY;

  return (
    <section className="proofread">
      <p>
        Optional German spelling and grammar check.{" "}
        {useDuden ? (
          <>
            A Duden key is saved on this device, so we use{" "}
            <a href={DUDEN_HOME}>Duden</a> (spelling, grammar, punctuation).
          </>
        ) : (
          <>
            No Duden key in this profile, so we use the{" "}
            <a href={LANGUAGETOOL_HOME}>LanguageTool</a> public API. Paste a free Duden key in{" "}
            <Link to="/settings">Settings</Link> for the stronger German checker.
          </>
        )}{" "}
        The public LanguageTool API stays available without a key. Neither check is a human review.
        Suggestions can be wrong. Nothing is sent until you consent and click Check.
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
        Send this text to {checkerName}. It leaves this device. See their{" "}
        <a href={privacyHref}>privacy policy</a>.
      </label>
      <div className="row">
        <button type="button" disabled={!consent || busy || !text.trim()} onClick={() => void runCheck()}>
          {busy ? "Checking…" : "Check German"}
        </button>
        <a href={checkerHome}>{checkerName} site</a>
      </div>
      {error ? <p className="banner">{error}</p> : null}
      {report ? (
        <div>
          <p className="meta">
            {report.engine === "duden" ? "Checked with Duden. " : "Checked with LanguageTool. "}
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
