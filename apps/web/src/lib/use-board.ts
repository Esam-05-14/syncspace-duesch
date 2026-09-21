import { useEffect, useState } from "react";
import { currentBoard, getSession, openBoardSession, subscribeSession, type BoardSession } from "./board-session.js";
import { captureTokenFromLocation } from "./tokens.js";
import type { MaterializedBoard } from "@syncspace/contracts";

export function useBoard(boardId: string, mode: "standalone" | "shared", seedStarter = false) {
  const [session, setSession] = useState<BoardSession | undefined>(() => getSession(boardId));
  const [board, setBoard] = useState<MaterializedBoard | null>(() => currentBoard(boardId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    captureTokenFromLocation(boardId);
    let cancelled = false;
    void openBoardSession({ boardId, mode, seedStarter })
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

  return { session, board, error };
}
