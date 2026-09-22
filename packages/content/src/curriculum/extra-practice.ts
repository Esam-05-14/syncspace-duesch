import type { CoreLexeme } from "@syncspace/contracts";
import { lexId } from "./ids.js";
import { CORE_LEXICON } from "./lexicon.js";

const draft = "draft" as const;

function noun(
  article: "der" | "die" | "das",
  de: string,
  plural: string | null,
  en: string,
  ipa: string,
  topic: string,
  exampleDe: string,
  exampleEn: string,
  hookEn: string,
  aliases: string[] = [],
): CoreLexeme {
  return {
    id: lexId(de),
    pos: "noun",
    article,
    de,
    plural,
    en,
    aliases,
    ipa,
    topic,
    exampleDe,
    exampleEn,
    hookEn,
    contentStatus: draft,
  };
}

/** Extra draft lemmas beyond the locked core-500. Original teaching material, not a Goethe list. */
export const EXTRA_LEXICON: CoreLexeme[] = [
  noun("die", "Seife", "Seifen", "soap", "ˈzaɪfə", "home", "Die Seife liegt neben dem Waschbecken.", "The soap is next to the sink.", "Mnemonic: Seife is soap; ei is the sound in mine."),
  noun("das", "Handtuch", "Handtücher", "towel", "ˈhanttuːx", "home", "Das Handtuch hängt an der Tür.", "The towel hangs on the door.", "Mnemonic: Hand plus Tuch: a cloth for the hands."),
  noun("der", "Kamm", "Kämme", "comb", "kam", "home", "Der Kamm liegt auf dem Regal.", "The comb is on the shelf.", "Mnemonic: Kamm is comb; short a, doubled m."),
  noun("die", "Pfanne", "Pfannen", "pan", "ˈpfanə", "home", "Die Pfanne steht auf dem Herd.", "The pan is on the stove.", "Mnemonic: Pfanne starts with pf, one affricate."),
  noun("die", "Flasche", "Flaschen", "bottle", "ˈflaʃə", "home", "Die Flasche ist leer.", "The bottle is empty.", "Mnemonic: Flasche is flask’s cousin, a bottle."),
  noun("die", "Kerze", "Kerzen", "candle", "ˈkɛʁtsə", "home", "Die Kerze brennt auf dem Tisch.", "The candle is burning on the table.", "Mnemonic: Kerze is candle; z is /ts/."),
  noun("die", "Ecke", "Ecken", "corner", "ˈɛkə", "home", "Der Stuhl steht in der Ecke.", "The chair is in the corner.", "Mnemonic: ck after a short vowel; Ecke is the corner."),
  noun("der", "Hahn", "Hähne", "tap", "haːn", "home", "Der Hahn tropft.", "The tap is dripping.", "Mnemonic: Hahn is the water tap; also a rooster.", ["rooster", "cock"]),
  noun("der", "Mond", "Monde", "moon", "moːnt", "nature", "Der Mond ist hell.", "The moon is bright.", "Mnemonic: Mond is moon; final d sounds like t."),
  noun("der", "Stern", "Sterne", "star", "ʃtɛʁn", "nature", "Der Stern steht am Himmel.", "The star is in the sky.", "Mnemonic: Stern is star; st- is /ʃt/."),
  noun("die", "Insel", "Inseln", "island", "ˈɪnzl̩", "nature", "Die Insel ist klein.", "The island is small.", "Mnemonic: Insel is island without the d."),
  noun("das", "Feuer", "Feuer", "fire", "ˈfɔʏɐ", "nature", "Das Feuer ist warm.", "The fire is warm.", "Mnemonic: Feuer is fire; eu is the sound in boy."),
  noun("der", "Rauch", "Rauche", "smoke", "ʁaʊx", "nature", "Der Rauch steigt nach oben.", "The smoke rises.", "Mnemonic: Rauch has the ach-Laut; think a rough cloud."),
  noun("die", "Wiese", "Wiesen", "meadow", "ˈviːzə", "nature", "Die Wiese ist grün.", "The meadow is green.", "Mnemonic: Wiese is a grassy meadow, not a wise person."),
  noun("der", "Bach", "Bäche", "brook", "bax", "nature", "Der Bach ist kalt.", "The brook is cold.", "Mnemonic: Bach is a small stream; ach-Laut.", ["stream"]),
  noun("das", "Ufer", "Ufer", "shore", "ˈuːfɐ", "nature", "Wir sitzen am Ufer.", "We are sitting on the shore.", "Mnemonic: Ufer is the bank or shore of water.", ["bank"]),
  noun("die", "Asche", "Aschen", "ash", "ˈaʃə", "nature", "Die Asche ist kalt.", "The ash is cold.", "Mnemonic: Asche is ash; sch is /ʃ/."),
  noun("die", "Quelle", "Quellen", "spring", "ˈkvɛlə", "nature", "Die Quelle ist im Wald.", "The spring is in the forest.", "Mnemonic: qu is /kv/; Quelle is a water source.", ["source"]),
  noun("die", "Bucht", "Buchten", "bay", "bʊxt", "nature", "Die Bucht ist ruhig.", "The bay is quiet.", "Mnemonic: Bucht is a bay, not an English book."),
  noun("der", "Kreis", "Kreise", "circle", "kʁaɪs", "class", "Der Kreis ist rund.", "The circle is round.", "Mnemonic: Kreis is a circle; ei as in mine."),
];

export const PRACTICE_LEXICON: CoreLexeme[] = [...CORE_LEXICON, ...EXTRA_LEXICON];

export type WeilClause = {
  id: string;
  expectedDe: string;
  expectedEn: string;
  noteEn: string;
};

/** Authored weil frames. The finite verb of the reason clause stays last. */
export const WEIL_CLAUSES: WeilClause[] = [
  {
    id: "weil-lerne-wohne",
    expectedDe: "Ich lerne Deutsch, weil ich in Berlin wohne.",
    expectedEn: "I am learning German because I live in Berlin.",
    noteEn: "weil opens the reason. The finite verb wohne moves to the end of that clause.",
  },
  {
    id: "weil-bleibe-regnet",
    expectedDe: "Ich bleibe zu Hause, weil es regnet.",
    expectedEn: "I am staying at home because it is raining.",
    noteEn: "Impersonal es stays; only the verb regnet is last.",
  },
  {
    id: "weil-nehmen-voll",
    expectedDe: "Wir nehmen den Bus, weil der Zug voll ist.",
    expectedEn: "We are taking the bus because the train is full.",
    noteEn: "ist is the finite verb of the weil-clause, so it is last.",
  },
  {
    id: "weil-kauft-hunger",
    expectedDe: "Sie kauft Brot, weil sie Hunger hat.",
    expectedEn: "She is buying bread because she is hungry.",
    noteEn: "Hunger hat, not hat Hunger: hat is last after weil.",
  },
  {
    id: "weil-ruft-hilfe",
    expectedDe: "Er ruft an, weil er Hilfe braucht.",
    expectedEn: "He is calling because he needs help.",
    noteEn: "Main clause keeps separable an after the object-less verb. braucht is last after weil.",
  },
  {
    id: "weil-oeffne-warm",
    expectedDe: "Ich öffne das Fenster, weil es warm ist.",
    expectedEn: "I am opening the window because it is warm.",
    noteEn: "ist last. The comma marks the clause boundary.",
  },
  {
    id: "weil-gehen-kurs",
    expectedDe: "Wir gehen früh, weil der Kurs um acht beginnt.",
    expectedEn: "We are leaving early because the course starts at eight.",
    noteEn: "beginnt is last. Time phrase um acht stays in the middle.",
  },
  {
    id: "weil-trinke-durst",
    expectedDe: "Ich trinke Wasser, weil ich Durst habe.",
    expectedEn: "I am drinking water because I am thirsty.",
    noteEn: "habe last. Durst haben is the set phrase for thirst.",
  },
];
