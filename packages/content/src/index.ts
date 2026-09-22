import { materializedBoardSchema, type MaterializedBoard } from "@syncspace/contracts";
import { STARTER_BOARD, STARTER_PACK_REVIEW, createStarterBoard } from "./starter.js";

export { STARTER_BOARD, STARTER_PACK_REVIEW, createStarterBoard };
export {
  ALPHABET,
  CORE_LEXICON,
  EXTRA_LEXICON,
  PRACTICE_LEXICON,
  WEIL_CLAUSES,
  CURRICULUM_REVIEW,
  CURRICULUM_SOURCES,
  GRAMMAR_TOPICS,
  LESSONS,
  PHONEMES,
  PHRASES,
  ROADMAP,
  SENTENCE_TEMPLATES,
  SKILL_GUIDES,
  SKILL_RESOURCES,
  inquiryCorpus,
  lexiconTopics,
  validateCurriculum,
} from "./curriculum/index.js";

export function validateStarterBoard(board: MaterializedBoard = STARTER_BOARD): MaterializedBoard {
  return materializedBoardSchema.parse(board);
}
