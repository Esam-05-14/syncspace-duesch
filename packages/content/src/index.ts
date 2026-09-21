import { materializedBoardSchema, type MaterializedBoard } from "@syncspace/contracts";
import { STARTER_BOARD, STARTER_PACK_REVIEW, createStarterBoard } from "./starter.js";

export { STARTER_BOARD, STARTER_PACK_REVIEW, createStarterBoard };

export function validateStarterBoard(board: MaterializedBoard = STARTER_BOARD): MaterializedBoard {
  return materializedBoardSchema.parse(board);
}
