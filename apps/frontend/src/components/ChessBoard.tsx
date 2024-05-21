import { Chess, Color, Move, PieceSymbol, Square } from "chess.js";
import { useEffect, useState } from "react";
import { pieceMapping } from "../utils/pieceMapping";
import { toast } from "sonner";
import { useRecoilState, useSetRecoilState } from "recoil";
import { isBoardFlipped, movesAtomState } from "@repo/store/chessBoard";
import { useParams } from "react-router-dom";
import { MOVE } from "@repo/utils/messages";
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
    .history({ verbose: true })
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
  play: any;
  started: boolean;
};
const ChessBoard = ({
  board,
  socket,
  setBoard,
  chess,
  playerColor,
  play,
  started,
}: Props) => {
  const { roomId: gameId } = useParams();
  const [from, setFrom] = useState<null | Square>(null);
  const [isFlipped, setIsFlipped] = useRecoilState(isBoardFlipped);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const isMyTurn = playerColor === chess.turn();
  const setAllMoves = useSetRecoilState(movesAtomState);
  useEffect(() => {
    if (playerColor === "b") {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  }, [playerColor]);

  const handleMakeMove = (from: Square, squareRep: Square) => {
    console.log(from, squareRep);
    try {
      let moveResult: Move;
      if(isPromoting(chess, from, squareRep)){
        moveResult = chess.move({
          from,
          to: squareRep,
          promotion: "q",
        });
      }else{
        moveResult = chess.move({
          from,
          to: squareRep,
        });
      }
      if (moveResult) {
        play({ id: "moveMade" });
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
        setAllMoves((prevMoves) => [...prevMoves, moveResult]);
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
  return (
    <div className="text-white">
      {(isFlipped ? [...board].reverse() : board).map((row, i) => {
        i = isFlipped ? i + 1 : 8 - i;
        return (
          <div key={i} className="flex">
            {(isFlipped ? [...row].reverse() : row).map((square, j) => {
              j = isFlipped ? 7 - j : j;
              const squareRep = (String.fromCharCode(97 + j) + i) as Square;
              return (
                <div
                  key={j}
                  className={` relative w-16 h-16 flex justify-center items-center ${
                    (i + j) % 2 === 0
                      ? "bg-whiteSquare-brown"
                      : "bg-blackSquare-brown"
                  }`}
                  onClick={() => {
                    if (!started) return;
                    if (!isMyTurn) return;
                    if (!square && from === null) return;
                    if (!from && square?.color !== chess.turn()) return;

                    if (!from) {
                      if (square) {
                        if (square.color === playerColor) {
                          setFrom(squareRep);
                          // setLegalMoves(chess.moves({ square: squareRep }));
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
                  {/* {from && legalMoves.includes(squareRep) && (
                    <div className="absolute bg-black opacity-50 size-5 rounded-full z-10 "></div>
                  )} */}
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
