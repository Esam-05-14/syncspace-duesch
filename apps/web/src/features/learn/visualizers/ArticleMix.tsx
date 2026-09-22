export function ArticleMix({ mix }: { mix: { der: number; die: number; das: number } }) {
  const total = mix.der + mix.die + mix.das || 1;
  const rows = [
    { key: "der" as const, count: mix.der, color: "var(--der)" },
    { key: "die" as const, count: mix.die, color: "var(--die)" },
    { key: "das" as const, count: mix.das, color: "var(--das)" },
  ];

  return (
    <div className="article-mix" aria-label="Dictionary article mix in the core list">
      {rows.map((row) => (
        <div key={row.key} className="article-mix-row">
          <span className="badge article" data-article={row.key}>
            {row.key}
          </span>
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
