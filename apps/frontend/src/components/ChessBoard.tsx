import { Chess, Color, Move, PieceSymbol, Square } from "chess.js";
import { useEffect, useState } from "react";
import { pieceMapping } from "../utils/pieceMapping";
import { toast } from "sonner";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  isBoardFlipped,
  movesAtomState,
  selectedMoveIndexAtom,
} from "@repo/store/chessBoard";
import { useParams } from "react-router-dom";
import { MOVE } from "@repo/utils/messages";
import { playAudio } from "@/pages/Game";
export function isPromoting(chess: Chess, from: Square, to: Square) {
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
const ChessBoard = ({
  board,
  socket,
  setBoard,
  chess,
  playerColor,
  started,
}: Props) => {
  const { roomId: gameId } = useParams();
  const [from, setFrom] = useState<null | Square>(null);
  const [isFlipped, setIsFlipped] = useRecoilState(isBoardFlipped);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<null | { from: string; to: string }>(
    null
  );
  const isMyTurn = playerColor === chess.turn();
  const [allMoves, setAllMoves] = useRecoilState(movesAtomState);
  const [selectedMoveIndex, setSelectedMoveIndex] = useRecoilState(
    selectedMoveIndexAtom
  );
  // console.log(allMoves);
  const handleMakeMove = (from: Square, squareRep: Square) => {
    console.log(from, squareRep);
    try {
      console.log("trying to make move");
      let moveResult: Move;
      if (isPromoting(chess, from, squareRep)) {
        console.log("promoting");
        moveResult = chess.move({
          from,
          to: squareRep,
          promotion: "q",
        });
      } else {
        console.log("not promoting");
        moveResult = chess.move({
          from,
          to: squareRep,
        });
      }
      if (moveResult) {
        console.log("local move is made");
        socket.send(
          JSON.stringify({
            type: MOVE,
            payload: {
              gameId,
              move: moveResult,
            },
          })
        );
        playAudio(moveResult, chess);
        setAllMoves((prevMoves) => [...prevMoves, moveResult]);
        setLegalMoves([]);
        setBoard(chess.board());
        setFrom(null);
      }
    } catch (e: any) {
      setFrom(null);
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
                  className={` relative w-16 h-16 flex justify-center items-center ${
                    isKingInCheckSquare
                      ? "bg-[#FF6347]"
                      : isHighlighted
                        ? whiteBox
                          ? "bg-[#f6eb72]"
                          : "bg-[#dcc34b]"
                        : whiteBox
                          ? "bg-whiteSquare-brown"
                          : "bg-blackSquare-brown"
                  } `}
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
                              .map((move: Move) => move.to)
                          );
                        }
                      }
                    } else {
                      handleMakeMove(from, squareRep);
                    }
                  }}
                >
                  {(!isFlipped && j == 0) || (isFlipped && j == 7) ? (
                    <div className="text-gray-900 font-bold text-sm absolute top-1 left-1">
                      {i}
                    </div>
                  ) : (
                    <></>
                  )}
                  {(!isFlipped && i == 1) || (isFlipped && i == 8) ? (
                    <div className="text-gray-900 font-bold text-sm absolute bottom-0 right-1">
                      {String.fromCharCode(97 + j)}
                    </div>
                  ) : (
                    <></>
                  )}

                  {square ? (
                    <div>
                      {
                        <img
                          className="size-10"
                          src={
                            pieceMapping[
                              (square.type +
                                square.color) as keyof typeof pieceMapping
                            ]
                          }
                          alt={square?.type + square?.color}
                        />
                      }
                    </div>
                  ) : (
                    ""
                  )}
                  {from && legalMoves.includes(squareRep) && (
                    <div
                      className={`absolute k opacity-20 rounded-full z-[1] ${square ? "size-14 border-black border-4" : "size-5 bg-black"}`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ChessBoard;
