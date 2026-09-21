import { useState } from "react";

export function speakGerman(text: string): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function SpeakButton({ text, label = "Hear device voice" }: { text: string; label?: string }) {
  const [note, setNote] = useState<string | null>(null);

  return (
    <span className="row" style={{ display: "inline-flex" }}>
      <button
        type="button"
        className="secondary"
        onClick={() => {
          const ok = speakGerman(text);
          setNote(ok ? "Browser voice, not a pronunciation teacher." : "This browser has no speech synthesis.");
        }}
      >
        {label}
      </button>
      {note ? <span className="meta">{note}</span> : null}
    </span>
  );
}
