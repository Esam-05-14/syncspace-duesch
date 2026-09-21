# S5–S7 stop gate

Date: 21 September 2026  
Branch: `implementation`  
Commands: `npm test` (40 passed), `npm run typecheck`

## What shipped

- Private review lives in a separate IndexedDB. Two named databases do not see each other’s ratings.
- Personal-review JSON can be exported and imported on this profile. Duplicate event ids are skipped. Board JSON is not accepted as a review backup.
- After a sample-room token is rotated, reconnecting with the old token fails. A new token still restores the binary board.
- Invitation URLs include `?mode=shared` and `#token=`. A hash token upgrades a board to shared and is stripped from the address bar.
- Remembered room tokens in this browser profile can reopen a shared board.
- Status shows **server checkpoint recorded** from the loopback snapshot receipt.
- Fresh-clone audit: `.env` and sqlite data are not tracked; `.env.example` has no live token.

## Remaining limits (honest)

- Two isolated **browser** profiles were not clicked in this session. Isolation is proven with separate IndexedDB names and separate Node Y.Doc clients.
- Production service-worker offline (close the tab, go offline, reopen a built preview) is not recorded here. The PWA plugin injects a register script on build.
- Starter German is still **draft**. No human language review was fabricated.
- Remote hosting, schema migrations, and token distribution outside loopback are out of this slice.
