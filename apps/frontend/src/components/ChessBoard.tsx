import { Chess, Color, Move, PieceSymbol, Square } from "chess.js";
import React, { memo, useEffect, useState } from "react";
import { pieceMapping } from "../utils/pieceMapping";
import { toast } from "sonner";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  isBoardFlipped,
  movesAtomState,
  selectedMoveIndexAtom,
  startAbortTimerAtom,
} from "@repo/store/chessBoard";
import { useParams } from "react-router-dom";
import { MOVE } from "@repo/utils/messages";
import { playAudio } from "@/pages/Game";
import PromotionOptions from "./PromotionOptions";
import { boardThemeAtom, themeMapping } from "@repo/store/theme";

function isPromoting(chess: Chess, from: Square, to: Square) {
  if (!from) {
    return false;
  }

  const piece = chess.get(from);
  if (piece?.type !== "p") {
    return false;
  }

  if (piece.color !== chess.turn()) {
    return false;
  }

  if (!["1", "8"].some((it) => to.endsWith(it))) {
    return false;
  }

  return chess
    .moves({ square: from, verbose: true })
    .map((it) => it.to)
    .includes(to);
}
type Props = {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
  chess: any;
  setBoard: any;
  playerColor: string;
  started: boolean;
};
const ChessBoard = memo(
  ({ board, socket, setBoard, chess, playerColor, started }: Props) => {
    const { roomId: gameId } = useParams();
    const [from, setFrom] = useState<null | Square>(null);
    const [isFlipped, setIsFlipped] = useRecoilState(isBoardFlipped);
    const [legalMoves, setLegalMoves] = useState<Square[]>([]);
    const [lastMove, setLastMove] = useState<null | {
      from: string;
      to: string;
    }>(null);
    const [promoting, setPromoting] = useState<React.ReactNode | null>(null);
    const isMyTurn = playerColor === chess.turn();
    const [allMoves, setAllMoves] = useRecoilState(movesAtomState);
    const setStartAbortTimer = useSetRecoilState(startAbortTimerAtom);
    const boardTheme = useRecoilValue(boardThemeAtom);
    const [selectedMoveIndex, setSelectedMoveIndex] = useRecoilState(
      selectedMoveIndexAtom,
    );
    const getSelectedPiece = () => {
      return new Promise<string>((resolve) => {
        const selectChoice = (choice: "q" | "b" | "r" | "n") => {
          resolve(choice);
          setPromoting(null);
        };
        setPromoting(
          <PromotionOptions select={selectChoice} color={playerColor} />,
        );
      });
    };
    const handleMakeMove = async (from: Square, squareRep: Square) => {
      try {
        let moveResult: Move;
        if (isPromoting(chess, from, squareRep)) {
          const piece = await getSelectedPiece();
          moveResult = chess.move({
            from,
            to: squareRep,
            promotion: piece,
          });
        } else {
          moveResult = chess.move({
            from,
            to: squareRep,
          });
        }
        if (moveResult) {
          socket.send(
            JSON.stringify({
              type: MOVE,
              payload: {
                gameId,
                move: moveResult,
              },
            }),
          );
          playAudio(moveResult, chess);
          setAllMoves((prevMoves) => [...prevMoves, moveResult]);
          setLegalMoves([]);
          setBoard(chess.board());
          setStartAbortTimer(false);
          setFrom(null);
        }
      } catch (e: any) {
        setFrom(null);
        setPromoting(null);
        toast.error("Invalid move", {
          description: e.message,
        });
      }
    };

    useEffect(() => {
      if (playerColor === "b") {
        setIsFlipped(true);
      } else {
        setIsFlipped(false);
      }
    }, [playerColor]);
    useEffect(() => {
      const lastM = allMoves.at(-1);
      if (lastM) {
        setLastMove({ from: lastM.from, to: lastM.to });
      } else {
        setLastMove(null);
      }
      setBoard(chess.board());
    }, [allMoves]);

    useEffect(() => {
      if (selectedMoveIndex !== null) {
        const move = allMoves[selectedMoveIndex];
        chess.reset();
        chess.load(move.after);
        setLastMove({ from: move.from, to: move.to });
        setBoard(chess.board());
      }
    }, [selectedMoveIndex]);
    return (
      <div className="text-white">
        {(isFlipped ? [...board].reverse() : board).map((row, i) => {
          i = isFlipped ? i + 1 : 8 - i;
          return (
            <div key={i} className="flex">
              {(isFlipped ? [...row].reverse() : row).map((square, j) => {
                j = isFlipped ? 7 - j : j;
                const squareRep = (String.fromCharCode(97 + j) + i) as Square;
                const isHighlighted =
                  from === squareRep ||
                  lastMove?.from === squareRep ||
                  lastMove?.to === squareRep;
                const isKingInCheckSquare =
                  square?.type === "k" &&
                  square?.color === chess.turn() &&
                  chess.inCheck();
                const whiteBox = (i + j) % 2 === 0;
                return (
                  <div
                    key={j}
                    className={`relative flex h-16 w-16 items-center justify-center transition-colors duration-300`}
                    style={{
                      backgroundColor: isKingInCheckSquare
                        ? "bg-[#FF6347]"
                        : isHighlighted
                          ? whiteBox
                            ? "#f6eb72"
                            : "#dcc34b"
                          : whiteBox
                            ? themeMapping[boardTheme].white
                            : themeMapping[boardTheme].black,
                    }}
                    onClick={() => {
                      if (!started) return;
                      if (selectedMoveIndex !== null) {
                        chess.reset();
                        const move = allMoves[allMoves.length - 1];
                        chess.load(move?.after);
                        setLastMove({ from: move?.from, to: move?.to });
                        setBoard(chess.board());
                        setSelectedMoveIndex(null);
                      }
                      if (!isMyTurn) return;
                      if (!square && from === null) return;
                      if (!from && square?.color !== chess.turn()) return;
                      if (from && from === squareRep) {
                        setFrom(null);
                        setPromoting(null);
                        setLegalMoves([]);
                        return;
                      }
                      if (!from) {
                        if (square) {
                          if (square.color === playerColor) {
                            setFrom(squareRep);
                            setLegalMoves(
                              chess
                                .moves({ square: square.square, verbose: true })
                                .map((move: Move) => move.to),
                            );
                          }
                        }
                      } else {
                        handleMakeMove(from, squareRep);
                      }
                    }}
                  >
                    {(!isFlipped && j == 0) || (isFlipped && j == 7) ? (
                      <div className="absolute left-1 top-1 text-sm font-bold text-gray-900">
                        {i}
                      </div>
                    ) : (
                      <></>
                    )}
                    {(!isFlipped && i == 1) || (isFlipped && i == 8) ? (
                      <div className="absolute bottom-0 right-1 text-sm font-bold text-gray-900">
                        {String.fromCharCode(97 + j)}
                      </div>
                    ) : (
                      <></>
                    )}
                    {square ? (
                      // <DraggablePiece piece={square.type} square={squareRep} >
                      <img
                        className="size-11"
                        src={
                          pieceMapping[
                            (square.type +
                              square.color) as keyof typeof pieceMapping
                          ]
                        }
                        alt={square?.type + square?.color}
                      />
                    ) : (
                      // </DraggablePiece>
                      <div></div>
                    )}
                    {from && legalMoves.includes(squareRep) && (
                      <div
                        className={`k absolute z-[1] rounded-full opacity-20 ${square ? "size-14 border-4 border-black" : "size-5 bg-black"}`}
                      ></div>
                    )}
                    {from === squareRep && promoting}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  },
);

export default ChessBoard;
