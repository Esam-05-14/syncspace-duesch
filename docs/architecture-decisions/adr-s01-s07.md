# Architecture decisions S01–S07

## ADR-S01 — Learning workspace, not a course clone

Collaboration and offline reliability are the engineering centerpiece. The product organizes real class material. It is not a Goethe clone or a curriculum.

## ADR-S02 — No AI in the core

Deterministic exercises and human-reviewed keys only. A future optional tutor must disclose uncertainty and obtain consent before transmitting content.

## ADR-S03 — Shared content, private review

Personal ratings, due dates, and drafts live in a separate IndexedDB with no sync provider. Cross-device personal sync is a later design, not a side effect of Yjs.

## ADR-S04 — Established CRDT machinery

Yjs 13 handles merge mechanics. Original work is the data model, conflict policy, offline lifecycle, learning engine, privacy, and tests.

## ADR-S05 — Stable Yjs 13 family

Pin Yjs 13 + `y-indexeddb` 9 + Hocuspocus 2.15 + `y-codemirror.next` 0.3. Do not mix development-branch Yjs 14 examples.

## ADR-S06 — Private groups before public hosting

Trusted-room capabilities. Not hardened multi-tenant classroom infrastructure. Shared boards are readable by participants **and** the server operator. Not end-to-end encrypted.

## ADR-S07 — Simple versioned box scheduler

Transparent intervals. Not scientifically optimized spacing. Never invent a CEFR level or exam score.

## Change-control rule

A change to room permissions, shared/private ownership, schema, deletion semantics, or grading rules requires an updated contract and regression tests.
