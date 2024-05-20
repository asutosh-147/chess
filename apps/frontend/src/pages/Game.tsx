import { useEffect, useState } from "react";
import Button from "../components/Button";
import ChessBoard from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess, Move } from "chess.js";
import { toast } from "sonner";
import useSound from "use-sound";
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
} from "@repo/utils/messages";
import { useRecoilState } from "recoil";
import { movesAtomState } from "@repo/store/chessBoard";
import MovesTable from "../components/MovesTable";

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

const Game = () => {
  const user = useUser();
  const navigate = useNavigate();
  const { roomId: gameId } = useParams();
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);
  const { token, ...currentPlayerData } = user ?? {};
  const socket = useSocket();

  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [gameData, setGameData] = useState<gameMetaData | null>(null);
  const [start, setStart] = useState<boolean>(false);
  const [allMoves, setAllMoves] = useRecoilState(movesAtomState);
  const [play] = useSound("/sounds/Chess-sounds.mp3", {
    sprite: {
      moveMade: [2181, 100],
    },
  });

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      switch (message.type) {
        case ADDED_GAME:
          toast.success("Game is added to queue", {
            description: "waiting for opponent",
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
          setStart(true);
          setBoard(chess.board());
          break;
        case MOVE:
          const move = message.payload.move;
          try {
            console.log("inside make move");
            chess.move(move);
          } catch (error) {
            console.log("Invalid move", error);
          }
          setBoard(chess.board());
          setAllMoves((oldMoves) => [...oldMoves, move]);
          break;
        case GAME_OVER:
          console.log("Game is over");
          const { result, status } = message.payload;
          toast.info(`Game is ${status}`, {
            description: result + " is the winner",
          });
          break;
        case JOIN_GAME:
          console.log("Joining existing game");
          const { moves, blackPlayer, whitePlayer } = message.payload;
          setGameData({
            blackPlayer,
            whitePlayer,
          });
          message.payload.moves.forEach((move: Move) => chess.move(move));
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
  }, [socket]);

  if (!socket) return <div>connecting...</div>;

  return (
    <div className="flex justify-center">
      <div className="pt-4 w-full max-w-screen-lg">
        {gameData && (
          <PlayerLabel
            PlayerData={
              user.id === gameData?.blackPlayer.id
                ? gameData.whitePlayer
                : gameData.blackPlayer
            }
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
              play={play}
            />
          </div>
          <div className="col-span-2 bg-stone-800 shadow-xl rounded-xl flex justify-center">
            {!start ? (
              <div className="mt-4">
                <Button
                  onClick={() => {
                    socket.send(JSON.stringify({ type: INIT_GAME }));
                  }}
                  fontWeight="semi-bold"
                >
                  Play Game
                </Button>
              </div>
            ) : (
              <MovesTable />
            )}
          </div>
        </div>
        {user && <PlayerLabel PlayerData={currentPlayerData} />}
      </div>
    </div>
  );
};

export default Game;
