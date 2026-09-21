import { ALPHABET } from "@syncspace/content";
import { useState } from "react";
import { SpeakButton } from "../SpeakButton.js";
import { StationComplete } from "../StationComplete.js";

export function AlphabetPage() {
  const [selected, setSelected] = useState(ALPHABET[0]);
  if (!selected) {
    return <p>Alphabet records are missing.</p>;
  }

  return (
    <>
      <p>
        German writes 26 Latin letters plus the umlauts ä, ö, ü and the Eszett ß. Official spelling
        is set by the Council for German Orthography. Letter names below are classroom German, not
        a singing-alphabet recording.
      </p>
      <div className="letter-grid" role="list">
        {ALPHABET.map((letter) => (
          <button
            key={letter.letter}
            type="button"
            className={letter.letter === selected.letter ? "letter-cell active" : "letter-cell"}
            onClick={() => setSelected(letter)}
          >
            <strong>{letter.letter}</strong>
            <span>{letter.nameDe}</span>
          </button>
        ))}
      </div>
      <article className="card" style={{ marginTop: "1rem" }}>
        <p className="badge draft">draft</p>
        <h2>
          {selected.letter} · {selected.nameDe}{" "}
          <span className="ipa">/{selected.nameIpa}/</span>
        </h2>
        <p>
          Example: <strong>{selected.exampleDe}</strong> — {selected.exampleEn}
        </p>
        <p>{selected.noteEn}</p>
        <SpeakButton text={`${selected.letter}. ${selected.exampleDe}.`} />
      </article>
      <StationComplete lessonId="lesson-alphabet" />
    </>
  );
}
