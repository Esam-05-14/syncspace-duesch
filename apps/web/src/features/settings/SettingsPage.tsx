import { boardExportSchema, personalReviewBackupSchema } from "@syncspace/contracts";
import {
  clearDudenApiKey,
  clearReviewHistory,
  forgetRoom,
  getDisplayName,
  hasDudenApiKey,
  listEvents,
  listRememberedRooms,
  listSchedules,
  rememberRoom,
  restoreReviewBackup,
  setDisplayName,
  setDudenApiKey,
} from "@syncspace/personal-store";
import { SAMPLE_ROOM_ID } from "@syncspace/contracts";
import { useEffect, useState } from "react";
import { downloadJson } from "../../lib/download.js";
import { currentBoard } from "../../lib/board-session.js";
import { clearToken, getToken, invitationUrl } from "../../lib/tokens.js";

export function SettingsPage() {
  const [name, setName] = useState("Learner");
  const [rooms, setRooms] = useState<Array<{ roomId: string }>>([]);
  const [invite, setInvite] = useState<string | null>(null);
  const [rememberWarning, setRememberWarning] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [dudenKey, setDudenKey] = useState("");
  const [dudenSaved, setDudenSaved] = useState(false);
  const [dudenMessage, setDudenMessage] = useState<string | null>(null);

  useEffect(() => {
    void getDisplayName().then(setName);
    void listRememberedRooms().then((rows) => setRooms(rows.map((row) => ({ roomId: row.roomId }))));
    void hasDudenApiKey().then(setDudenSaved);
  }, []);

  async function saveName() {
    await setDisplayName(name);
  }

  function exportBoard(boardId: string) {
    const board = currentBoard(boardId);
    if (!board) {
      return;
    }
    const { tombstones: _tombstones, ...visible } = board;
    const payload = boardExportSchema.parse({
      ...visible,
      exportedAt: new Date().toISOString(),
      kind: "board-content-json",
    });
    downloadJson(`${boardId}.board.json`, payload);
  }

  async function exportReview() {
    const [events, schedules] = await Promise.all([listEvents(), listSchedules()]);
    const payload = personalReviewBackupSchema.parse({
      kind: "personal-review-backup",
      profileId: "local-profile",
      exportedAt: new Date().toISOString(),
      events,
      schedules,
    });
    downloadJson("personal-review.json", payload);
  }

  async function importReview(file: File) {
    setImportMessage(null);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const result = await restoreReviewBackup(parsed);
      setImportMessage(
        `Imported ${result.importedEvents} ratings and ${result.importedSchedules} cards into this profile. Skipped ${result.skippedEvents} duplicate events.`,
      );
    } catch {
      setImportMessage("That file is not a personal-review backup for this app.");
    }
  }

  function showInvite() {
    const token = getToken(SAMPLE_ROOM_ID);
    setInvite(token ? invitationUrl(SAMPLE_ROOM_ID, token) : "No sample token in this tab. Open the sample lesson first.");
  }

  async function rememberCurrent() {
    const token = getToken(SAMPLE_ROOM_ID);
    if (!token) {
      return;
    }
    setRememberWarning(true);
    await rememberRoom({ roomId: SAMPLE_ROOM_ID, token, rememberedAt: new Date().toISOString() });
    setRooms(await listRememberedRooms());
  }

  return (
    <main className="page">
      <h1>Settings</h1>
      <article className="card">
        <h2>Display name on this device</h2>
        <p className="meta">A convenience label, not an account and not encryption.</p>
        <input value={name} onChange={(event) => setName(event.target.value)} />
        <button type="button" onClick={() => void saveName()}>
          Save name
        </button>
      </article>
      <article className="card">
        <h2>Duden German check</h2>
        <p className="meta">
          Best free-key option we found for German spelling, grammar, and punctuation. Create a
          duden.de account, open{" "}
          <a href="https://www.duden.de/api">API für Mentor</a>, pick the free package if it is
          offered (about 20 checks a day), and paste the key. It stays in this profile. It is never
          written to the shared board, awareness, or exports. Without a key, lecture notes use
          LanguageTool’s public API.
        </p>
        <label>
          API key
          <input
            type="password"
            autoComplete="off"
            value={dudenKey}
            onChange={(event) => setDudenKey(event.target.value)}
            placeholder={dudenSaved ? "Key saved on this device" : "Paste key from duden.de"}
          />
        </label>
        <div className="row">
          <button
            type="button"
            onClick={() => {
              setDudenMessage(null);
              void setDudenApiKey(dudenKey)
                .then(() => {
                  setDudenSaved(true);
                  setDudenKey("");
                  setDudenMessage("Duden key saved on this device.");
                })
                .catch((reason: unknown) => {
                  setDudenMessage(reason instanceof Error ? reason.message : "Could not save that key.");
                });
            }}
          >
            Save key
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              void clearDudenApiKey().then(() => {
                setDudenSaved(false);
                setDudenKey("");
                setDudenMessage("Duden key removed. Lecture notes will use LanguageTool.");
              });
            }}
          >
            Remove key
          </button>
        </div>
        <p className="meta">
          {dudenSaved
            ? "A Duden key is saved on this device."
            : "No Duden key in this profile."}{" "}
          Duden’s privacy policy:{" "}
          <a href="https://www.duden.de/datenschutz">duden.de/datenschutz</a>.
        </p>
        {dudenMessage ? <p className="banner">{dudenMessage}</p> : null}
      </article>
      <article className="card">
        <h2>Exports</h2>
        <p className="meta">
          Board JSON is visible material only: no tokens, no private reviews, no CRDT history. Personal
          review export is this profile only.
        </p>
        <div className="row">
          <button type="button" className="secondary" onClick={() => exportBoard(SAMPLE_ROOM_ID)}>
            Export sample board if open
          </button>
          <button type="button" className="secondary" onClick={() => void exportReview()}>
            Export private review
          </button>
          <label className="secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            Import private review
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void importReview(file);
                }
                event.target.value = "";
              }}
            />
          </label>
        </div>
        {importMessage ? <p className="banner">{importMessage}</p> : null}
      </article>
      <article className="card">
        <h2>Room access</h2>
        <p className="meta">
          Anyone with the token is an editor. Remembering it on a shared computer is unsafe. Revocation
          cannot erase copies already downloaded.
        </p>
        <div className="row">
          <button type="button" className="secondary" onClick={showInvite}>
            Show sample invitation
          </button>
          <button type="button" className="secondary" onClick={() => void rememberCurrent()}>
            Remember this private room
          </button>
        </div>
        {invite ? <p><code>{invite}</code></p> : null}
        {rememberWarning ? (
          <p className="banner">The token is now in this browser profile. Anyone using this profile can join.</p>
        ) : null}
        <ul>
          {rooms.map((room) => (
            <li key={room.roomId}>
              {room.roomId}{" "}
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  clearToken(room.roomId);
                  void forgetRoom(room.roomId).then(() => listRememberedRooms().then((rows) => setRooms(rows)));
                }}
              >
                Forget access
              </button>
            </li>
          ))}
        </ul>
      </article>
      <article className="card">
        <h2>Clear private review</h2>
        <button
          type="button"
          className="secondary"
          onClick={() => void clearReviewHistory()}
        >
          Delete this profile’s review history
        </button>
      </article>
    </main>
  );
}
