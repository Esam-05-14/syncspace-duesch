import { createContext, useContext } from "react";
import type { MaterializedBoard } from "@syncspace/contracts";
import type { BoardSession } from "../../lib/board-session.js";

export type BoardContextValue = {
  boardId: string;
  mode: "standalone" | "shared";
  session?: BoardSession;
  board: MaterializedBoard | null;
};

export const BoardContext = createContext<BoardContextValue | null>(null);

export function useBoardContext(): BoardContextValue {
  const value = useContext(BoardContext);
  if (!value) {
    throw new Error("Board routes must render inside BoardChrome.");
  }
  return value;
}
