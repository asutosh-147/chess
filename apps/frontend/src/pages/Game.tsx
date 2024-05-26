import { useEffect, useRef, useState } from "react";
import Button from "../components/ui/Button";
import ChessBoard, { isPromoting } from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess, Move } from "chess.js";
import { toast } from "sonner";
import { useUser } from "@repo/store/useUser";
import { useNavigate, useParams } from "react-router-dom";
import PlayerLabel from "../components/PlayerLabel";

import {
  ADDED_GAME,
  GAME_ALERT,
  GAME_OVER,
  INIT_GAME,
  JOIN_GAME,
  MOVE,
  GameStatus,
  Result,
  AUTO_ABORT,
} from "@repo/utils/messages";
import { useRecoilState } from "recoil";
import { movesAtomState, selectedMoveIndexAtom } from "@repo/store/chessBoard";
import MovesTable from "../components/MovesTable";
import GameEndModal from "../components/GameEndModal";
import Confetti from "@/components/Confetti";
import Loader from "@/components/Loader/Loader";
import {
  captureAudio,
  castleAudio,
  checkMadeAudio,
  gameOverAudio,
  gameStartAudio,
  moveAudio,
} from "@/utils/audio";

type gameMetaData = {
  blackPlayer: {
    id: string;
    name: string;
    profilePic: string;
  };
  whitePlayer: {
    id: string;
    name: string;
    profilePic: string;
  };
};
type gameEndResult = {
  result: Result;
  status: GameStatus;
};

const isCastle = (move: Move) => {
  return (
    move.piece === "k" &&
    Math.abs(move.to.charCodeAt(0) - move.from.charCodeAt(0)) === 2
  );
};
export const playAudio = (move: Move, chess: Chess) => {
  if (chess.isCheck()) {
    checkMadeAudio.play();
  } else if (move.captured) {
    captureAudio.play();
  } else if (isCastle(move)) {
    castleAudio.play();
  } else {
    moveAudio.play();
  }
};

const Game = () => {
  const user = useUser();
  const navigate = useNavigate();
  const { roomId: gameId } = useParams();
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);
  // const { token, ...currentPlayerData } = user ?? {};
  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [gameData, setGameData] = useState<gameMetaData | null>(null);
  const [gameResult, setGameResult] = useState<gameEndResult | null>(null);
  const [start, setStart] = useState<boolean>(false);
  const [allMoves, setAllMoves] = useRecoilState(movesAtomState);
  const [selectedMoveIndex, setSelectedMoveIndex] = useRecoilState(
    selectedMoveIndexAtom
  );
  const selectedMoveIndexRef = useRef(selectedMoveIndex);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      // console.log(message);
      switch (message.type) {
        case ADDED_GAME:
          toast.success("Game is added to queue", {
            description: "waiting for opponent",
          });
          break;
        case AUTO_ABORT:
          toast.error("Inactivity", {
            description: message.payload.message,
          });
          break;
        case GAME_ALERT:
          console.log(message.payload.message);
          toast.error("Game Alert", {
            description: message.payload.message,
          });
          break;
        case INIT_GAME:
          toast.success("Game is initialized", {
            description: "you are playing as ",
          });
          navigate(`/play/${message.payload.roomId}`);
          setGameData({
            blackPlayer: message.payload.blackPlayer,
            whitePlayer: message.payload.whitePlayer,
          });
          gameStartAudio.play();
          setStart(true);
          setBoard(chess.board());
          break;
        case MOVE:
          const move = message.payload.move;
          if (selectedMoveIndexRef.current !== null) {
            chess.reset();
            chess.load(move.after);
            setBoard(chess.board());
            setAllMoves((oldMoves) => [...oldMoves, move]);
            setSelectedMoveIndex(null);
            playAudio(move, chess);
            return;
          }
          try {
            if (isPromoting(chess, move.from, move.to)) {
              chess.move({
                from: move.from,
                to: move.to,
                promotion: "q",
              });
            } else {
              chess.move(move);
            }
          } catch (error) {
            console.log("Invalid move", error);
          }
          playAudio(move, chess);
          setBoard(chess.board());
          setAllMoves((oldMoves) => {
            const newMoves = [...oldMoves, move];
            return newMoves;
          });
          break;
        case GAME_OVER:
          console.log("Game is over");
          const { result, status } = message.payload;
          setGameResult({ result, status });
          gameOverAudio.play();
          console.log(gameResult);
          toast.info(`Game is ${status}`, {
            description: result + " is the winner",
          });
          break;
        case JOIN_GAME:
          console.log("Joining existing game");
          const { moves, blackPlayer, whitePlayer } = message.payload;
          if (gameId !== message.payload.gameId) {
            navigate(`/play/${message.payload.gameId}`);
          }
          setGameData({
            blackPlayer,
            whitePlayer,
          });
          message.payload.moves.forEach((move: Move) => {
            if (isPromoting(chess, move.from, move.to)) {
              chess.move({
                from: move.from,
                to: move.to,
                promotion: "q",
              });
            } else {
              chess.move(move);
            }
          });
          if (
            message.payload?.result &&
            message.payload?.status !== "IN_PROGRESS"
          ) {
            setGameResult({
              result: message.payload.result,
              status: message.payload.status,
            });
          }
          gameStartAudio.play();
          setAllMoves(moves);
          setBoard(chess.board());
          setStart(true);
          break;
        default:
          console.log("Unknown message type");
          break;
      }
    };
    if (gameId !== "start") {
      socket.send(
        JSON.stringify({
          type: JOIN_GAME,
          payload: {
            gameId,
          },
        })
      );
    }
    return () => {
      setAllMoves([]);
    };
  }, [socket]);

  if (!socket)
    return (
      <div>
        <Loader />
      </div>
    );

  return (
    <div className="flex justify-center">
      {gameResult &&
        gameResult.status === "COMPLETED" &&
        gameResult.result !== "DRAW" && <Confetti />}
      {gameData && gameResult && (
        <GameEndModal gameData={gameData!} gameResult={gameResult!} />
      )}
      <div className="pt-4 w-full max-w-screen-lg">
        {gameData && (
          <PlayerLabel
            PlayerData={
              user.id === gameData?.blackPlayer.id
                ? gameData.whitePlayer
                : gameData.blackPlayer
            }
            playerColor={user?.id === gameData?.blackPlayer.id ? "w" : "b"}
          />
        )}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="col-span-4">
            <ChessBoard
              started={start}
              chess={chess}
              setBoard={setBoard}
              board={board}
              socket={socket}
              playerColor={user?.id === gameData?.blackPlayer.id ? "b" : "w"}
            />
          </div>
          <div className="col-span-2 bg-stone-700 shadow-xl rounded-xl flex justify-center w-400">
            {!start ? (
              <div className="mt-4">
                <Button
                  onClick={() => {
                    socket.send(JSON.stringify({ type: INIT_GAME }));
                  }}
                  className="font-semibold"
                >
                  Play Random
                </Button>
              </div>
            ) : (
              <MovesTable />
            )}
          </div>
        </div>
        {gameData && (
          <PlayerLabel
            PlayerData={
              user.id === gameData?.blackPlayer.id
                ? gameData.blackPlayer
                : gameData.whitePlayer
            }
            playerColor={user?.id === gameData?.blackPlayer.id ? "b" : "w"}
          />
        )}
      </div>
    </div>
  );
};

export default Game;
