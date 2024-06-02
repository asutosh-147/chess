import React, { useState } from "react";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import Button from "../ui/Button";
import { GrHelp } from "react-icons/gr";
import { VscColorMode } from "react-icons/vsc";
import { FaChess } from "react-icons/fa";
import IconButton from "@/components/ui/IconButton";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@repo/store/useUser";
import Settings from "./Settings";
import { FaChessBoard } from "react-icons/fa";
import { SiLichess } from "react-icons/si";
const Sidebar = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [openSettings, setOpenSettings] = useState(false);
  return (
    <div className="flex flex-col gap-2 p-4 justify-between shadow-sm bg-stone-900 h-full w-40 z-[3]">
      <div className="flex flex-col gap-4">
        <Link
          to={"/"}
          className="text-[#fff3df] text-6xl flex justify-center items-center my-4 border-b-gray-100 border-b-[1px] border-opacity-50 pb-4"
        >
          <FaChess />
        </Link>
        <Button
          onClick={() => navigate("/play/start")}
          className="rounded-sm hover:bg-black hover:text-white shadow-sm p-1 text-black font-bold hover:animate-pulse text-lg flex justify-center items-center gap-2"
        >
          Play <FaChessBoard className="text-lg" />
        </Button>
        {user && (
          <Button
            onClick={() => navigate(`/profile/${user.id}`)}
            className="rounded-sm hover:bg-black hover:text-white shadow-sm p-1 text-black font-bold text-lg flex justify-center items-center gap-2"
          >
            Profile <SiLichess className="text-lg" />
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-5 ">
        {user ? (
          <Button
            onClick={() =>
              window.open(
                `${import.meta.env.VITE_APP_BACKEND_URL}/auth/logout`,
                "_self"
              )
            }
            className=" flex gap-2 flex-row items-center justify-center rounded-sm hover:bg-black transition-colors duration-300 hover:shadow-sm text-sm hover:text-white font-semibold"
          >
            <span>Logout</span>
            <FiLogOut />
          </Button>
        ) : (
          <Button
            onClick={() => navigate("/login")}
            className=" flex gap-2 flex-row items-center justify-center rounded-sm hover:bg-black transition-colors duration-300 hover:shadow-sm text-sm hover:text-white font-semibold"
          >
            <span>Login</span>
            <FiLogIn />
          </Button>
        )}
        <div className="flex justify-between items-center">
          <div
            onMouseEnter={() => setOpenSettings(true)}
            onMouseLeave={() => setOpenSettings(false)}
            // className="hover:-rotate-45"
            className="relative"
          >
            {openSettings && <Settings />}
            <IconButton className="hover:-rotate-45">
              <IoMdSettings />
            </IconButton>
          </div>
          <IconButton className="hover:rotate-45">
            <VscColorMode />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
