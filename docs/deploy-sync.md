# Hosted trusted-group sync (ADR-S08)

The public website on Vercel can teach on this device. **Connected** and **server checkpoint recorded** need a long-lived Node process with a disk. That process is not a Vercel serverless function.

This is still a trusted group of two or three. The operator of the sync box can read every shared board. It is not end-to-end encrypted and not multi-tenant SaaS. Schema stays `1.0.0`.

## What must stay true

- Seed shared rooms once on the server. Do not seed because a client saw an empty document.
- Persist binary Yjs state. Do not rebuild a room from JSON.
- Review events stay in personal IndexedDB. This process never imports `personal-store`.
- Room tokens are runtime secrets. Never commit them, never put them in Vercel env as a sample invitation, never paste them into the shared board.
- Production websites still do not default to `ws://127.0.0.1`.
- `/dev/sample-room` and `/dev/snapshot/` stay **off** unless you set the explicit enable flags. On a public bind those flags mint an editor token for anyone who can hit the URL. Leave them unset.

## Environment

| Variable | Loopback `npm run dev` | Hosted box |
| --- | --- | --- |
| `SYNCSPACE_HOST` | `127.0.0.1` (default) | `0.0.0.0` |
| `SYNCSPACE_SYNC_PORT` or `PORT` | `4357` | host-assigned or `4357` |
| `SYNCSPACE_DATA_DIR` | `./data` (gitignored) | persistent volume |
| `SYNCSPACE_ALLOWED_ORIGINS` | unset | required: comma-separated website origins, no trailing slash |
| `NODE_ENV` | unset | `production` |
| `SYNCSPACE_ENABLE_SAMPLE_ROOM` | implicit on loopback | leave unset |
| `SYNCSPACE_ENABLE_DEV_SNAPSHOT` | implicit on loopback | leave unset |

Website build (Vercel or any static host):

```
VITE_SYNC_WS=wss://sync.example.test
VITE_SYNC_HTTP=https://sync.example.test
```

Use `wss:` / `https:`. Rebuild the website after you change these. The allow-list on the box must include the website origin, for example `https://your-app.vercel.app`.

## Put TLS in front

This process speaks plain HTTP/WS. Put Caddy, nginx, or the platform’s HTTPS proxy in front so browsers see `wss:`.

## Docker

From the repository root:

```bash
docker build -t syncspace-sync .
docker run --rm -p 4357:4357 ^
  -e SYNCSPACE_HOST=0.0.0.0 ^
  -e SYNCSPACE_ALLOWED_ORIGINS=https://your-app.vercel.app ^
  -e NODE_ENV=production ^
  -v syncspace-data:/data ^
  syncspace-sync
```

On bash, use `\` instead of `^`.

Fly.io, Railway, or a small VPS with Caddy are the intended homes. Map a persistent volume to `/data`. Set the same origin allow-list. Do not enable the sample-room helper.

## How two friends join a hosted room

1. The operator starts the box once so the sample room is seeded on disk.
2. Share a **runtime** invitation out of band (Settings on a machine that already has the token, or a one-time note). Anyone with the token is an editor.
3. Each person opens the **public website** (not `127.0.0.1`) and pastes the invitation.
4. Status can then show **connected** and later **server checkpoint recorded**. That still does not mean every later keystroke is on disk.

A friend cannot join through `127.0.0.1` on your laptop. That address is only that laptop.

## Local loopback is unchanged

`npm run dev` still binds `127.0.0.1` and still serves `/dev/sample-room`. Existing two-client tests stay on those defaults.
