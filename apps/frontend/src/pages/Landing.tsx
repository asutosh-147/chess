import { FaChessPawn } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full flex justify-center mt-32">
      <div className="grid grid-cols-1 md:grid-cols-2 w-800 gap-5 justify-items-center items-center">
        <div className="self-center">
          <img
            src="/chessboard.png"
            alt="chessboard"
            className="rounded-xl shadow-2xl"
          />
        </div>
        <div className="flex flex-col items-center gap-6">
          <h1 className=" text-xl md:text-3xl font-bold text-center">
            Play Chess Online On World's #3 Site
          </h1>
          <Button
            onClick={() => {
              navigate("/play/start");
            }}
            className="font-bold flex justify-center items-center gap-2"
          >
            <div className=" text-xl md:text-3xl">
              <FaChessPawn />
            </div>
            Play Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
