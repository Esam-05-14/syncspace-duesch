export function ArticleMix({ mix }: { mix: { der: number; die: number; das: number } }) {
  const total = mix.der + mix.die + mix.das || 1;
  const rows = [
    { key: "der", count: mix.der, color: "var(--forest)" },
    { key: "die", count: mix.die, color: "var(--accent)" },
    { key: "das", count: mix.das, color: "var(--moss)" },
  ] as const;

  return (
    <div className="article-mix" aria-label="Dictionary article mix in the core list">
      {rows.map((row) => (
        <div key={row.key} className="article-mix-row">
          <span className="badge article">{row.key}</span>
          <div className="article-mix-track">
            <div
              className="article-mix-fill"
              style={{ width: `${(row.count / total) * 100}%`, background: row.color }}
            />
          </div>
          <span className="meta">{row.count}</span>
        </div>
      ))}
    </div>
  );
}
