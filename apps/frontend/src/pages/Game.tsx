import { useEffect, useRef, useState } from "react";
import Button from "../components/ui/Button";
import ChessBoard from "../components/ChessBoard";
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
  CREATE_ROOM,
  DELETE_ROOM,
  INIT_PLAYER_TIME,
} from "@repo/utils/messages";
import { useRecoilState, useSetRecoilState } from "recoil";
import {
  abortTimerAtom,
  movesAtomState,
  selectedMoveIndexAtom,
  spectatingAtom,
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
  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [gameData, setGameData] = useState<gameMetaData | null>(null);
  const [gameResult, setGameResult] = useState<gameEndResult | null>(null);
  const [start, setStart] = useState<boolean>(false);
  const [room, setRoom] = useState<string | null>(null);
  const setAllMoves = useSetRecoilState(movesAtomState);
  const setIsSpectating = useSetRecoilState(spectatingAtom);
  const [selectedMoveIndex, setSelectedMoveIndex] = useRecoilState(
    selectedMoveIndexAtom,
  );
  const selectedMoveIndexRef = useRef(selectedMoveIndex);

  const [startAbortTimer, setStartAbortTimer] =
    useRecoilState(startAbortTimerAtom);
  const setAbortTimer = useSetRecoilState(abortTimerAtom);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [player1Time, setPlayer1Time] = useState(INIT_PLAYER_TIME);
  const [player2Time, setPlayer2Time] = useState(INIT_PLAYER_TIME);
  const playerTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (start) {
      playerTimerRef.current = setInterval(() => {
        if (!player1Time || !player2Time)
          clearInterval(playerTimerRef.current!);
        if (chess.turn() == "w") setPlayer1Time((time) => time - 100);
        else setPlayer2Time((time) => time - 100);
      }, 100);
      return () => {
        clearInterval(playerTimerRef.current!);
      };
    }
  }, [start]);
  const getPrettyTimer = (time: number) => {
    if(!time) return <div></div>
    if(time<0) time = 0;
    const min = Math.floor(time / (60 * 1000));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    return (
      <div className="flex items-center gap-1 font-semibold text-white">
        <div>{min} : </div>
        <div>{seconds < 10 ? "0" + seconds : seconds}</div>
      </div>
    );
  };
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
          setPlayer1Time(message.payload.player1Time);
          setPlayer2Time(message.payload.player2Time);
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
          clearInterval(playerTimerRef.current!);
          setGameResult({ result, status, by });
          gameOverAudio.play();
          break;
        case JOIN_GAME:
          const { moves, blackPlayer, whitePlayer,isSpectating } = message.payload;
          if(isSpectating) setIsSpectating(isSpectating);
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
          setStart(true);
          if (
            message.payload?.result &&
            message.payload?.status !== "IN_PROGRESS"
          ) {
            clearInterval(playerTimerRef.current!)
            setGameResult({
              result: message.payload.result,
              status: message.payload.status,
              by: message.payload.by,
            });
          }
          gameStartAudio.play();
          setPlayer1Time(message.payload.player1Time);
          setPlayer2Time(message.payload.player2Time);
          setAllMoves(moves);
          setBoard(chess.board());
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
        }),
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
      <div className="w-full max-w-screen-lg pt-4">
        {gameData && (
          <div className="flex items-center justify-between">
            <PlayerLabel
              PlayerData={
                user.id === gameData?.blackPlayer.id
                  ? gameData.whitePlayer
                  : gameData.blackPlayer
              }
              playerColor={user?.id === gameData?.blackPlayer.id ? "w" : "b"}
              playerTime={
                user?.id === gameData?.blackPlayer.id
                  ? getPrettyTimer(player1Time)
                  : getPrettyTimer(player2Time)
              }
            />
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
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
          <div className="col-span-2 w-400 rounded-xl bg-stone-700 shadow-xl">
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
          <div className="flex items-center justify-between">
          <PlayerLabel
            PlayerData={
              user.id === gameData?.blackPlayer.id
                ? gameData.blackPlayer
                : gameData.whitePlayer
            }
            playerColor={user?.id === gameData?.blackPlayer.id ? "b" : "w"}
            playerTime={
              user?.id === gameData?.blackPlayer.id
                ? getPrettyTimer(player2Time)
                : getPrettyTimer(player1Time)
            }
          />
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
