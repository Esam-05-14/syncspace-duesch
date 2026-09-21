const PATTERNS = [
  { title: "Statement", slots: ["Ich", "wohne", "in Berlin"] },
  { title: "Yes / no", slots: ["Wohnst", "du", "in Berlin?"] },
  { title: "W-question", slots: ["Wo", "wohnst", "du?"] },
] as const;

export function WordOrderViz() {
  return (
    <div className="order-viz" aria-label="Three German word-order patterns">
      {PATTERNS.map((pattern) => (
        <div key={pattern.title} className="order-viz-row">
          <p className="meta">{pattern.title}</p>
          <div className="row">
            {pattern.slots.map((slot, index) => (
              <span key={slot} className="slot-chip">
                <small>{index === 0 ? "1" : index === 1 ? "verb" : "rest"}</small>
                {slot}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
