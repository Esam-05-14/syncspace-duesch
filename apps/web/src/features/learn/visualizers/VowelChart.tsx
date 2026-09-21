import type { Phoneme } from "@syncspace/contracts";

export function VowelChart({ vowels }: { vowels: Phoneme[] }) {
  const points = vowels.filter(
    (row) => row.kind !== "consonant" && row.frontness != null && row.height != null,
  );

  return (
    <figure className="vowel-chart">
      <svg viewBox="0 0 320 220" role="img" aria-label="German vowel chart, front to back and close to open">
        <rect x="8" y="8" width="304" height="204" fill="none" stroke="currentColor" opacity="0.25" />
        <text x="16" y="22" fontSize="11" fill="currentColor">
          close
        </text>
        <text x="16" y="204" fontSize="11" fill="currentColor">
          open
        </text>
        <text x="24" y="214" fontSize="11" fill="currentColor" opacity="0">
          .
        </text>
        <text x="18" y="212" fontSize="11" fill="currentColor">
          front
        </text>
        <text x="268" y="212" fontSize="11" fill="currentColor">
          back
        </text>
        {points.map((row) => {
          const x = 36 + (1 - (row.frontness ?? 0.5)) * 250;
          const y = 28 + (1 - (row.height ?? 0.5)) * 160;
          return (
            <g key={row.id}>
              <circle cx={x} cy={y} r="11" fill="var(--card)" stroke="var(--forest)" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="var(--ink)">
                {row.ipa}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="meta">
        Draft classroom chart. Positions follow the public Standard German IPA inventory, not a
        studio recording.
      </figcaption>
    </figure>
  );
}
