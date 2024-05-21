import { movesAtomState } from "@repo/store/chessBoard";
import { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import "../index.css";
const MovesTable = () => {
  const [allMoves, setAllMoves] = useRecoilState(movesAtomState);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [allMoves]);
  return (
    <>
      <div className="w-full mt-1 font-light">
        <div className="text-lg flexfont-bold border-b-2 pl-24 space-x-[5.5rem] sticky top-0 bg-stone-800 rounded-t-md">
          <span>From</span>
          <span>To</span>
        </div>
        <div
          ref={scrollRef}
          className="overflow-y-scroll scroll-smooth scrollbar-custom h-[30rem] rounded-br-lg"
        >
          {allMoves.map((move, index, arr) => (
            <div
              key={index}
              className={` ${index % 2 == 0 ? "" : "bg-stone-700"} text-gray-200 pl-2`}
            >
              <div className="flex gap-14 border-gray-200">
                <span className="w-5 text-center">{index + 1}.</span>
                <span className="space-x-10 font-semibold flex justify-between gap-5">
                  <span className="w-16 text-center">{move.from}</span>
                  <span className="w-16 text-center">{move.to}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MovesTable;
