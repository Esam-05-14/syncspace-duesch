import {
  LANGUAGETOOL_CHECK_URL,
  LANGUAGETOOL_MAX_CHARS,
  parseLanguageToolResponse,
  type ProofreadReport,
} from "@syncspace/learning";

export async function checkGermanWithLanguageTool(text: string): Promise<ProofreadReport> {
  const payload = text.normalize("NFC");
  if (!payload.trim()) {
    throw new Error("Type some German first.");
  }
  if (payload.length > LANGUAGETOOL_MAX_CHARS) {
    throw new Error(`LanguageTool accepts at most ${LANGUAGETOOL_MAX_CHARS} characters per check.`);
  }
  const body = new URLSearchParams();
  body.set("language", "de-DE");
  body.set("text", payload);
  const response = await fetch(LANGUAGETOOL_CHECK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (response.status === 429) {
    throw new Error("LanguageTool asked us to wait. Try again in a minute. This is a public free limit, not our queue.");
  }
  if (!response.ok) {
    throw new Error(`LanguageTool is unavailable (${response.status}). The note is still saved on this device.`);
  }
  return parseLanguageToolResponse(await response.json());
}
