import { PHONEMES } from "@syncspace/content";
import { useState } from "react";
import { SpeakButton } from "../SpeakButton.js";
import { StationComplete } from "../StationComplete.js";
import { VowelChart } from "../visualizers/VowelChart.js";

export function SoundsPage() {
  const [kind, setKind] = useState<"all" | "vowel" | "diphthong" | "consonant">("all");
  const visible = PHONEMES.filter((row) => kind === "all" || row.kind === kind);

  return (
    <>
      <p>
        Pronunciation here follows the public Standard German IPA key (Wikipedia, CC BY-SA),
        paraphrased in English. There is no single legal standard for spoken German; Duden and
        broadcast dictionaries describe a de-facto standard. Our IPA lines stay draft.
      </p>
      <VowelChart vowels={PHONEMES} />
      <div className="row" style={{ margin: "0.75rem 0" }}>
        {(["all", "vowel", "diphthong", "consonant"] as const).map((value) => (
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
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>IPA</th>
              <th>Spelling</th>
              <th>Example</th>
              <th>English note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id}>
                <td className="ipa">/{row.ipa}/</td>
                <td>{row.spelling}</td>
                <td>
                  <strong>{row.exampleDe}</strong>
                  <div className="meta">{row.exampleEn}</div>
                </td>
                <td>
                  {row.approxEn}. {row.noteEn}
                </td>
                <td>
                  <SpeakButton text={row.exampleDe} label="Speak" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <StationComplete lessonId="lesson-sounds" />
    </>
  );
}
