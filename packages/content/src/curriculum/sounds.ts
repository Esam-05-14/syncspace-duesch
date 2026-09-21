import type { Phoneme } from "@syncspace/contracts";

/**
 * Classroom inventory paraphrased from the public Standard German IPA key.
 * Coordinates (frontness, height) are for the vowel chart only: 0 = back/open, 1 = front/close.
 */
export const PHONEMES: Phoneme[] = [
  { id: "v-i", ipa: "iː", spelling: "ie, ih, i", kind: "vowel", exampleDe: "Liebe", exampleEn: "love", approxEn: "seed, held long", noteEn: "Close front unrounded. Contrast with short /ɪ/ in sitzen.", frontness: 1, height: 1 },
  { id: "v-ɪ", ipa: "ɪ", spelling: "i", kind: "vowel", exampleDe: "sitzen", exampleEn: "to sit", approxEn: "sit", noteEn: "Short and slightly more open than /iː/.", frontness: 0.9, height: 0.82 },
  { id: "v-y", ipa: "yː", spelling: "ü, üh, y", kind: "vowel", exampleDe: "über", exampleEn: "over", approxEn: "few, with rounded lips", noteEn: "The ü sound English does not keep as a single phoneme.", frontness: 0.92, height: 0.98 },
  { id: "v-ʏ", ipa: "ʏ", spelling: "ü, y", kind: "vowel", exampleDe: "fünf", exampleEn: "five", approxEn: "cute, short", noteEn: "Short rounded partner of /yː/.", frontness: 0.84, height: 0.8 },
  { id: "v-u", ipa: "uː", spelling: "u, uh", kind: "vowel", exampleDe: "Hut", exampleEn: "hat", approxEn: "food", noteEn: "Close back rounded. Contrast /ʊ/ in und.", frontness: 0.08, height: 0.98 },
  { id: "v-ʊ", ipa: "ʊ", spelling: "u", kind: "vowel", exampleDe: "und", exampleEn: "and", approxEn: "pull", noteEn: "Short back vowel.", frontness: 0.16, height: 0.8 },
  { id: "v-e", ipa: "eː", spelling: "e, eh, ee", kind: "vowel", exampleDe: "See", exampleEn: "lake", approxEn: "Scottish mate", noteEn: "A pure long e, not the English diphthong in day.", frontness: 0.95, height: 0.72 },
  { id: "v-ɛ", ipa: "ɛ", spelling: "e, ä", kind: "vowel", exampleDe: "Bett", exampleEn: "bed", approxEn: "bet", noteEn: "Short open e. ä often writes this sound.", frontness: 0.88, height: 0.48 },
  { id: "v-ø", ipa: "øː", spelling: "ö, öh", kind: "vowel", exampleDe: "schön", exampleEn: "beautiful", approxEn: "heard, with rounded lips", noteEn: "Rounded long e. Shape /eː/ and round the lips.", frontness: 0.86, height: 0.7 },
  { id: "v-œ", ipa: "œ", spelling: "ö", kind: "vowel", exampleDe: "Köln", exampleEn: "Cologne", approxEn: "hurt, short and rounded", noteEn: "Short partner of /øː/.", frontness: 0.78, height: 0.46 },
  { id: "v-o", ipa: "oː", spelling: "o, oh, oo", kind: "vowel", exampleDe: "Boot", exampleEn: "boat", approxEn: "story", noteEn: "Pure long o, not English go.", frontness: 0.12, height: 0.7 },
  { id: "v-ɔ", ipa: "ɔ", spelling: "o", kind: "vowel", exampleDe: "kommen", exampleEn: "to come", approxEn: "off", noteEn: "Short open o.", frontness: 0.2, height: 0.46 },
  { id: "v-a", ipa: "a", spelling: "a", kind: "vowel", exampleDe: "kalt", exampleEn: "cold", approxEn: "pasta", noteEn: "Short open a. Length is contrastive with /aː/.", frontness: 0.5, height: 0.12 },
  { id: "v-aː", ipa: "aː", spelling: "a, ah, aa", kind: "vowel", exampleDe: "Abend", exampleEn: "evening", approxEn: "father", noteEn: "Long open a.", frontness: 0.48, height: 0.1 },
  { id: "v-ə", ipa: "ə", spelling: "e (unstressed)", kind: "vowel", exampleDe: "bitte", exampleEn: "please", approxEn: "sofa, last vowel", noteEn: "Schwa in many unstressed endings. Not a stressed vowel.", frontness: 0.5, height: 0.55 },
  { id: "v-ɐ", ipa: "ɐ", spelling: "-er", kind: "vowel", exampleDe: "Mutter", exampleEn: "mother", approxEn: "the a in sofa", noteEn: "Common realization of -er in Standard German of Germany.", frontness: 0.45, height: 0.28 },
  { id: "d-aɪ", ipa: "aɪ", spelling: "ei, ai", kind: "diphthong", exampleDe: "nein", exampleEn: "no", approxEn: "high", noteEn: "One of three native diphthongs.", frontness: 0.7, height: 0.35 },
  { id: "d-aʊ", ipa: "aʊ", spelling: "au", kind: "diphthong", exampleDe: "Haus", exampleEn: "house", approxEn: "house", noteEn: "Spelled au, not ow.", frontness: 0.35, height: 0.32 },
  { id: "d-ɔʏ", ipa: "ɔʏ", spelling: "eu, äu", kind: "diphthong", exampleDe: "Deutsch", exampleEn: "German", approxEn: "choice", noteEn: "eu and äu write the same sound (Häuser, Deutsch).", frontness: 0.4, height: 0.42 },
  { id: "c-ç", ipa: "ç", spelling: "ch (after front vowels), -ig", kind: "consonant", exampleDe: "ich", exampleEn: "I", approxEn: "hue, but with the tongue further forward", noteEn: "The ich-Laut. After i, e, ä, ö, ü, ei, eu, and in -ig." },
  { id: "c-x", ipa: "x", spelling: "ch (after back vowels)", kind: "consonant", exampleDe: "Bach", exampleEn: "brook", approxEn: "Scottish loch", noteEn: "The ach-Laut. After a, o, u, au." },
  { id: "c-ʃ", ipa: "ʃ", spelling: "sch, st-, sp-", kind: "consonant", exampleDe: "schon", exampleEn: "already", approxEn: "ship", noteEn: "Also the start of Stadt and spielen." },
  { id: "c-ts", ipa: "ts", spelling: "z, tz, ts", kind: "consonant", exampleDe: "Zeit", exampleEn: "time", approxEn: "cats", noteEn: "z is never the English zoo sound." },
  { id: "c-pf", ipa: "pf", spelling: "pf", kind: "consonant", exampleDe: "Apfel", exampleEn: "apple", approxEn: "cupful, said as one unit", noteEn: "A German affricate English treats as two sounds." },
  { id: "c-ŋ", ipa: "ŋ", spelling: "ng", kind: "consonant", exampleDe: "lang", exampleEn: "long", approxEn: "sing", noteEn: "No hard g after ng in Standard German." },
  { id: "c-v", ipa: "v", spelling: "w, sometimes v", kind: "consonant", exampleDe: "Wasser", exampleEn: "water", approxEn: "van", noteEn: "w is /v/. English w as in we does not occur." },
  { id: "c-z", ipa: "z", spelling: "s before a vowel", kind: "consonant", exampleDe: "Sonne", exampleEn: "sun", approxEn: "zebra", noteEn: "Initial s before a vowel is voiced in Germany." },
  { id: "c-h", ipa: "h", spelling: "h", kind: "consonant", exampleDe: "haben", exampleEn: "to have", approxEn: "hat", noteEn: "Only at the beginning of a stem. In gehen the h marks vowel length." },
];
