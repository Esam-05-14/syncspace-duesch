import { NavLink, Outlet, useParams, useSearchParams } from "react-router-dom";
import { StatusBar } from "../../components/StatusBar.js";
import { useBoard } from "../../lib/use-board.js";
import { BoardContext } from "./board-context.js";

export function BoardChrome() {
  const { id = "" } = useParams();
  const [params] = useSearchParams();
  const mode = params.get("mode") === "shared" ? "shared" : "standalone";
  const seedStarter = params.get("seed") === "1";
  const { session, board, error, mode: effectiveMode } = useBoard(id, mode, seedStarter);
  const query = params.toString();

  return (
    <BoardContext.Provider value={{ boardId: id, mode: effectiveMode, session, board }}>
      <main className="page">
        <h1>{board?.title ?? "Lesson board"}</h1>
        <p className="meta">
          {id} · {effectiveMode} · schema {board?.schemaVersion ?? "…"}
        </p>
        <StatusBar session={session} mode={effectiveMode} />
        {error ? <p className="banner">{error}</p> : null}
        {effectiveMode === "shared" && !session?.status.authorized ? (
          <p className="banner">
            Shared room: this device needs a capability token. Open the sample lesson from Home, or
            paste an invitation that includes <code>#token=</code>. The token is stripped from the
            address bar after capture.
          </p>
        ) : null}
        <nav className="row" style={{ margin: "1rem 0" }}>
          <NavLink end to={{ pathname: `/board/${id}`, search: query }}>
            Board
          </NavLink>
          <NavLink to={{ pathname: `/board/${id}/vocabulary`, search: query }}>Vocabulary</NavLink>
          <NavLink to={{ pathname: `/board/${id}/practice`, search: query }}>Practice</NavLink>
          {effectiveMode === "shared" ? (
            <NavLink to={{ pathname: `/sync/${id}`, search: query }}>Sync inspector</NavLink>
          ) : (
            <NavLink to="/review">Private review</NavLink>
          )}
        </nav>
        <Outlet />
      </main>
    </BoardContext.Provider>
  );
}
