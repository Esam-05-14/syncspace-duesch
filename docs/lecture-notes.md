# Lecture notes and LanguageTool (local)

Documented expansion after the first slice. Shared Yjs schema stays `1.0.0`.

## Problem

A learner opens a YouTube clip or an online class and wants a separate note for that session: free text, words, and facts. They also asked for a free German spelling/grammar check.

## Alternatives

1. **Shared board cards** — would change the collaborative schema and mix private class notes with the partner board.
2. **Copy exam audio or host video** — rejected.
3. **Personal lecture notes + LanguageTool public API** — chosen.

## What this is not

- Not a YouTube clone. We parse the URL and embed with `youtube-nocookie` or Vimeo’s player. Other class pages stay a new-tab link.
- Not shared-board state. Notes live in this profile’s IndexedDB (`lectures` store, personal DB version 2).
- Not a human German review. LanguageTool suggestions stay suggestions.
- Not guaranteed German. Do not treat a clean check as “you wrote B1 German”.

## German check

The checker is [LanguageTool](https://languagetool.org) `POST https://api.languagetool.org/v2/check` with `language=de-DE`. It needs no key and no paid plan.

Not used: Duden API (paid packages start around €40/month), LanguageTool Premium, DeepL Write, TextGears, Bing Spell Check.

Rules we follow:

- User-started only. No check on every keystroke.
- Consent checkbox before any text leaves this device.
- Visible link to languagetool.org (required by their public API).
- 20 000 character cap. A 429 is shown as a wait, not a local save failure.

## Security

- https links only.
- No room tokens in lecture notes.
- Sync server does not import lecture storage.
- Review enrollment of a lecture word writes only to personal IndexedDB.
