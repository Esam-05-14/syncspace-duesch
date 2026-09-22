# Wave 0 walk — first-slice honesty

Record remaining limits. Do not treat a green badge as proof.

## Two isolated browser profiles

Two tabs in one profile are the same person.

1. Run `npm run dev` on this machine.
2. Profile A: open the sample shared board from Home.
3. Settings → show the sample invitation. Do not paste the token into the board or a screenshot.
4. Profile B (another browser, or a separate Chrome profile): paste the invitation.
5. Edit the same shared note from both. Both inserts should survive.
6. Edit the same vocabulary card from both. Last-writer-wins on the lexical JSON. The losing tab should keep a short-lived local draft.

**Recorded in Node:** `tests/convergence/two-clients.test.ts`.  
**Browser walk:** still a human step. This file is the checklist, not a claim that a reviewer sat both profiles today.

## Server restart and a third fresh client

1. After a shared edit, wait for **server checkpoint recorded** on the status line.
2. Stop the sync process.
3. Start it again.
4. Open a **third** isolated profile that has never held that room. It must restore the last binary checkpoint without help from an open peer.

**Recorded in Node:** `tests/integration/checkpoint-restore.test.ts`.  
**Browser walk:** still a human step.

## Production service worker

1. `npm run preview` (production Vite build on port 4177).
2. Open `/learn`, `/review`, and `/guide` once while online so the worker can cache them.
3. Turn the network off (DevTools offline is enough).
4. Reload `/learn`. The shell and cached lesson routes should still render.
5. Shared-board **connected** stays **no** unless a real sync host is configured. Offline is not “all changes saved”.

`vite-plugin-pwa` writes `sw.js` with `navigateFallback: /index.html`. Dev (`npm run dev`) does not install that worker.

## Leftover local work

Keep LanguageTool (no key) as the only checker. Keep Vercel as the **website** only. Production must not default to `ws://127.0.0.1`. That work lives in the tree; commit it only when asked.
