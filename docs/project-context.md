# SyncSpace Deutsch — project context

**Product:** SyncSpace Deutsch  
**Kind:** Offline-first collaborative German study workspace  
**Source of truth:** *SyncSpace Deutsch End-to-End Blueprint* v1.0 (20 September 2026)  
**Audience:** A small trusted study group (two to three learners), starting at practical A1–B1

## One-sentence contract

SyncSpace Deutsch is an offline-first collaborative German study workspace where a small group builds **shared lesson boards** while each learner keeps a **private review history** on their own device.

It is ordinary software, not an AI wrapper. Shared editing, persistence, finite-answer checking, review scheduling, and synchronization diagnostics must work without a language-model API.

## Product language

Use these as **separate** concepts:

- shared board
- saved on this device
- connected
- initial synchronization complete
- server checkpoint recorded

Do **not** claim that every keystroke is durably on the server because the connection icon is green. Do **not** claim end-to-end encryption, guaranteed linguistic correctness, or proven learning gains.

## Scope of the first slice

P0 portfolio core, compressed so a learner can study with a partner on loopback:

1. Open the sample A1–B1 lesson or create a standalone local board.
2. Add and edit a vocabulary card and a shared note.
3. Practice dictionary-article recall. Starter keys are **draft** until a human German review is recorded.
4. Add cards to a private review queue, self-rate Again / Got it, reload, and see the next due time.
5. Inspect **real** sync events.
6. Export the visible board as JSON, and export this device’s private review separately.
7. Join the same room from a second isolated profile with a capability token.

Not in this slice: remote hosting, schema migrations, three-client qualification, audio, AI, search.

## Locked decisions

See `docs/architecture-decisions/adr-s01-s07.md` and `docs/conflict-policy.md`.
