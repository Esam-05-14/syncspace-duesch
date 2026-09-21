# Agent instructions

SyncSpace Deutsch is a deterministic collaborative study tool. Cursor may help author it. The finished product is not an AI wrapper.

## Binding documents

Read, in order, before changing behavior:

1. `docs/project-context.md`
2. `docs/versions.md`
3. `docs/conflict-policy.md`
4. `docs/architecture-decisions/adr-s01-s07.md`
5. `packages/contracts/src/index.ts`

The source blueprint is the Word document dated 20 September 2026. A proposed deviation must state the problem, alternatives, security or compatibility impact, affected tests, and whether the release promise changes. Do not silently broaden scope or weaken a gate.

## Product language

Use: shared board, saved on this device, connected, initial synchronization complete, server checkpoint recorded.

Do not use: all changes saved (as a single badge), end-to-end encrypted, guaranteed German, proven learning gains, you are now B1.

## Implementation rules

- Build and verify one wave at a time. Record remaining limits honestly.
- Packages must not import application code. `learning` accepts ordinary objects, never a `Y.Doc`. `personal-store` must not import Hocuspocus or the sync provider.
- The sync server never imports personal browser storage.
- Seed shared rooms once on the server. Never seed because a client saw an empty document.
- Persist binary Yjs state. Do not rebuild a shared room from JSON.
- Starter German stays **draft** until a human review is recorded. Do not fabricate that review.
- Room tokens are runtime secrets. Never commit them. Never put them in the shared document, awareness, exports, or screenshots.
- Do not commit or push unless the user explicitly asks. Never force-push.
