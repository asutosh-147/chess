import { useEffect, useState } from "react";
import Button from "../components/Button";
import ChessBoard from "../components/ChessBoard";
import { useSocket } from "../hooks/useSocket";
import { Chess } from "chess.js";
import { toast } from "sonner";
import useSound from "use-sound";
import { useUser } from "@repo/store/useUser";
import { useNavigate } from "react-router-dom";
import PlayerLabel from "../components/PlayerLabel";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const ADDED_GAME = "added_game";
export const GAME_ALERT = "game_alert";

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
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user]);
  const {token, ...currentPlayerData} = user ?? {};
  const socket = useSocket();

  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [gameData, setGameData] = useState<gameMetaData | null>(null);
  const [start, setStart] = useState<boolean>(false);
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
          chess.move({ from: move.from, to: move.to });
          setBoard(chess.board());
          break;
        case GAME_OVER:
          console.log("Game is over");
          const { result, status } = message.payload;
          toast.info(`Game is ${status}`, {
            description: result + " is the winner",
          });
          break;
        default:
          console.log("Unknown message type");
          break;
      }
    };
  }, [socket]);

  if (!socket) return <div>connecting...</div>;

  return (
    <div className="flex justify-center">
      <div className="pt-4 w-full max-w-screen-lg">
        {start && gameData && (
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
          <div className="col-span-2 bg-dark-secondary shadow-xl rounded-xl flex justify-center">
            {!start && (
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
            )}
          </div>
        </div>
        {
          user && <PlayerLabel
            PlayerData={currentPlayerData}
          />
        }
      </div>
    </div>
  );
};

export default Game;
