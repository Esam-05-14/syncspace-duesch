import type { Lesson, RoadmapStation, SentenceTemplate } from "@syncspace/contracts";

export const LESSONS: Lesson[] = [
  { id: "lesson-alphabet", titleEn: "Alphabet", kind: "alphabet", summaryEn: "26 letters plus ä, ö, ü, and ß, with German names and one example word each.", minutes: 15 },
  { id: "lesson-sounds", titleEn: "Sounds", kind: "sounds", summaryEn: "A classroom IPA chart: long vs short vowels, three diphthongs, and the consonants English speakers miss.", minutes: 20 },
  { id: "lesson-words", titleEn: "Core 500 words", kind: "words", summaryEn: "Everyday draft lemmas with article, plural, IPA, English, and a memory hook. Not an official exam list.", minutes: 25 },
  { id: "lesson-phrases", titleEn: "Phrases", kind: "phrases", summaryEn: "Fixed everyday lines with a situation in English and a draft IPA line.", minutes: 15 },
  { id: "lesson-grammar", titleEn: "Grammar", kind: "grammar", summaryEn: "Gender, present tense, word order, accusative, possessives, and a first look at modals.", minutes: 25 },
  { id: "lesson-mapper", titleEn: "English → German map", kind: "mapper", summaryEn: "Type an English gloss. The matcher returns authored German, never a generated translation.", minutes: 10 },
  { id: "lesson-builder", titleEn: "Sentence builder", kind: "builder", summaryEn: "Fill a finite A1 pattern from the corpus so the word sits in a full clause.", minutes: 15 },
  { id: "lesson-inquire", titleEn: "Inquiry", kind: "inquire", summaryEn: "Look up German or English across words, phrases, grammar, and sounds. Fold umlauts; filter by article, topic, or part of speech.", minutes: 10 },
  { id: "lesson-skills", titleEn: "Four skills", kind: "skills", summaryEn: "Listening, reading, writing, and speaking resources: official Goethe and DW pages plus the local drill that matches each skill.", minutes: 10 },
  { id: "lesson-sources", titleEn: "Official practice", kind: "sources", summaryEn: "Goethe practice and Deutsche Welle stay on their own sites. We only store https links.", minutes: 10 },
];

export const ROADMAP: RoadmapStation[] = [
  { id: "station-alphabet", order: 1, lessonId: "lesson-alphabet", titleEn: "Letters", goalEn: "Name every letter, including the umlauts and ß." },
  { id: "station-sounds", order: 2, lessonId: "lesson-sounds", titleEn: "Sounds", goalEn: "Hear the difference between ich-Laut, ach-Laut, /ts/, and long vs short vowels." },
  { id: "station-words", order: 3, lessonId: "lesson-words", titleEn: "First 500", goalEn: "Browse the core list by topic and queue nouns for private review." },
  { id: "station-phrases", order: 4, lessonId: "lesson-phrases", titleEn: "Useful lines", goalEn: "Produce greetings, thanks, and shop lines with the situation in mind." },
  { id: "station-grammar", order: 5, lessonId: "lesson-grammar", titleEn: "First grammar", goalEn: "Keep gender, present-tense ich/du/er, and statement vs question order apart." },
  { id: "station-mapper", order: 6, lessonId: "lesson-mapper", titleEn: "Recall from English", goalEn: "Look up an English word you know and attach the German form plus hook." },
  { id: "station-builder", order: 7, lessonId: "lesson-builder", titleEn: "Put it in a sentence", goalEn: "Build six pattern types without inventing extra German." },
  { id: "station-inquire", order: 8, lessonId: "lesson-inquire", titleEn: "Ask the list", goalEn: "Find a word or phrase in one box: umlaut fold, article filter, recent queries." },
  { id: "station-skills", order: 9, lessonId: "lesson-skills", titleEn: "Four skills", goalEn: "Open official listening, reading, writing, and speaking practice; keep audio on Goethe and DW." },
  { id: "station-sources", order: 10, lessonId: "lesson-sources", titleEn: "Official practice", goalEn: "Open Goethe and Nicos Weg when you want tasks we do not host." },
];

export const SENTENCE_TEMPLATES: SentenceTemplate[] = [
  { id: "tpl-ident", titleEn: "This is …", kind: "ident", explanationEn: "Das ist + dictionary article + noun. Identification, nominative." },
  { id: "tpl-have", titleEn: "I have …", kind: "have", explanationEn: "Ich habe + accusative article + noun. der becomes den." },
  { id: "tpl-adj", titleEn: "The noun is …", kind: "adj", explanationEn: "Article + noun + ist + adjective. The adjective stays uninflected after sein." },
  { id: "tpl-place", titleEn: "It is here", kind: "place", explanationEn: "Article + noun + ist hier. A first location frame." },
  { id: "tpl-where", titleEn: "Where is …?", kind: "where", explanationEn: "Wo + ist + article + noun. Question word, then the verb." },
  { id: "tpl-action", titleEn: "I verb the noun", kind: "action", explanationEn: "Ich + present 1st person + accusative object. Only transitive verbs from the list." },
];
