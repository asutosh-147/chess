import { movesAtomState } from "@repo/store/chessBoard";
import React from "react";
import { useRecoilValue } from "recoil";
import { iconPieceMapping, pieceMapping } from "@/utils/pieceMapping";
type Props = {
  PlayerData: {
    id: string;
    name: string;
    profilePic: string;
  };
  playerColor: string;
};
const PlayerLabel = ({ PlayerData, playerColor }: Props) => {
  const allMoves = useRecoilValue(movesAtomState);
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
    <div className="flex gap-3 justify-start items-center my-3">
      <img src={PlayerData.profilePic} className="rounded-full size-8" />
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
              console.log(move.color, "captured : ", move?.captured);
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
    </div>
  );
};

export default PlayerLabel;
