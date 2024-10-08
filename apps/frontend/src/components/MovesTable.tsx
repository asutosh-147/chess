import { movesAtomState, selectedMoveIndexAtom } from "@repo/store/chessBoard";
import { useEffect, useRef } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import "../index.css";
import { Move } from "chess.js";
import { pieceMapping } from "@/utils/pieceMapping";
const MovesTable = () => {
  const [allMoves, setAllMoves] = useRecoilState(movesAtomState);
  const [selectedMoveIndex,setSelectedMoveIndex] = useRecoilState(selectedMoveIndexAtom);
  const movePairs: Move[][] = allMoves.reduce((acc, _, index, arr) => {
    if (index % 2 === 0) {
      acc.push(arr.slice(index, index + 2));
    }
    return acc;
  }, [] as Move[][]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMoves]);
  return (
    <>
      <div className="w-full mt-1 font-light">
        <div
          ref={scrollRef}
          className="overflow-y-auto scroll-smooth scrollbar-custom h-72 rounded-br-lg border-b-gray-100 pb-4 "
        >
          {movePairs.map((movepair, index, arr) => {
            const moveNumber = index;
            return (
              <div
                key={index}
                className={` ${index % 2 == 0 ? "" : "bg-stone-600"} text-gray-200 pl-2 ${index == arr.length - 1 ? "rounded-b-md" : ""}`}
              >
                <div className="flex gap-12 py-1 items-center">
                  <span className="w-5 text-center font-medium">
                    {moveNumber + 1}.
                  </span>
                  <span className="font-semibold flex justify-between gap-32 py-1">
                    {movepair.map((move, pairIndex, pairArr) => {
                      const isLastMoveMade =
                        index === arr.length - 1 &&
                        pairIndex === pairArr.length - 1;
                      const isHighLightedMove = selectedMoveIndex!==null ? moveNumber * 2 + pairIndex === selectedMoveIndex : isLastMoveMade;
                      return (
                        <span key={pairIndex} className="w-12 text-left" onClick={()=>{
                          setSelectedMoveIndex(moveNumber * 2 + pairIndex);
                        }}>
                          <button
                            className={`p-1 flex justify-center hover:cursor-pointer hover:bg-white hover:bg-opacity-15 hover:rounded-md hover:border-b-1 items-center gap-1 ${isHighLightedMove ? "bg-white bg-opacity-15 rounded-md border-b-2" : ""}`}
                          >
                            <span className="text-sm">
                              {
                                <img
                                className="size-4"
                                  src={
                                    pieceMapping[
                                      (move.piece +
                                        "w") as keyof typeof pieceMapping
                                    ]
                                  }
                                  alt=""
                                />
                              }
                            </span>
                            {move.to}
                          </button>
                        </span>
                      );
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MovesTable;
