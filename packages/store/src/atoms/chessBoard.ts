import { atom } from "recoil";
import { Move } from 'chess.js';
export const isBoardFlipped = atom({
  key: "isBoardFlipped",
  default: false,
});

export const movesAtomState = atom<Move[]>({
  key:"movesHistoryAtom",
  default: [],
})

export const selectedMoveIndexAtom = atom<number | null>({
  key:"selectedMoveIndexAtom",
  default: null,
})
