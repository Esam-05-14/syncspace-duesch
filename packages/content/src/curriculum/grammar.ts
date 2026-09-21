import type { GrammarTopic } from "@syncspace/contracts";

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    id: "gram-gender",
    titleEn: "Every noun has a gender",
    summaryEn: "German nouns are masculine, feminine, or neuter. The dictionary form shows this with der, die, or das. Gender is a property of the noun, not of a real-world male or female in every case.",
    pointsEn: [
      "Learn the article with the noun: der Tisch, die Wohnung, das Buch.",
      "People often match social gender (der Vater, die Mutter) but objects do not (das Mädchen is neuter).",
      "This product only checks the dictionary article. dem and den are case forms, not extra genders.",
      "Plural nouns take die in the nominative (die Tische), whatever the singular article was.",
    ],
    table: {
      headers: ["Dictionary form", "Gender", "English"],
      rows: [
        ["der Tisch", "masculine", "the table"],
        ["die Wohnung", "feminine", "the apartment"],
        ["das Buch", "neuter", "the book"],
        ["die Tische", "plural", "the tables"],
      ],
    },
    exampleDe: "Der Tisch steht in der Küche.",
    exampleEn: "The table stands in the kitchen.",
  },
  {
    id: "gram-articles",
    titleEn: "der, die, das and ein",
    summaryEn: "The definite article points to a known thing. The indefinite article ein / eine / ein introduces a new one. kein is the negative twin of ein.",
    pointsEn: [
      "Masculine: der / ein / kein. Feminine: die / eine / keine. Neuter: das / ein / kein.",
      "ein has no extra -e on masculine and neuter in the nominative.",
      "Practice one question at a time: first the dictionary gender, later the case endings.",
    ],
    table: {
      headers: ["Form", "der-words", "die-words", "das-words"],
      rows: [
        ["the", "der", "die", "das"],
        ["a / an", "ein", "eine", "ein"],
        ["no / not a", "kein", "keine", "kein"],
      ],
    },
    exampleDe: "Ich habe eine Wohnung. Die Wohnung ist klein.",
    exampleEn: "I have an apartment. The apartment is small.",
  },
  {
    id: "gram-present",
    titleEn: "Present tense of regular verbs",
    summaryEn: "Most verbs take endings on a stem: ich -e, du -st, er/sie/es -t, wir -en, ihr -t, sie/Sie -en. The verb in a statement sits in second position.",
    pointsEn: [
      "wohnen: ich wohne, du wohnst, er wohnt, wir wohnen.",
      "sein and haben are irregular and must be memorized (bin/bist/ist, habe/hast/hat).",
      "A few stems change the vowel in du and er (fahre / fährst / fährt).",
    ],
    table: {
      headers: ["Person", "wohnen", "sein", "haben"],
      rows: [
        ["ich", "wohne", "bin", "habe"],
        ["du", "wohnst", "bist", "hast"],
        ["er / sie / es", "wohnt", "ist", "hat"],
        ["wir", "wohnen", "sind", "haben"],
        ["ihr", "wohnt", "seid", "habt"],
        ["sie / Sie", "wohnen", "sind", "haben"],
      ],
    },
    exampleDe: "Ich wohne in Berlin.",
    exampleEn: "I live in Berlin.",
  },
  {
    id: "gram-order",
    titleEn: "Word order: statement, yes/no, W-question",
    summaryEn: "German is verb-second in statements. Yes/no questions put the verb first. W-questions put the question word first, then the verb.",
    pointsEn: [
      "Statement: Ich komme aus Spanien. The finite verb is the second unit, not the second word if the first unit is a phrase.",
      "Yes/no: Kommst du aus Spanien?",
      "W-question: Wo wohnst du? Wann beginnt die Vorlesung?",
      "The sentence builder only uses these finite classroom patterns.",
    ],
    table: {
      headers: ["Kind", "Order", "Example"],
      rows: [
        ["Statement", "X + verb + …", "Heute lerne ich Deutsch."],
        ["Yes / no", "verb + subject + …", "Lernst du Deutsch?"],
        ["W-question", "W-word + verb + …", "Was lernst du?"],
      ],
    },
    exampleDe: "Wohnst du in Köln?",
    exampleEn: "Do you live in Cologne?",
  },
  {
    id: "gram-accusative",
    titleEn: "Accusative after haben and many verbs",
    summaryEn: "The direct object often takes the accusative. Only the masculine article changes in the singular: der → den, ein → einen.",
    pointsEn: [
      "Ich habe den Schlüssel. (der Schlüssel)",
      "Ich kaufe eine Fahrkarte. (die Fahrkarte — die stays die)",
      "Ich sehe das Haus. (das stays das)",
      "This is still not a full case course. We mark the change only where the pattern needs it.",
    ],
    table: {
      headers: ["Nominative", "Accusative", "English"],
      rows: [
        ["der Tisch", "den Tisch", "the table"],
        ["die Wohnung", "die Wohnung", "the apartment"],
        ["das Buch", "das Buch", "the book"],
        ["ein Mann", "einen Mann", "a man"],
      ],
    },
    exampleDe: "Ich habe den Schlüssel.",
    exampleEn: "I have the key.",
  },
  {
    id: "gram-possessive",
    titleEn: "mein, deine, unser",
    summaryEn: "Possessives agree with the noun they stand in front of, like ein. mein Vater, meine Mutter, mein Kind.",
    pointsEn: [
      "Match the possessed noun, not the owner: Sie hat einen Bruder → ihr Bruder.",
      "meine is used with feminine singular and with plurals: meine Eltern.",
      "Formal Sie takes Ihr with a capital I.",
    ],
    table: {
      headers: ["Owner", "masc. / neut.", "fem. / plural"],
      rows: [
        ["ich", "mein", "meine"],
        ["du", "dein", "deine"],
        ["er", "sein", "seine"],
        ["sie (she)", "ihr", "ihre"],
        ["wir", "unser", "unsere"],
      ],
    },
    exampleDe: "Das ist meine Freundin.",
    exampleEn: "That is my friend.",
  },
  {
    id: "gram-modals",
    titleEn: "können, müssen, wollen",
    summaryEn: "Modal verbs sit in second position. The main verb goes to the end in the infinitive: Ich kann Deutsch sprechen.",
    pointsEn: [
      "können — ability. müssen — necessity. wollen — wish. mögen / möchte — liking or a polite want.",
      "ich kann, du kannst, er kann (no -t on er for these three).",
      "Do not invent extra objects around a modal until the main verb is in place.",
    ],
    table: {
      headers: ["Person", "können", "müssen", "wollen"],
      rows: [
        ["ich", "kann", "muss", "will"],
        ["du", "kannst", "musst", "willst"],
        ["er / sie", "kann", "muss", "will"],
        ["wir", "können", "müssen", "wollen"],
      ],
    },
    exampleDe: "Ich muss um acht Uhr arbeiten.",
    exampleEn: "I have to work at eight o'clock.",
  },
  {
    id: "gram-separable",
    titleEn: "Separable verbs (first look)",
    summaryEn: "Many verbs have a stressed prefix that jumps to the end in the present: aufstehen → Ich stehe um sieben auf.",
    pointsEn: [
      "Common prefixes: auf, an, aus, ein, mit, zurück.",
      "The prefix is written on the infinitive (aufstehen) and in the dictionary form.",
      "In a subordinate clause the parts stay together later; we do not drill that here yet.",
    ],
    table: {
      headers: ["Infinitive", "ich (present)", "English"],
      rows: [
        ["aufstehen", "ich stehe … auf", "to get up"],
        ["ankommen", "ich komme … an", "to arrive"],
        ["einsteigen", "ich steige … ein", "to get in / on"],
        ["aussteigen", "ich steige … aus", "to get off"],
      ],
    },
    exampleDe: "Ich stehe um sieben Uhr auf.",
    exampleEn: "I get up at seven o'clock.",
  },
];
