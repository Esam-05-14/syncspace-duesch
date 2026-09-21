# S0–S1 stop gate

Date: 20 September 2026  
Branch: `implementation`  
Commands: `npm install`, `npm test` (20 passed), `npx tsc -b`, `npm run typecheck -w @syncspace/web`, `npm run dev`

## What shipped

- Version freeze in `docs/versions.md` (Yjs 13.6.32 + Hocuspocus 2.15.3 + Node 24.21.0).
- Contracts, conflict policy, ADRs, starter pack (24 vocabulary, 4 notes, article-recall drafts).
- Vite PWA on `127.0.0.1:5177` and Hocuspocus/SQLite sync on `127.0.0.1:4357`.
- Shared sample room seeded **once on the server**. Development join helper generates a runtime token (not committed).
- Private review in a separate IndexedDB. Practice labels starter keys as draft.

## Browser check (this machine)

- Home → sample room `room-alltag-a1b1`.
- Status: saved on this device / connected / authorized / initial sync complete.
- Added `der Apfel / die Äpfel`, opened the Vorstellen note in CodeMirror, graded `Tisch` as `der`.
- Enrolled a noun in private review, rated Got it. After reload: 1 completed rating, card no longer due.

## Remaining limits (honest)

- Production service-worker offline reload is not proven (dev server only).
- Two isolated browser profiles were not run in this session.
- Server restart + fresh third client not yet recorded as a formal S3 spike.
- Starter German is still draft. No human language review.
- Hocuspocus `onRequest` must reject with a falsy error after writing HTTP, or the default “OK” handler crashes the process.
- Binary recovery backup and token rotation are not in this slice.
