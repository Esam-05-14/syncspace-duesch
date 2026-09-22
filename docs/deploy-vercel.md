# Vercel website (documented expansion)

First-slice hosting was loopback only. Shipping the **website** on Vercel does not change the shared-board schema (`1.0.0`) and does not put the sync server on the public internet.

## Problem

The study UI needs a public https URL. A partner cannot be asked to run Vite on their laptop.

## Alternatives

1. **Stay loopback-only** — keeps the original slice promise; no public site.
2. **Vercel static site** — chosen. Vite build of `@syncspace/web`. Lessons, lecture notes, review, and standalone boards stay on this device.
3. **Also host Hocuspocus** — needed later for a public shared board. Not Vercel: the sync process uses a long-lived WebSocket and SQLite. A later host (Fly, Railway, a VPS) would need a new origin allow-list and must not commit room tokens.

## Security and compatibility

- No room tokens in git, Vercel env, screenshots, or the shared document.
- Production builds do **not** default to `ws://127.0.0.1`. That would be mixed content on https and would talk to the visitor’s machine.
- The sync server remains loopback-only until a later ADR opens it.
- LanguageTool still leaves this device only after consent.
- Release promise: visitors can study on the public site. “Connected” and “server checkpoint recorded” stay no until a real sync host is configured.

## Affected tests

`tests/unit/sync-endpoints.test.ts` locks the loopback-only-in-dev rule.

## Vercel project

Repo: import `https://github.com/Esam-05-14/syncspace-duesch` (or the current `origin`).

- Framework: Vite (see `vercel.json`)
- Root directory: repository root (workspaces)
- Node: `24.21.0` (`.node-version`)
- Build: `npm run build -w @syncspace/web`
- Output: `apps/web/dist`
- Do not set `VITE_SYNC_WS` or `VITE_SYNC_HTTP` until a public sync host exists. If you set them, use `wss:` / `https:`.

SPA routes (`/learn/lectures`, `/review`, …) rewrite to `index.html`.
