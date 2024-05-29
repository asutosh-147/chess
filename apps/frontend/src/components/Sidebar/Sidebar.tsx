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
const Sidebar = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [openSettings, setOpenSettings] = useState(false);
  return (
    <div className="flex flex-col gap-2 p-4 justify-between shadow-sm bg-stone-900 h-full w-40 z-[3]">
      <div className="flex flex-col">
        <Link
          to={"/"}
          className="text-[#fff3df] text-6xl flex justify-center items-center my-4 border-b-gray-100 border-b-[1px] border-opacity-50 pb-4"
        >
          <FaChess />
        </Link>
        <Button
          onClick={() => navigate("/play/start")}
          className="rounded-sm shadow-sm p-1 text-black font-bold hover:animate-pulse text-lg"
        >
          Play
        </Button>
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
            <FiLogOut />
            <span>Logout</span>
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
