export {
  ARTICLE_ANSWERS,
  isDictionaryArticle,
  normalizeArticleAnswer,
  normalizeNfcTrim,
  type DictionaryArticle,
} from "./normalize.js";
export { checkArticleRecall, type ArticleCheck } from "./article-recall.js";
export {
  BOX_INTERVALS_MS,
  BOX_LABELS,
  applyRating,
  compareDue,
  describeBox,
  describeDue,
  dueAtFor,
  enrollCard,
  isDue,
  nextBox,
  type Box,
  type Rating,
} from "./scheduler.js";
export { articleMix, lexemesByTopic, mapEnglishToGerman, normalizeLookup, type MapHit } from "./mapper.js";
export {
  accusativeDefinite,
  accusativeIndefinite,
  buildSentence,
  englishIndefinite,
  lexemeToReviewPrompt,
  type BuiltSentence,
} from "./sentence-builder.js";
export {
  editDistance,
  foldGerman,
  inquire,
  parseInquiry,
  type InquiryCorpus,
  type InquiryHit,
  type InquiryKind,
  type ParsedInquiry,
} from "./inquire.js";
export { pickDrillSession, type DrillItem } from "./drill.js";
export { parseMediaUrl, type MediaRef } from "./media.js";
export {
  DUDEN_CHECK_URL,
  DUDEN_HOME,
  DUDEN_MAX_CHARS,
  DUDEN_PRIVACY,
  LANGUAGETOOL_CHECK_URL,
  LANGUAGETOOL_HOME,
  LANGUAGETOOL_MAX_CHARS,
  LANGUAGETOOL_PRIVACY,
  applyProofreadFix,
  classifyDudenAdvice,
  classifyProofreadIssue,
  parseDudenResponse,
  parseLanguageToolResponse,
  type ProofreadEngine,
  type ProofreadKind,
  type ProofreadMatch,
  type ProofreadReport,
} from "./proofread.js";
