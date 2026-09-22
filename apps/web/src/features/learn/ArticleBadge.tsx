export function ArticleBadge({ article }: { article?: "der" | "die" | "das" | null }) {
  if (!article) {
    return null;
  }
  return (
    <span className="badge article" data-article={article}>
      {article}
    </span>
  );
}
