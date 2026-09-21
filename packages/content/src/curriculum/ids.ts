export function slugDe(value: string): string {
  return value
    .normalize("NFC")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function lexId(de: string, disambiguator?: string): string {
  const base = `lex_${slugDe(de)}${disambiguator ? `-${slugDe(disambiguator)}` : ""}`;
  if (base.length < 6) {
    return `${base}-word`;
  }
  return base.slice(0, 80);
}
