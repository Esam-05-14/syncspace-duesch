import { boardExportSchema, personalReviewBackupSchema } from "@syncspace/contracts";
import {
  clearReviewHistory,
  forgetRoom,
  getDisplayName,
  getReviewExportAt,
  listEvents,
  listRememberedRooms,
  listSchedules,
  rememberRoom,
  rememberReviewExport,
  restoreReviewBackup,
  setDisplayName,
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
  const [reviewCount, setReviewCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [lastExport, setLastExport] = useState<string | null>(null);

  useEffect(() => {
    void getDisplayName().then(setName);
    void listRememberedRooms().then((rows) => setRooms(rows.map((row) => ({ roomId: row.roomId }))));
    void Promise.all([listSchedules(), listEvents(), getReviewExportAt()]).then(([schedules, events, exported]) => {
      setReviewCount(schedules.length);
      setEventCount(events.length);
      setLastExport(exported);
    });
  }, [importMessage]);

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
    setLastExport(await rememberReviewExport());
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
        <h2>Exports</h2>
        <p>
          This profile has <b>{reviewCount}</b> queued card{reviewCount === 1 ? "" : "s"} and{" "}
          <b>{eventCount}</b> rating{eventCount === 1 ? "" : "s"}. That queue lives only on this
          device. Clearing the profile or this browser deletes it. This is not cloud backup.
        </p>
        <p className="meta">
          {lastExport
            ? `Last export recorded in this profile: ${lastExport}.`
            : "No private-review export recorded in this profile yet."}{" "}
          Board JSON is visible material only: no tokens, no private reviews, no CRDT history.
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
