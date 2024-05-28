import React, { useEffect, useState } from "react";
import Button from "./ui/Button";
import { useNavigate } from "react-router-dom";
import { FaChessQueen } from "react-icons/fa";
import { Result, GameStatus } from "@repo/utils/messages";
import { RxCross2 } from "react-icons/rx";
import { gameEndResult } from "@/pages/Game";
type Props = {
  gameData: {
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
  gameResult: gameEndResult;
};

const GameEndModal = ({ gameData, gameResult }: Props) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const handleCLick = () => {
    navigate("/");
  };
  const handleClose = () => {
    setIsOpen(false);
  };
  return (
    <>
      {isOpen && (
        <div className="fixed z-[1] bg-black bg-opacity-40 flex flex-col justify-center h-screen w-full ">
          <div className="bg-stone-900 rounded-lg shadow-2xl flex flex-col items-center p-6 w-96 gap-5 mx-auto relative">
            <button onClick={handleClose} className="absolute top-3 right-3">
              <RxCross2 className="text-xl font-bold" />
            </button>
            <div className="w-full border-b-2 border-b-gray-50 border-opacity-[0.2] text-center pb-2">
              <div className="font-extrabold text-xl">
                {gameResult.result === "DRAW"
                  ? "It's a Draw"
                  : gameResult.result === "WHITE_WINS"
                    ? "White Wins"
                    : "Black Wins"}
              </div>
              {gameResult.by ? (
                <div className="mt-2 font-medium">by {gameResult.by}</div>
              ) : (
                <></>
              )}
            </div>
            <div className="flex justify-evenly items-center gap-8 w-full px-2 mt-2">
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  {gameResult.result === "WHITE_WINS" && (
                    <FaChessQueen className="text-md text-green-500 absolute -top-5 left-6 animate-bounce" />
                  )}
                  <img
                    src={gameData.whitePlayer.profilePic}
                    alt=""
                    className={`size-16 rounded-md shadow-md ${gameResult.result === "WHITE_WINS" ? "border-green-500" : "border-gray-100"} border-4`}
                  />
                </div>
                <div className="font-medium">
                  {gameData.whitePlayer.name.split(" ")[0]}
                </div>
              </div>
              <div className="font-medium">Vs</div>
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  {gameResult.result === "BLACK_WINS" && (
                    <FaChessQueen className="text-md text-green-500 absolute -top-5 left-6 animate-bounce" />
                  )}
                  <img
                    src={gameData.blackPlayer.profilePic}
                    alt=""
                    className={`size-16 rounded-md shadow-md ${gameResult.result === "BLACK_WINS" ? "border-green-500" : "border-gray-100"} border-4`}
                  />
                  <div className="font-medium">
                    {gameData.blackPlayer.name.split(" ")[0]}
                  </div>
                </div>
              </div>
            </div>
            <Button className="font-bold" onClick={handleCLick}>
              New Game
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default GameEndModal;
