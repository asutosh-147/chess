import {
  abortTimerAtom,
  movesAtomState,
  startAbortTimerAtom,
} from "@repo/store/chessBoard";
import { useRecoilValue } from "recoil";
import { pieceMapping } from "@/utils/pieceMapping";
import { ReactNode } from "react";

type Props = {
  PlayerData: {
    id: string;
    name: string;
    profilePic: string;
  };
  playerColor: string;
  playerTime: ReactNode;
};
const PlayerLabel = ({ PlayerData, playerColor, playerTime }: Props) => {
  const allMoves = useRecoilValue(movesAtomState);
  const abortTimer = useRecoilValue(abortTimerAtom);
  const startAbortTimer = useRecoilValue(startAbortTimerAtom);
  const opponentColor = playerColor === "w" ? "b" : "w";
  const pieceOrder = {
    p: 1,
    r: 2,
    n: 3,
    b: 4,
    q: 5,
    k: 6,
    "": 7,
  };

  return (
    <div className="my-3 flex items-center justify-start gap-3">
      <img src={PlayerData.profilePic} className="size-8 rounded-full" />
      <div className="flex flex-col items-start">
        <div className="font-semibold">{PlayerData.name}</div>
        <div className="flex text-xs">
          {allMoves
            .slice()
            .filter((move) => move.color === playerColor && move.captured)
            .sort((a, b) => {
              const capturedA = a.captured ?? "";
              const capturedB = b.captured ?? "";
              return (
                (pieceOrder[capturedA] || 99) - (pieceOrder[capturedB] || 99)
              );
            })
            .map((move, index) => {
              return (
                move?.captured && (
                  <div key={index}>
                    {
                      <img
                        className="size-4"
                        src={
                          pieceMapping[
                            (move?.captured +
                              opponentColor) as keyof typeof pieceMapping
                          ]
                        }
                        alt={"pieces"}
                      />
                    }
                  </div>
                )
              );
            })}
        </div>
      </div>
      {allMoves.at(-1)?.color !== playerColor && startAbortTimer && (
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold">Auto Resign in : </div>
          <div className="text-xs font-semibold">{abortTimer / 1000}</div>
        </div>
      )}
      <div className="ml-64 p-1 px-3 bg-black bg-opacity-25 hover:scale-105 transition-all duration-300 rounded-md">
      {playerTime}
      </div>
    </div>
  );
};

export default PlayerLabel;
