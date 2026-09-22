# Implementation waves

| Wave | Status in this repo | Stop evidence |
| --- | --- | --- |
| S0 | Done (freeze recorded) | Version shortlist; conflict policy; schema `1.0.0` |
| S1 | First slice running locally | Create / edit / reload a local or sample board |
| S2 | Recorded in Node (not two browser profiles) | Two isolated Y.Doc clients; invalid token rejected |
| S3 | Binary SQLite + restart restore recorded | Checkpoint restore without an open peer |
| S4 | Article-recall + NFC tests | Draft not claimed reviewed |
| S5 | Two isolated personal IndexedDB profiles; shared export has no review fields | Browser-profile UI walkthrough still optional |
| S6 | Export, import, forget, token rotation on reconnect | Backup restore; unauthorized reconnect denied |
| S7 | Fresh-clone audit recorded | No committed tokens or sqlite data |

When time is tight, extra exercise modes and canvas decoration drop first. Offline proof, privacy separation, and the study loop do not.

## Solo curriculum (local, after S7)

| Surface | Status | Limit |
| --- | --- | --- |
| `/learn` roadmap, alphabet, sounds, core-500, phrases, grammar | Draft teaching records on this device | Not a CEFR path; not a Goethe list |
| English→German mapper + sentence builder | Deterministic over the authored corpus | No translation API |
| Official Goethe / DW / IPA sources | https links only | We do not host their media |
| `/learn/inquire` umlaut fold, operators, typo repair | Deterministic over the authored corpus | No translation API; recent queries stay in this profile |
| `/learn/skills` four-skill resource page | Official Goethe / DW / Deutschlandfunk links | We do not host audio or exam papers |
| `/learn/drill` daily cover set | Deterministic mix; due nouns first | Ratings only if the word is already queued |
| `/learn/lectures` one note per video or class | Personal IndexedDB; YouTube/Vimeo embed | Other class pages open in a new tab |
| LanguageTool `de-DE` check | User-started public API after consent | Free, no key; text leaves this device; not a human review |
| `/learn/write` article fill, accusative, word order, weil | Deterministic from the authored corpus | Not a teacher mark; not a Goethe paper |
| Extra draft lexemes | 20 original lemmas beside the locked core-500 | Still draft. Not a Goethe list |
| Human review of German | Not recorded | Starter and core-500 stay draft |
| Vercel static website | `vercel.json` builds `@syncspace/web` | No sync server; no loopback default in production |
| Hosted trusted-group sync | ADR-S08 + `docs/deploy-sync.md` | Operator can read boards. Sample-room off. Schema `1.0.0` |

## Enhancement waves

| Wave | Status in this repo | Stop evidence |
| --- | --- | --- |
| 0 — Honesty | Walk documented; two-profile live sync and restart-plus-third-client restore sat 22 September 2026; production SW registered; Node tests still green | Production offline reload is still a human step (`docs/wave-0-walk.md`) |
| 1 — Study loop | LWW losing draft, stacked mobile canvas, export reminder, writing drills | Still draft German. Still not a CEFR path. |
| 2 — Hosted trusted group | ADR-S08, origin allow-list, sample-room off off-loopback, `docs/deploy-sync.md` | Schema still `1.0.0`. Operator can read boards. Not E2E. Human still must run a real host. |
| 3 — More practice | Extra draft phrases; extra draft lexemes; weil/dass first look; accusative fill; weil writing drill; device voice on authored examples | Still draft. Still not a Goethe list. |
| 4–5 | Not started | Invitation rotate UI, migrations, three-client qualification. Do not sneak AI or Goethe copy into an earlier wave. |
