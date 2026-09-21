import type { CoreLexeme, SentenceTemplate } from "@syncspace/contracts";

export type BuiltSentence = {
  de: string;
  en: string;
  notes: string[];
};

export function accusativeDefinite(article: "der" | "die" | "das"): string {
  return article === "der" ? "den" : article;
}

export function accusativeIndefinite(article: "der" | "die" | "das"): string {
  if (article === "der") {
    return "einen";
  }
  if (article === "die") {
    return "eine";
  }
  return "ein";
}

export function englishIndefinite(nounEn: string): string {
  const first = nounEn.normalize("NFC").trim().charAt(0).toLowerCase();
  return "aeiou".includes(first) ? "an" : "a";
}

function requireNoun(noun: CoreLexeme | undefined): CoreLexeme {
  if (!noun || noun.pos !== "noun" || !noun.article) {
    throw new Error("This pattern needs a noun with a dictionary article.");
  }
  return noun;
}

/** Fill a finite A1 pattern from authored lexemes. No model, no free text. */
export function buildSentence(input: {
  template: SentenceTemplate;
  noun?: CoreLexeme;
  adjective?: CoreLexeme;
  verb?: CoreLexeme;
  definite?: boolean;
}): BuiltSentence {
  const notes: string[] = [
    "Draft classroom German. Dictionary article is not a case question except where the pattern says so.",
  ];
  const definite = input.definite ?? true;

  switch (input.template.kind) {
    case "ident": {
      const noun = requireNoun(input.noun);
      return {
        de: `Das ist ${noun.article} ${noun.de}.`,
        en: `That is ${englishIndefinite(noun.en)} ${noun.en}.`,
        notes,
      };
    }
    case "have": {
      const noun = requireNoun(input.noun);
      const art = definite ? accusativeDefinite(noun.article!) : accusativeIndefinite(noun.article!);
      notes.push("After haben the noun is in the accusative: der → den, ein → einen.");
      return {
        de: `Ich habe ${art} ${noun.de}.`,
        en: `I have ${definite ? `the ${noun.en}` : `${englishIndefinite(noun.en)} ${noun.en}`}.`,
        notes,
      };
    }
    case "adj": {
      const noun = requireNoun(input.noun);
      const adjective = input.adjective;
      if (!adjective || adjective.pos !== "adj") {
        throw new Error("This pattern needs an adjective.");
      }
      return {
        de: `${noun.article} ${noun.de} ist ${adjective.de}.`,
        en: `The ${noun.en} is ${adjective.en}.`,
        notes,
      };
    }
    case "place": {
      const noun = requireNoun(input.noun);
      return {
        de: `${noun.article} ${noun.de} ist hier.`,
        en: `The ${noun.en} is here.`,
        notes,
      };
    }
    case "where": {
      const noun = requireNoun(input.noun);
      notes.push("W-question: question word first, then the verb.");
      return {
        de: `Wo ist ${noun.article} ${noun.de}?`,
        en: `Where is the ${noun.en}?`,
        notes,
      };
    }
    case "action": {
      const noun = requireNoun(input.noun);
      const verb = input.verb;
      if (!verb || verb.pos !== "verb" || !verb.forms || verb.transitive === false) {
        throw new Error("This pattern needs a transitive verb with present-tense forms.");
      }
      const art = definite ? accusativeDefinite(noun.article!) : accusativeIndefinite(noun.article!);
      notes.push("Present tense, first person: ich + verb form from the card.");
      return {
        de: `Ich ${verb.forms.ich} ${art} ${noun.de}.`,
        en: `I ${verb.en.replace(/^to\s+/, "")} ${definite ? `the ${noun.en}` : `${englishIndefinite(noun.en)} ${noun.en}`}.`,
        notes,
      };
    }
    default: {
      throw new Error("Unknown sentence pattern.");
    }
  }
}

export function lexemeToReviewPrompt(lexeme: CoreLexeme) {
  return {
    headword: lexeme.de,
    article: lexeme.article,
    plural: lexeme.plural,
    glossEn: lexeme.en,
    exampleDe: lexeme.exampleDe,
  };
}
