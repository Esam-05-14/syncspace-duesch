import type { SourceCitation } from "@syncspace/contracts";

export const CURRICULUM_SOURCES: SourceCitation[] = [
  {
    id: "src-goethe-practice",
    title: "Goethe-Institut: Übungsmaterial zu Prüfungen",
    url: "https://www.goethe.de/de/spr/prf/ueb.html",
    useEn: "Official practice tasks. Use them on the Goethe site. We do not copy exam items.",
  },
  {
    id: "src-goethe-a1-list",
    title: "Goethe-Zertifikat A1: Start Deutsch 1 — Wortliste (PDF)",
    url: "https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf",
    useEn: "Copyrighted reference for exam topics. Linked for orientation. Our core-500 is original draft teaching material, not this list.",
  },
  {
    id: "src-dw-nicos",
    title: "Deutsche Welle: Nicos Weg (A1–B1)",
    url: "https://learngerman.dw.com/en/nicos-weg/c-36519789",
    useEn: "Free video course with grammar and vocabulary pages. Study it on DW. We do not host the videos.",
  },
  {
    id: "src-wiki-phonology",
    title: "Wikipedia: Standard German phonology",
    url: "https://en.wikipedia.org/wiki/Standard_German_phonology",
    useEn: "CC BY-SA overview of vowels and consonants, citing Duden and pronunciation dictionaries. Our sound notes paraphrase this inventory in English.",
  },
  {
    id: "src-wiki-ipa",
    title: "Wikipedia: Help:IPA/Standard German",
    url: "https://en.wikipedia.org/wiki/Help:IPA/Standard_German",
    useEn: "Public IPA key with English approximations. Draft transcriptions on our cards follow this key.",
  },
  {
    id: "src-cefr",
    title: "Council of Europe: Common European Framework of Reference",
    url: "https://www.coe.int/en/web/common-european-framework-reference-languages",
    useEn: "Public labels A1–B1 for the roadmap. Completing a station is not a CEFR certificate.",
  },
  {
    id: "src-rechtschreibung",
    title: "Rat für deutsche Rechtschreibung",
    url: "https://www.rechtschreibrat.com/",
    useEn: "Official German spelling, including ä ö ü and ß / ss.",
  },
];
