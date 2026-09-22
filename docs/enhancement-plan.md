# Improvement and enhancement plan

Recorded 22 September 2026. This is a planning document, not a claim that the work is done. Build **one wave at a time**. A proposed deviation still needs the problem, alternatives, security or compatibility impact, affected tests, and whether the release promise changes.

## Product rails

SyncSpace Deutsch stays a deterministic collaborative German study workspace for a small trusted group.

- Use: shared board, saved on this device, connected, initial synchronization complete, server checkpoint recorded.
- Do not use: all changes saved, end-to-end encrypted, guaranteed German, proven learning gains, you are now B1.
- Starter and core-500 German stay **draft** until a human review is recorded. Do not fabricate that review.
- Room tokens are runtime secrets. Never commit them. Never put them in Yjs, awareness, exports, or screenshots.
- `learning` never accepts a `Y.Doc`. Review events stay out of the sync server. Seed shared rooms once on the server.

## Where we are

First slice S0–S7 is recorded in Node. Solo lessons, inquiry, cover drill, lecture notes, LanguageTool (no key), and an in-app Guide are in the tree. Partner sync defaults to loopback. Vercel can host the **website** only. Hosted trusted-group sync is ADR-S08.

Sat in a browser on 22 September 2026: two isolated profiles on the sample room, and restart plus a third fresh client restoring the last binary checkpoint. Still not proven: production service-worker offline reload. Human German review is not recorded.

## Waves

### Wave 0 — Close honesty gaps

Prove the first-slice claims before adding more surface.

1. Two isolated browser profiles on the sample room.
2. Kill sync, restart, open a third fresh profile; last binary checkpoint restores without an open peer.
3. Production build: cached route reloads with the network off.
4. Decide what to do with uncommitted local work (LanguageTool-only checker, Vercel files) so `main` matches the story we tell.

**Release promise:** unchanged. Limits become recorded.

Shipped in-tree: production service-worker registration, offline device banner, `docs/wave-0-walk.md`. Node two-client and checkpoint tests remain green. A human sat the two-profile and restart-plus-third-client walks on 22 September 2026. Production offline reload is still a human step.

### Wave 1 — Study loop on this device

Make the daily path smoother without a new server.

- Home continue strip and Guide (partly shipped).
- Review empty-state and keyboard path.
- Show a short-lived local draft when last-writer-wins loses a vocabulary edit (`docs/conflict-policy.md`).
- Usable board editing under 720px (the canvas is hidden today).
- Settings reminder to export private review.
- Deterministic writing drills from the authored corpus (article fill, word order).

**Release promise:** unchanged. Still draft. Still not a CEFR path.

Shipped in-tree: real LWW losing-draft on an edited vocabulary card, stacked canvas under 720px, Settings export reminder with a recorded export time, `/learn/write` article-fill and word-order drills.

### Wave 2 — Host the whole product (optional)

Needs a new ADR. ADR-S06 today is private groups on loopback.

The website can stay on Vercel. Shared boards need a long-lived Node process, a disk for SQLite, and `wss:`. Alternatives: Vercel + Fly.io, or one small VPS with Caddy. Not a Vercel serverless function.

Must change: bind `0.0.0.0`; origin allow-list; `/dev/sample-room` off in production; persistent `./data`; `VITE_SYNC_WS` / `VITE_SYNC_HTTP` at build time.

Must not change: schema `1.0.0`; client-side seed of an empty room; review data on the sync box; tokens in git.

**Release promise:** changes. `connected` can be true off this laptop. Still a trusted group, not multi-tenant SaaS, not end-to-end encrypted.

Shipped in-tree: ADR-S08, `resolveSyncAccess`, origin allow-list, sample-room/snapshot off unless forced, `docs/deploy-sync.md`, Dockerfile. Loopback `npm run dev` is unchanged. A human still has to run a real host and rebuild the website with `VITE_SYNC_WS` / `VITE_SYNC_HTTP`.

### Wave 3 — More original practice

Author more draft words, phrases, and grammar. Device voice for **our** example sentences. Official Goethe / DW / Nachrichtenleicht stay https links.

Do not copy the Goethe Wortliste. Do not host exam audio. Do not treat LanguageTool as a human review.

**Release promise:** more local material. Draft status unchanged.

Shipped in-tree: more draft phrases (weather, home, phone, class, time), twenty extra draft lexemes beside the locked core-500, a weil/dass first-look grammar topic, accusative fill after *haben*, a weil writing drill, and device voice on authored example sentences. All new records stay draft.

### Wave 4 — Hardening

Invitation rotate UI, schema `1.x` migrations with a recovery screen for unsupported majors, three-client qualification.

**Release promise:** still a capability-token trusted group. Token ≠ identity.

### Wave 5 — Later, if ever

Each item needs its own ADR:

- In-app search (blueprint P2).
- Cross-device private review (ADR-S03: later design, not a Yjs side effect).
- Accounts and passwords.
- A separately consented assistant (ADR-S02; never the core loop).

Duden’s paid API stays out. LanguageTool’s public API is the free checker.

## Tests that must stay green

Package boundaries, article-recall, inquiry, curriculum draft status, no committed tokens or sqlite, checkpoint restore, unauthorized reconnect denied. Wave 2 adds origin-allow-list tests. Wave 4 adds migration tests.

## What this plan will not do

It will not mark a learner B1, encrypt the shared board, copy a Goethe list, or replace a teacher. Extra exercise modes drop first if time is tight. Offline proof, privacy separation, and the study loop do not.
