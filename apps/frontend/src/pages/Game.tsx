import { useEffect, useRef, useState } from "react";
import Button from "../components/ui/Button";
import ChessBoard from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess, Move } from "chess.js";
import { toast } from "sonner";
import { useUser } from "@repo/store/useUser";
import { useNavigate, useParams } from "react-router-dom";
import PlayerLabel from "../components/PlayerLabel";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
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
  CREATE_ROOM,
  DELETE_ROOM,
} from "@repo/utils/messages";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  abortTimerAtom,
  movesAtomState,
  selectedMoveIndexAtom,
  startAbortTimerAtom,
} from "@repo/store/chessBoard";
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
import RoomDetails from "@/components/RoomDetails";
import InGameButtons from "@/components/InGameButtons";
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
export type gameEndResult = {
  result: Result;
  status: GameStatus;
  by: string | null;
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
  const [room, setRoom] = useState<string | null>(null);
  const setAllMoves = useSetRecoilState(movesAtomState);
  const [selectedMoveIndex, setSelectedMoveIndex] = useRecoilState(
    selectedMoveIndexAtom
  );
  const selectedMoveIndexRef = useRef(selectedMoveIndex);

  const [startAbortTimer, setStartAbortTimer] =
    useRecoilState(startAbortTimerAtom);
  const setAbortTimer = useSetRecoilState(abortTimerAtom);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (startAbortTimer) {
      intervalRef.current = setInterval(() => {
        setAbortTimer((prev) => {
          if (prev <= 1000) {
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
      setAbortTimer(30000);
    }
    return () => {
      clearInterval(intervalRef.current!);
    };
  }, [startAbortTimer]);

  useEffect(() => {
    selectedMoveIndexRef.current = selectedMoveIndex;
  }, [selectedMoveIndex]);
  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case ADDED_GAME:
          toast.success("Game is added to queue", {
            description: "waiting for opponent",
          });
          break;
        case AUTO_ABORT:
          setStartAbortTimer(true);
          toast.error("Inactivity", {
            description: message.payload.message,
          });
          break;
        case CREATE_ROOM:
          setRoom(message.payload.gameId);
          toast.success("Created", {
            description: message.payload.message,
          });
          break;
        case DELETE_ROOM:
          setRoom(null);
          toast.success("Deleted", {
            description: message.payload.message,
          });
          break;
        case GAME_ALERT:
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
          setStartAbortTimer(false);
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
            chess.move(move);
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
          const { result, status, by } = message.payload;
          setStartAbortTimer(false);
          setGameResult({ result, status, by });
          gameOverAudio.play();
          break;
        case JOIN_GAME:
          const { moves, blackPlayer, whitePlayer } = message.payload;
          if (gameId !== message.payload.gameId) {
            navigate(`/play/${message.payload.gameId}`);
          }
          setGameData({
            blackPlayer,
            whitePlayer,
          });
          message.payload.moves.forEach((move: Move) => {
            chess.move(move);
          });
          if (
            message.payload?.result &&
            message.payload?.status !== "IN_PROGRESS"
          ) {
            setGameResult({
              result: message.payload.result,
              status: message.payload.status,
              by: message.payload.by,
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
        gameResult.result !== "DRAW" &&
        ((gameResult.result === "BLACK_WINS" &&
          gameData?.blackPlayer.id === user.id) ||
          (gameResult.result === "WHITE_WINS" &&
            gameData?.whitePlayer.id === user.id)) && <Confetti />}
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
            <DndProvider backend={HTML5Backend}>
              <ChessBoard
                started={start}
                chess={chess}
                setBoard={setBoard}
                board={board}
                socket={socket}
                playerColor={user?.id === gameData?.blackPlayer.id ? "b" : "w"}
              />
            </DndProvider>
          </div>
          <div className="col-span-2 bg-stone-700 shadow-xl rounded-xl w-400">
            {!start ? (
              <div className="mt-4">
                {!room ? (
                  <div className="flex flex-col items-center gap-3">
                    <Button
                      onClick={() => {
                        socket.send(JSON.stringify({ type: INIT_GAME }));
                      }}
                      className="font-semibold"
                    >
                      Play Random
                    </Button>
                    <Button
                      onClick={() => {
                        socket.send(JSON.stringify({ type: CREATE_ROOM }));
                      }}
                      className="font-semibold"
                    >
                      Create Room
                    </Button>
                  </div>
                ) : (
                  <div>
                    {room && <RoomDetails roomId={room} socket={socket} />}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <MovesTable />
                <InGameButtons socket={socket} gameId={gameId ?? ""} />
              </div>
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
