# Compatibility freeze (S0 shortlist)

Recorded 20 September 2026. **Installation is not evidence.** S1 must still prove: two clients, one shared note, binary checkpoint, server restart, fresh-client restore.

## Runtime

| Item | Pin | Notes |
| --- | --- | --- |
| Node | **24.21.0** | Installed local runtime. Blueprint said “Node LTS”; the earlier 22 LTS shortlist is superseded by the machine we can actually verify. `engines`: `>=24.21.0 <25`. |
| npm | **11.19.0** | Workspace + one lockfile. No pnpm/yarn. |

## Shared CRDT family (ADR-S05)

Stay on **Yjs 13**. Do not install `@y/y` / Yjs 14 examples.

| Area | Pin | Why |
| --- | --- | --- |
| CRDT | `yjs@13.6.32` | Latest stable 13.x |
| Local shared persistence | `y-indexeddb@9.0.12` | Browser restore |
| Transport | `@hocuspocus/server@2.15.3` + `@hocuspocus/provider@2.15.3` | Blueprint 2.x line; last 2.x that still depends on Yjs 13 |
| Persistence hook | `@hocuspocus/extension-database@2.15.3` | Binary fetch/store |
| Shared text | `@codemirror/state@6.7.5`, `@codemirror/view@6.43.12`, `y-codemirror.next@0.3.6` | Stable binding family |
| Awareness / protocols | `y-protocols@1.0.7` | Presence only |

Hocuspocus 3.x/4.x also declare Yjs 13, but mixing majors is out of scope. A bump needs a new ADR and a repeated spike.

## Application

| Area | Pin |
| --- | --- |
| TypeScript | `6.0.3` |
| React | `19.3.0` |
| Vite | `8.3.0` + `@vitejs/plugin-react@6.1.1` |
| PWA | `vite-plugin-pwa@1.3.0` |
| Router | `react-router@7.18.4` + `react-router-dom@7.18.4` |
| Validation | `zod@3.25.76` |
| Server SQLite | `better-sqlite3@13.0.3` |
| Tests | `vitest@5.0.1` |
| Dev server runner | `tsx@4.23.15` |

## Schema

- Shared board schema version: **`1.0.0`**
- Scheduler version: **`1`**
- Unsupported major schemas open a recovery screen. They are not overwritten.

## Spike protocol (run in S1/S2/S3, not claimed by this file)

1. Start `npm run dev` on loopback.
2. Open two isolated browser profiles on the sample room.
3. Edit the same shared note from both.
4. Confirm a checkpoint receipt after debounce.
5. Kill the sync server, start it again.
6. Open a **third fresh** profile. It must restore the last binary checkpoint without help from an open peer.
