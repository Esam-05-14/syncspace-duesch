# SyncSpace Deutsch

Offline-first collaborative German study workspace. A small group builds **shared lesson boards**. Each learner keeps a **private review history** on their own device.

This is ordinary software, not an AI wrapper. Shared editing, persistence, finite-answer checking, review scheduling, and sync diagnostics work without a language-model API. [Yjs](https://docs.yjs.dev) supplies merge mechanics; this repository supplies the learning model, shared/private split, recovery, authorization, interface, and tests.

**Status:** first slice plus a public **website** on Vercel. Not a hosted classroom product. Partner sync stays loopback until a later host exists. See `docs/deploy-vercel.md`.

## What you can do in this slice

1. Open the sample A1–B1 lesson, or create a standalone board saved on this device.
2. Add a vocabulary card and a shared note.
3. Practice dictionary-article recall. Starter keys are **draft** until a human German review is recorded.
4. Put selected nouns on a private Again / Got it queue. Reload and see the next due time.
5. Inspect real connection and checkpoint events.
6. Export the visible board as JSON, and export this profile’s review separately. Import restores this profile only.
7. Join the same room from a second isolated profile with a capability token (`?mode=shared#token=`).

## Local setup

Requires Node 24.21.0 and npm 11.19.x.

```bash
npm ci
npm test
npm run dev
```

- Web: `http://127.0.0.1:5177`
- Sync server: `http://127.0.0.1:4357` (loopback only)

The sample room invitation is generated at runtime. The home page can request a **development-only** join helper. The token is not in git.

A second isolated browser profile can join the same room. Two tabs in the same profile are not evidence of remote collaboration.

## Shared versus private

| Shared (`Y.Doc`) | Private (separate IndexedDB) |
| --- | --- |
| Board title, cards, notes, connections, tombstones | Ratings, due times, unfinished private drafts, remembered room tokens |

Awareness is presence only. Grades, answers, due dates, and room tokens do not belong there.

## Offline and durability (honest limits)

- A first-ever visit while offline cannot load an uncached app.
- Local restore ≠ another device has the data.
- Connected ≠ the latest edit is on disk.
- A checkpoint receipt describes that checkpoint, not every later keystroke.
- Browser storage can be evicted. Private review dies with the profile unless exported.
- Debounced checkpoints have a crash window. We surface the recovered sequence; we do not claim zero data loss.
- Loopback is not a study-partner URL. Vercel hosts the website only. A static host cannot run the sync server.
- Capability token ≠ identity. Anyone with the token is an editor.
- Shared boards are readable by participants and the server operator. This design is **not** end-to-end encrypted.

## How to run two profiles

1. Start `npm run dev`.
2. Open the sample lesson in profile A.
3. Copy the invitation from Settings (or the development join helper).
4. Open a separate browser profile, paste the invitation, and edit.
5. Use **Simulate disconnect** only as a demo control. It is not a substitute for turning the browser offline after a production build.

## Roadmap

P0 is the portfolio core (this slice, then hardened invitations, production service-worker offline proof, and a recorded German-content review). P1 adds remote hosting guidance, migrations, and more practice modes. P2 is optional audio, search, and (if ever) a separately consented assistant.

## Library credits

Yjs, y-indexeddb, y-codemirror.next, Hocuspocus, CodeMirror, better-sqlite3, React, Vite. Original work in this repository is the study data model, conflict policy, private review boundary, and verification.
