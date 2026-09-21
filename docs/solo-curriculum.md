# Solo curriculum (from-scratch path)

This is a **documented deviation** from ADR-S01 (“not a curriculum”). The collaboration product stays board-centered. Solo learners now also get a local lesson path so they can start from zero without a partner.

## Problem

The first slice assumed a learner already had a board. A single learner asked for a roadmap, sounds, a first-500 word map, phrases, grammar, an English→German memory dictionary, and a sentence builder.

## Alternatives

1. **Outbound links only** — honest, but no study loop on this device.
2. **Copy an official exam word list** — rejected. Goethe-Institut lists are copyrighted reference PDFs, not a dump we may redistribute.
3. **Original draft lessons + official links** — chosen. We author teaching records, keep them `draft`, and point at public practice.

## What this is not

- Not the Goethe-Zertifikat A1 Wortliste.
- Not a CEFR placement, score, or “you are now B1”.
- Not a human linguistic review. Starter German stays **draft**.
- Not an AI tutor. Mapper, inquiry, and the sentence builder are deterministic lookups over our corpus.
- Not shared-board state. Lessons, inquiry hits, and lesson ticks live in the content package and this profile’s IndexedDB.

## Sources we cite (do not paste their lists)

| Source | Use |
| --- | --- |
| [Goethe-Institut exam practice](https://www.goethe.de/de/spr/prf/ueb.html) | Official exercises. Link only. |
| [Goethe-Zertifikat A1: Start Deutsch 1 Wortliste (PDF)](https://www.goethe.de/pro/relaunch/prf/de/A1_SD1_Wortliste_02.pdf) | Topic *orientation* for everyday A1 life. We do not copy the list. |
| [Deutsche Welle, Nicos Weg](https://learngerman.dw.com/en/nicos-weg/c-36519789) | Free A1–B1 video course. Link only. |
| [Goethe-Institut A1 Prüfungstraining](https://www.goethe.de/de/spr/prf/ueb/pa1.html) | Official Hören / Lesen / Schreiben / Sprechen trainer. Link only. |
| [Deutsche Welle news for learners](https://learngerman.dw.com/de/deutsch-lernen-mit-nachrichten/s-66405122) | Audio + text on DW. Link only. |
| [Deutschlandfunk Nachrichtenleicht](https://www.nachrichtenleicht.de/) | Public easy-language news. Link only. |
| [Standard German phonology](https://en.wikipedia.org/wiki/Standard_German_phonology) (CC BY-SA) | Vowel/consonant inventory; we paraphrase in English. |
| [Help:IPA/Standard German](https://en.wikipedia.org/wiki/Help:IPA/Standard_German) (CC BY-SA) | IPA key and English approximations. |
| [Council of Europe CEFR](https://www.coe.int/en/web/common-european-framework-reference-languages) | Public level *labels* for a roadmap, not a claim of attainment. |
| [Rat für deutsche Rechtschreibung](https://www.rechtschreibrat.com/) | Official orthography (ä ö ü ß). |

IPA on our cards is a **draft classroom transcription** in that Wikipedia key, not a Duden certification. Browser “Speak” uses the device voice and is not a teacher.

## Security / compatibility

- No room tokens in lessons, awareness, or exports.
- Curriculum is static TypeScript. The sync server never imports it as a seed-from-empty-client path.
- Review enrollment of a core word writes only to personal IndexedDB.
- Shared Yjs schema is unchanged (`1.0.0`).

## Tests that must stay green

- Curriculum schema: 500 unique headwords; every noun has `der`/`die`/`das`; all records `draft`.
- Mapper: English query hits the authored German lemma (NFC + trim + lower).
- Inquiry: `strasse` hits Straße; `der` / `#topic` / `pos:` filter; one-letter typo still hits the list.
- Four skills: every resource is `https:`; listen / read / write / speak each have at least one official page.
- Sentence builder: filled slots produce a deterministic German string and English gloss.
- Package boundaries: `learning` still has no `Y.Doc`; personal-store still has no Hocuspocus.

## Release promise

The first-slice board/sync/review loop is unchanged. This adds a **local Lessons** surface plus inquiry and a four-skills link page. Remaining limits: no studio audio, no human review badge, no adaptive tutoring, core-500 is everyday draft coverage rather than a frequency-ranked corpus from Leipzig/DWDS.
