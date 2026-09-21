import { useEffect, useState } from "react";
import { currentBoard, getSession, openBoardSession, subscribeSession, type BoardSession } from "./board-session.js";
import { captureTokenFromLocation, getToken } from "./tokens.js";
import type { MaterializedBoard } from "@syncspace/contracts";

export function useBoard(boardId: string, mode: "standalone" | "shared", seedStarter = false) {
  const [session, setSession] = useState<BoardSession | undefined>(() => getSession(boardId));
  const [board, setBoard] = useState<MaterializedBoard | null>(() => currentBoard(boardId));
  const [error, setError] = useState<string | null>(null);
  const [effectiveMode, setEffectiveMode] = useState<"standalone" | "shared">(mode);

  useEffect(() => {
    const captured = captureTokenFromLocation(boardId);
    const tokenPresent = Boolean(captured ?? getToken(boardId));
    const resolvedMode = mode === "shared" || tokenPresent ? "shared" : "standalone";
    const shouldSeed = resolvedMode === "standalone" && seedStarter;
    setEffectiveMode(resolvedMode);
    let cancelled = false;
    void openBoardSession({ boardId, mode: resolvedMode, seedStarter: shouldSeed })
      .then((opened) => {
        if (!cancelled) {
          setSession(opened);
          setBoard(currentBoard(boardId));
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason.message : "Could not open the board.");
        }
      });
    return subscribeSession(boardId, () => {
      setSession(getSession(boardId));
      setBoard(currentBoard(boardId));
    });
  }, [boardId, mode, seedStarter]);

  return { session, board, error, mode: effectiveMode };
}
