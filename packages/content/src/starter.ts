import {
  contentHash,
  SAMPLE_ROOM_ID,
  SCHEMA_VERSION,
  type MaterializedBoard,
  type VocabularyCard,
} from "@syncspace/contracts";

const NOW = "2026-09-20T12:00:00.000Z";

type NounSeed = {
  id: string;
  article: "der" | "die" | "das";
  headword: string;
  plural: string;
  glossEn: string;
  exampleDe: string;
  tags: string[];
  x: number;
  y: number;
};

type VerbSeed = {
  id: string;
  headword: string;
  glossEn: string;
  exampleDe: string;
  tags: string[];
  x: number;
  y: number;
};

const NOUNS: NounSeed[] = [
  { id: "voc_tisch", article: "der", headword: "Tisch", plural: "Tische", glossEn: "table", exampleDe: "Der Tisch steht in der Küche.", tags: ["housing"], x: 40, y: 40 },
  { id: "voc_sprache", article: "die", headword: "Sprache", plural: "Sprachen", glossEn: "language", exampleDe: "Deutsch ist eine schöne Sprache.", tags: ["intro"], x: 220, y: 40 },
  { id: "voc_buch", article: "das", headword: "Buch", plural: "Bücher", glossEn: "book", exampleDe: "Das Buch liegt auf dem Tisch.", tags: ["university"], x: 400, y: 40 },
  { id: "voc_name", article: "der", headword: "Name", plural: "Namen", glossEn: "name", exampleDe: "Mein Name ist Anna.", tags: ["intro"], x: 40, y: 140 },
  { id: "voc_universitaet", article: "die", headword: "Universität", plural: "Universitäten", glossEn: "university", exampleDe: "Ich studiere an der Universität.", tags: ["university"], x: 220, y: 140 },
  { id: "voc_termin", article: "der", headword: "Termin", plural: "Termine", glossEn: "appointment", exampleDe: "Ich habe morgen einen Termin.", tags: ["appointments"], x: 400, y: 140 },
  { id: "voc_wohnung", article: "die", headword: "Wohnung", plural: "Wohnungen", glossEn: "apartment", exampleDe: "Die Wohnung ist klein, aber hell.", tags: ["housing"], x: 40, y: 240 },
  { id: "voc_zimmer", article: "das", headword: "Zimmer", plural: "Zimmer", glossEn: "room", exampleDe: "Das Zimmer hat ein Fenster zur Straße.", tags: ["housing"], x: 220, y: 240 },
  { id: "voc_zug", article: "der", headword: "Zug", plural: "Züge", glossEn: "train", exampleDe: "Der Zug fährt um acht Uhr ab.", tags: ["travel"], x: 400, y: 240 },
  { id: "voc_fahrkarte", article: "die", headword: "Fahrkarte", plural: "Fahrkarten", glossEn: "ticket", exampleDe: "Wo kann ich eine Fahrkarte kaufen?", tags: ["travel"], x: 40, y: 340 },
  { id: "voc_koffer", article: "der", headword: "Koffer", plural: "Koffer", glossEn: "suitcase", exampleDe: "Der Koffer ist sehr schwer.", tags: ["travel"], x: 220, y: 340 },
  { id: "voc_strasse", article: "die", headword: "Straße", plural: "Straßen", glossEn: "street", exampleDe: "Die Straße ist ruhig.", tags: ["housing"], x: 400, y: 340 },
  { id: "voc_bahnhof", article: "der", headword: "Bahnhof", plural: "Bahnhöfe", glossEn: "station", exampleDe: "Wir treffen uns am Bahnhof.", tags: ["travel"], x: 40, y: 440 },
  { id: "voc_vorlesung", article: "die", headword: "Vorlesung", plural: "Vorlesungen", glossEn: "lecture", exampleDe: "Die Vorlesung beginnt um zehn.", tags: ["university"], x: 220, y: 440 },
  { id: "voc_semester", article: "das", headword: "Semester", plural: "Semester", glossEn: "semester", exampleDe: "Das Semester endet im Juli.", tags: ["university"], x: 400, y: 440 },
  { id: "voc_freundin", article: "die", headword: "Freundin", plural: "Freundinnen", glossEn: "friend (female)", exampleDe: "Meine Freundin wohnt in Köln.", tags: ["intro"], x: 40, y: 540 },
  { id: "voc_handy", article: "das", headword: "Handy", plural: "Handys", glossEn: "mobile phone", exampleDe: "Das Handy ist in der Tasche.", tags: ["intro"], x: 220, y: 540 },
  { id: "voc_schluessel", article: "der", headword: "Schlüssel", plural: "Schlüssel", glossEn: "key", exampleDe: "Der Schlüssel liegt neben der Tür.", tags: ["housing"], x: 400, y: 540 },
  { id: "voc_miete", article: "die", headword: "Miete", plural: "Mieten", glossEn: "rent", exampleDe: "Die Miete ist am Ersten fällig.", tags: ["housing"], x: 40, y: 640 },
  { id: "voc_pass", article: "der", headword: "Pass", plural: "Pässe", glossEn: "passport", exampleDe: "Der Pass liegt im Rucksack.", tags: ["travel"], x: 220, y: 640 },
];

const VERBS: VerbSeed[] = [
  { id: "voc_heissen", headword: "heißen", glossEn: "to be called", exampleDe: "Ich heiße Mira.", tags: ["intro"], x: 400, y: 640 },
  { id: "voc_studieren", headword: "studieren", glossEn: "to study (at university)", exampleDe: "Er studiert Informatik.", tags: ["university"], x: 40, y: 740 },
  { id: "voc_wohnen", headword: "wohnen", glossEn: "to live (somewhere)", exampleDe: "Wir wohnen in einer kleinen Wohnung.", tags: ["housing"], x: 220, y: 740 },
  { id: "voc_fahren", headword: "fahren", glossEn: "to go / travel (by vehicle)", exampleDe: "Ich fahre mit dem Zug nach Berlin.", tags: ["travel"], x: 400, y: 740 },
];

function nounCard(seed: NounSeed): VocabularyCard {
  return {
    id: seed.id,
    type: "vocabulary",
    levelTag: "A1",
    contentStatus: "draft",
    position: { x: seed.x, y: seed.y },
    lexical: {
      partOfSpeech: "noun",
      article: seed.article,
      headword: seed.headword,
      plural: seed.plural,
      glossEn: seed.glossEn,
      exampleDe: seed.exampleDe,
      tags: seed.tags,
    },
    createdAt: NOW,
  };
}

function verbCard(seed: VerbSeed): VocabularyCard {
  return {
    id: seed.id,
    type: "vocabulary",
    levelTag: "A1",
    contentStatus: "draft",
    position: { x: seed.x, y: seed.y },
    lexical: {
      partOfSpeech: "verb",
      article: null,
      headword: seed.headword,
      plural: null,
      glossEn: seed.glossEn,
      exampleDe: seed.exampleDe,
      tags: seed.tags,
    },
    createdAt: NOW,
  };
}

const NOTES: MaterializedBoard["cards"] = [
  {
    id: "note_intro",
    type: "note",
    title: "Vorstellen",
    levelTag: "A1",
    contentStatus: "draft",
    position: { x: 600, y: 40 },
    text: "Zum Vorstellen reicht oft: Ich heiße …, Ich komme aus …, Ich wohne in …\nDer Name ist ein Nomen: der Name / die Namen.\nDas ist Entwurfmaterial, keine Prüfungsaufgabe.",
    createdAt: NOW,
  },
  {
    id: "note_uni",
    type: "note",
    title: "Universität",
    levelTag: "A1",
    contentStatus: "draft",
    position: { x: 600, y: 220 },
    text: "An der Universität gibt es Vorlesungen, Seminare und die Bibliothek.\nIch studiere … beschreibt das Fach, nicht nur „lernen“.\nArtikel merken: die Universität, die Vorlesung, das Semester.",
    createdAt: NOW,
  },
  {
    id: "note_housing",
    type: "note",
    title: "Wohnung und Termin",
    levelTag: "A1",
    contentStatus: "draft",
    position: { x: 600, y: 400 },
    text: "Für eine Wohnungsbesichtigung braucht man oft einen Termin.\nNützliche Wörter: die Wohnung, das Zimmer, die Miete, der Schlüssel.\nDer grammatische Artikel ist nicht dasselbe wie ein Artikel in einem bestimmten Fall (dem / den).",
    createdAt: NOW,
  },
  {
    id: "note_travel",
    type: "note",
    title: "Reisen",
    levelTag: "A1",
    contentStatus: "draft",
    position: { x: 600, y: 580 },
    text: "Am Bahnhof kauft man eine Fahrkarte und sucht den Zug.\nUnregelmäßige Pluralformen merken: der Zug / die Züge, der Pass / die Pässe.\nUmlaut und ß sind bedeutungsunterscheidend — nicht entfernen.",
    createdAt: NOW,
  },
];

const ARTICLE_NOUNS = NOUNS.slice(0, 8);

function exerciseCard(noun: NounSeed, index: number): MaterializedBoard["cards"][number] {
  const exercise = {
    kind: "article-recall" as const,
    prompt: `Wie lautet der Wörterbuchartikel von „${noun.headword}“?`,
    noun: noun.headword,
    acceptedArticles: [noun.article] as ["der"] | ["die"] | ["das"],
    explanation: `Wörterbuchform: ${noun.article} ${noun.headword}, Plural ${noun.plural}. Das prüft das Genus, nicht einen Kasus.`,
    normalization: "nfc-trim-lower" as const,
  };
  return {
    id: `ex_article_${index + 1}`,
    type: "exercise",
    levelTag: "A1",
    contentStatus: "draft",
    position: { x: 40 + index * 20, y: 860 },
    exercise,
    contentHash: contentHash(exercise),
    createdAt: NOW,
  };
}

const RESOURCES: MaterializedBoard["cards"] = [
  {
    id: "res_goethe_practice",
    type: "resource",
    title: "Goethe-Institut: Übungsmaterial zu Prüfungen",
    url: "https://www.goethe.de/de/spr/prf/ueb.html",
    contentStatus: "draft",
    position: { x: 600, y: 760 },
    createdAt: NOW,
  },
];

export const STARTER_PACK_REVIEW =
  "All supplied records are original draft teaching material. No human German-language review has been recorded. Do not display a reviewed badge.";

export function createStarterBoard(boardId = SAMPLE_ROOM_ID): MaterializedBoard {
  const cards = [
    ...NOUNS.map(nounCard),
    ...VERBS.map(verbCard),
    ...NOTES,
    ...ARTICLE_NOUNS.map(exerciseCard),
    ...RESOURCES,
  ];
  return {
    schemaVersion: SCHEMA_VERSION,
    boardId,
    title: "Alltag und Studium (A1–B1 Entwurf)",
    levelTag: "A1–B1",
    mode: boardId === SAMPLE_ROOM_ID ? "shared" : "standalone",
    cards,
    connections: [
      { id: "con_intro_name", fromId: "note_intro", toId: "voc_name", kind: "example-of" },
      { id: "con_uni_vorlesung", fromId: "note_uni", toId: "voc_vorlesung", kind: "related-to" },
      { id: "con_housing_wohnung", fromId: "note_housing", toId: "voc_wohnung", kind: "example-of" },
      { id: "con_travel_zug", fromId: "note_travel", toId: "voc_zug", kind: "example-of" },
    ],
    tombstones: [],
  };
}

export const STARTER_BOARD = createStarterBoard();
