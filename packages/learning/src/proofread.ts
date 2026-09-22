export const LANGUAGETOOL_HOME = "https://languagetool.org";
export const LANGUAGETOOL_CHECK_URL = "https://api.languagetool.org/v2/check";
export const LANGUAGETOOL_MAX_CHARS = 20_000;
export const LANGUAGETOOL_PRIVACY = "https://languagetool.org/legal/privacy";

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
    language: raw.language?.name ?? raw.language?.code ?? "de-DE",
    matches,
  };
}
