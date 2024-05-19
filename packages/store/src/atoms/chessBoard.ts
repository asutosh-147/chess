import { atom } from "recoil";
import { Move } from 'chess.js';
export const isBoardFlipped = atom({
  key: "isBoardFlipped",
  default: false,
});

export const moves = atom<Move[]>({
  key:"movesHistoryAtom",
  default: [],
})

