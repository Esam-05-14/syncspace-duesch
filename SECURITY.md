# Security

P0 is a **trusted private group** on loopback. It is not hardened multi-tenant classroom infrastructure.

## Facts, not fine print

- Shared boards are readable by authorized participants and the server operator.
- The design is not end-to-end encrypted.
- A room ID is not a secret. A capability token is.
- Private review data stays in the local browser profile. Anyone with that profile can read it.
- Token revocation cannot erase copies already downloaded.

## Rules

- Bind the sync server to `127.0.0.1` in development.
- Store only a SHA-256 hash of each room token.
- Never log tokens, note text, typed answers, private history, or full invitation URLs.
- Render shared text as text. No raw HTML, script URLs, or arbitrary iframes.
- Resource links: `https:` only, `rel="noopener noreferrer"`, `target="_blank"`.

Maintainer contact for a public release is not invented here.
