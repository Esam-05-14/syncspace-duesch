# S2–S3 stop gate

Date: 21 September 2026  
Branch: `implementation`  
Commands: `npm test` (28 passed), `npm run typecheck`

## What shipped

- Room authorization is a single `authorizeRoom` check used by Hocuspocus `onAuthenticate`.
- Invalid capability tokens are rejected (`authenticationFailed`).
- Two isolated Node clients (separate `Y.Doc` + WebSocket, no BroadcastChannel) converge on a vocabulary insert.
- Binary SQLite snapshots restore into a fresh document after the sync process is destroyed and started again, with no open peer.
- Shared materialization and board JSON export drop review-event fields even if a client wrote them onto extra maps.

## Remaining limits (honest)

- Two isolated **browser** profiles were not run in this session. The S2 proof is Node providers on loopback.
- Production service-worker offline reload is not proven (dev server only).
- Starter German is still draft. No human language review.
- Token rotation and a separately stored binary recovery backup are not in this slice.
- Hocuspocus `onRequest` must reject with a falsy error after writing HTTP, or the default “OK” handler crashes the process.
