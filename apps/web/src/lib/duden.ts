import {
  DUDEN_CHECK_URL,
  DUDEN_MAX_CHARS,
  parseDudenResponse,
  type ProofreadReport,
} from "@syncspace/learning";

export async function checkGermanWithDuden(text: string, apiKey: string): Promise<ProofreadReport> {
  const payload = text.normalize("NFC");
  if (!payload.trim()) {
    throw new Error("Type some German first.");
  }
  if (payload.length > DUDEN_MAX_CHARS) {
    throw new Error(`Duden accepts at most ${DUDEN_MAX_CHARS} characters per check.`);
  }
  const response = await fetch(DUDEN_CHECK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      text: payload,
      language: "de",
      maxProposals: 7,
      grantPermissions: ["access punctuation correction"],
    }),
  });
  if (response.status === 401 || response.status === 403) {
    throw new Error("Duden rejected that API key. The note is still saved on this device.");
  }
  if (response.status === 429) {
    throw new Error("Duden asked us to wait. The free plan is about 20 checks a day.");
  }
  if (!response.ok) {
    throw new Error(`Duden is unavailable (${response.status}). The note is still saved on this device.`);
  }
  return parseDudenResponse(await response.json());
}
