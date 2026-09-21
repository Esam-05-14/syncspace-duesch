# Conflict and identity policy

These rules are implemented now. Do not weaken them to make a feature easier.

## Survival

| Situation | Outcome |
| --- | --- |
| Independent card edits | Both survive |
| Two inserts into the same note | Merge as `Y.Text` operations |
| Simultaneous vocabulary saves | Last-writer-wins on the **atomic** lexical JSON value. Keep a short-lived local draft of the losing form when we can detect it. Explain this in the UI. |
| Delete vs edit | Tombstone wins. The card stays gone. Incident connections hide. |
| Undo of a deletion | Create a **new** card after confirmation. Do not resurrect-and-merge. |
| Ordinary note undo | Local-origin `Y.UndoManager` only. One learner’s undo must not undo another’s action. |

## Identity

- Opaque random IDs for boards, cards, connections, review events.
- Never key records by titles or headwords.
- A canonical content hash covers grading fields. Editing those fields invalidates review approval.
- Deletion is a grow-only tombstone. Deleted IDs are not reused.

## Room seed

Seed a shared room **once on the server**. Persist the initial binary state. Clients must never insert starter content because the document looked empty.

An independently created offline board receives a **new** identity. Publishing it later creates a new server room. Joining an existing room never overwrites that room with a cached empty document.

## Comparison

Compare **canonical materialized** visible state (IDs sorted, presence removed). Matching state vectors alone are not proof of equal visible state or deletion effects.
