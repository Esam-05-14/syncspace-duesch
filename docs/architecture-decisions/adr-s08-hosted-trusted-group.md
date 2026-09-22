# ADR-S08 — Hosted trusted group (documented expansion)

Recorded 22 September 2026. This expands ADR-S06. It does **not** turn SyncSpace Deutsch into a multi-tenant classroom or claim end-to-end encryption.

## Problem

ADR-S06 kept partner sync on loopback. A friend on another laptop cannot join `127.0.0.1`. The public website on Vercel can teach on-device, but **connected** and **server checkpoint recorded** stay no until a long-lived sync process exists on the internet.

## Alternatives

1. **Stay loopback-only** — honest, but two households cannot share a board.
2. **Put Hocuspocus on Vercel serverless** — rejected. The process needs a WebSocket and a disk for SQLite binary snapshots.
3. **Vercel website + always-on Node (Fly, Railway, or a small VPS with Caddy)** — chosen. Shared schema stays `1.0.0`. The operator of the sync box can read every shared board.

## Decision

The sync server may bind `0.0.0.0` when `SYNCSPACE_ALLOWED_ORIGINS` is a comma-separated allow-list of website origins. `/dev/sample-room` and `/dev/snapshot/` stay **off** unless explicitly enabled. Production websites still do not default to `ws://127.0.0.1`. Room tokens stay runtime secrets.

Loopback without those env vars is unchanged: local `npm run dev` still mints a development invitation.

## Security and compatibility

- Shared boards are readable by participants **and** the server operator. Not end-to-end encrypted.
- Review events stay in personal IndexedDB. The sync box never imports `personal-store`.
- Clients still must not seed a shared room because it looked empty.
- `/dev/sample-room` on the public internet would mint an editor token for anyone who can hit the URL. Default off when not on loopback, and off whenever `NODE_ENV=production`.
- CORS and WebSocket `Origin` must match the allow-list when hosted.
- Schema stays `1.0.0`. Capability token is still not identity.

## Release promise

**Changes.** If the website is built with `VITE_SYNC_WS` / `VITE_SYNC_HTTP` (`wss:` / `https:`) and the sync process is running with a disk, a partner off this laptop can see **connected** and **server checkpoint recorded**. Still a trusted group of two or three, not SaaS.

## Affected tests

`tests/unit/sync-access.test.ts` and `tests/integration/sync-http-access.test.ts`. Existing two-client and checkpoint tests stay on loopback defaults.

## Operator checklist

See `docs/deploy-sync.md`. Never commit room tokens, sqlite files, or a live `SYNCSPACE_SAMPLE_TOKEN`.
