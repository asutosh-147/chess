import { atom } from "recoil";
import { Move } from "chess.js";
export const isBoardFlipped = atom({
  key: "isBoardFlipped",
  default: false,
});

export const movesAtomState = atom<Move[]>({
  key: "movesHistoryAtom",
  default: [],
});

export const selectedMoveIndexAtom = atom<number | null>({
  key: "selectedMoveIndexAtom",
  default: null,
});
export const abortTimerAtom = atom<number>({
  key: "abortTimerAtom",
  default: 30000,
});
export const startAbortTimerAtom = atom<boolean>({
  key: "startAbortTimer",
  default: false,
});
