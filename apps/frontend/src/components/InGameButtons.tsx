import { GrFlagFill } from "react-icons/gr";
import { IoChevronBack } from "react-icons/io5";
import Button from "./ui/Button";
import { RESIGN } from "@repo/utils/messages";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { ImRadioUnchecked } from "react-icons/im";
import { useRecoilState, useRecoilValue } from "recoil";
import { movesAtomState, selectedMoveIndexAtom } from "@repo/store/chessBoard";

type Props = {
  socket: WebSocket;
  gameId: string;
};

const InGameButtons = ({ socket, gameId }: Props) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedMoveIndex,setSelectedMoveIndex] = useRecoilState(selectedMoveIndexAtom);
  const moves = useRecoilValue(movesAtomState);
  const handleResign = () => {
    socket.send(
      JSON.stringify({
        type: RESIGN,
        payload: {
          gameId,
          message: "player resigns",
        },
      })
    );
  };
  const handleMoveBack = () => {
    if (selectedMoveIndex === null) {
      setSelectedMoveIndex(moves.length - 2);
    } 
    else if(selectedMoveIndex === 0){
      setSelectedMoveIndex(moves.length - 1);
    }
    else {
      setSelectedMoveIndex(selectedMoveIndex - 1);
    }
  }
  const hanldeMoveForward = () => {
    if (selectedMoveIndex === null || selectedMoveIndex == moves.length - 1) {
      setSelectedMoveIndex(0);
    } else {
      setSelectedMoveIndex(selectedMoveIndex + 1);
    }
  }
  // const handleMoveBack = () => {
    
  // }
  // const hanldeMoveForward = () => {
    
  // }
  return (
    <div className="flex w-full justify-around mt-2">
      <div
        onMouseEnter={() => setShowConfirm(true)}
        onMouseLeave={() => setShowConfirm(false)}
        className="font-light bg-stone-800 size-16 flex justify-center items-center hover:bg-stone-950 relative rounded-lg shadow-lg"
      >
        {showConfirm && (
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 space-x-2 bg-dark-main flex flex-col items-center gap-3 rounded-md text-white p-2 transition-opacity ">
            <div className="font-semibold">Resign?</div>
            <div className="flex justify-between gap-3">
              <Button
                onClick={handleResign}
                className="text-white bg-stone-600 size-12 flex justify-center items-center hover:bg-stone-800"
              >
                <FaCheck />
              </Button>
              <Button
                onClick={() => setShowConfirm(false)}
                className="text-white bg-gray-600 size-12 flex justify-center items-center hover:bg-stone-800"
              >
                <ImRadioUnchecked />
              </Button>
            </div>
          </div>
        )}
        <GrFlagFill className="-rotate-45 text-white" />
      </div>
      <Button onClick={handleMoveBack} className="font-light bg-stone-800 size-16 flex justify-center items-center hover:bg-stone-950">
        <IoChevronBack className=" text-white" />
      </Button>
      <Button onClick={hanldeMoveForward} className="font-light bg-stone-800 size-16 rotate-180 flex justify-center items-center hover:bg-stone-950">
        <IoChevronBack className=" text-white" />
      </Button>
    </div>
  );
};

export default InGameButtons;
