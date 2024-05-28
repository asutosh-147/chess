import { GrFlagFill } from "react-icons/gr";
import { IoChevronBack } from "react-icons/io5";
import Button from "./ui/Button";
import { RESIGN } from "@repo/utils/messages";
import { useState } from "react";
import { FaCheck } from "react-icons/fa";
import { ImRadioUnchecked } from "react-icons/im";

type Props = {
  socket: WebSocket;
  gameId: string;
};

const InGameButtons = ({ socket, gameId }: Props) => {
  const [showConfirm, setShowConfirm] = useState(false);
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
  return (
    <div className="flex w-full justify-around mt-2">
      <Button
        onMouseEnter={() => setShowConfirm(true)}
        onMouseLeave={() => setShowConfirm(false)}
        className="font-light bg-stone-800 size-16 flex justify-center items-center hover:bg-stone-950 relative"
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
      </Button>
      <Button className="font-light bg-stone-800 size-16 flex justify-center items-center hover:bg-stone-950">
        <IoChevronBack className=" text-white" />
      </Button>
      <Button className="font-light bg-stone-800 size-16 rotate-180 flex justify-center items-center hover:bg-stone-950">
        <IoChevronBack className=" text-white" />
      </Button>
    </div>
  );
};

export default InGameButtons;
