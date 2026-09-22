import { getDudenApiKey } from "@syncspace/personal-store";
import type { ProofreadReport } from "@syncspace/learning";
import { checkGermanWithDuden } from "./duden.js";
import { checkGermanWithLanguageTool } from "./languagetool.js";

export async function checkGerman(text: string): Promise<ProofreadReport> {
  const dudenKey = await getDudenApiKey();
  if (dudenKey) {
    return checkGermanWithDuden(text, dudenKey);
  }
  return checkGermanWithLanguageTool(text);
}
