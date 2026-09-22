export const LANGUAGETOOL_HOME = "https://languagetool.org";
export const LANGUAGETOOL_CHECK_URL = "https://api.languagetool.org/v2/check";
export const LANGUAGETOOL_MAX_CHARS = 20_000;
export const LANGUAGETOOL_PRIVACY = "https://languagetool.org/legal/privacy";

export const DUDEN_HOME = "https://www.duden.de/api";
export const DUDEN_CHECK_URL = "https://api.duden.de/v1/spellcheck";
export const DUDEN_PRIVACY = "https://www.duden.de/datenschutz";
export const DUDEN_MAX_CHARS = 20_000;

export type ProofreadEngine = "duden" | "languagetool";
export type ProofreadKind = "spelling" | "grammar" | "style" | "other";

export type ProofreadMatch = {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  snippet: string;
  replacements: string[];
  kind: ProofreadKind;
  ruleId: string;
};

export type ProofreadReport = {
  engine: ProofreadEngine;
  language: string;
  matches: ProofreadMatch[];
};

export function classifyProofreadIssue(issueType: string | undefined): ProofreadKind {
  if (issueType === "misspelling") {
    return "spelling";
  }
  if (issueType === "grammar") {
    return "grammar";
  }
  if (issueType === "style") {
    return "style";
  }
  return "other";
}

export function applyProofreadFix(text: string, offset: number, length: number, replacement: string): string {
  if (offset < 0 || length < 0 || offset + length > text.length) {
    throw new Error("That suggestion no longer matches this text. Check again.");
  }
  return `${text.slice(0, offset)}${replacement}${text.slice(offset + length)}`;
}

export function parseLanguageToolResponse(body: unknown): ProofreadReport {
  if (!body || typeof body !== "object") {
    throw new Error("LanguageTool returned an empty response.");
  }
  const raw = body as {
    language?: { name?: string; code?: string };
    matches?: Array<{
      message?: string;
      shortMessage?: string;
      offset?: number;
      length?: number;
      context?: { text?: string };
      replacements?: Array<{ value?: string }>;
      rule?: { id?: string; issueType?: string };
    }>;
  };
  const matches = (raw.matches ?? [])
    .filter((row) => typeof row.offset === "number" && typeof row.length === "number")
    .map((row) => ({
      message: row.message ?? "Possible issue.",
      shortMessage: row.shortMessage ?? "",
      offset: row.offset ?? 0,
      length: row.length ?? 0,
      snippet: row.context?.text ?? "",
      replacements: (row.replacements ?? [])
        .map((item) => item.value)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
        .slice(0, 8),
      kind: classifyProofreadIssue(row.rule?.issueType),
      ruleId: row.rule?.id ?? "unknown",
    }));
  return {
    engine: "languagetool",
    language: raw.language?.name ?? raw.language?.code ?? "de-DE",
    matches,
  };
}

export function classifyDudenAdvice(type: string | undefined): ProofreadKind {
  const normalized = (type ?? "").toLowerCase();
  if (normalized.includes("style") || normalized === "len") {
    return "style";
  }
  if (normalized.includes("orth")) {
    return "spelling";
  }
  if (normalized.includes("gram") || normalized.includes("comma")) {
    return "grammar";
  }
  return "other";
}

type DudenAdvice = {
  errorCode?: string;
  errorMessage?: string;
  shortMessage?: string;
  length?: number;
  offset?: number;
  originalError?: string;
  proposals?: unknown;
  type?: string;
};

function mapDudenAdvice(row: DudenAdvice): ProofreadMatch | null {
  if (typeof row.offset !== "number" || typeof row.length !== "number") {
    return null;
  }
  const replacements = Array.isArray(row.proposals)
    ? row.proposals.filter((value): value is string => typeof value === "string" && value.length > 0).slice(0, 8)
    : [];
  return {
    message: row.errorMessage ?? "Possible issue.",
    shortMessage: row.shortMessage ?? "",
    offset: row.offset,
    length: row.length,
    snippet: row.originalError ?? "",
    replacements,
    kind: classifyDudenAdvice(row.type),
    ruleId: row.errorCode ?? row.type ?? "duden",
  };
}

export function parseDudenResponse(body: unknown): ProofreadReport {
  if (!body || typeof body !== "object") {
    throw new Error("Duden returned an empty response.");
  }
  const raw = body as {
    data?: { spellAdvices?: DudenAdvice[]; styleAdvices?: DudenAdvice[] };
    message?: string;
  };
  const advices = [...(raw.data?.spellAdvices ?? []), ...(raw.data?.styleAdvices ?? [])];
  const matches = advices
    .map(mapDudenAdvice)
    .filter((row): row is ProofreadMatch => row !== null)
    .sort((left, right) => left.offset - right.offset);
  return {
    engine: "duden",
    language: "German (Duden)",
    matches,
  };
}
