import React, { useState } from "react";
import { FiLogIn, FiLogOut } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import Button from "../ui/Button";
import { VscColorMode } from "react-icons/vsc";
import { FaChess } from "react-icons/fa";
import IconButton from "@/components/ui/IconButton";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@repo/store/useUser";
import Settings from "./Settings";
import { FaChessBoard } from "react-icons/fa";
import { SiLichess } from "react-icons/si";
import { useRecoilState } from "recoil";
import { themeAtom } from "@repo/store/theme";
const Sidebar = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [openSettings, setOpenSettings] = useState(false);
  const [theme, setTheme] = useRecoilState(themeAtom);
  const handleThemeChange = () => {
    if (theme == "dark") setTheme("light");
    else setTheme("dark");
  };
  return (
    <div className="z-[3] flex h-full w-40 flex-col justify-between gap-2 bg-stone-900 p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <Link
          to={"/"}
          className="my-4 flex items-center justify-center border-b-[1px] border-b-gray-100 border-opacity-50 pb-4 text-6xl text-[#fff3df]"
        >
          <FaChess />
        </Link>
        {/* <Button
          onClick={() => navigate("/play/start")}
          className="flex items-center justify-center gap-2 rounded-sm p-1 text-lg font-bold text-black shadow-sm hover:animate-pulse hover:bg-black hover:text-white"
        >
          Play <FaChessBoard className="text-lg" />
        </Button> */}
        {user && (
          <Button
            onClick={() => navigate(`/profile/${user.id}`)}
            className="flex items-center justify-center gap-2 rounded-sm p-1 text-lg font-bold text-black shadow-sm hover:bg-black hover:text-white"
          >
            Profile <SiLichess className="text-lg" />
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-5">
        {user ? (
          <Button
            onClick={() =>
              window.open(
                `${import.meta.env.VITE_APP_BACKEND_URL}/auth/logout`,
                "_self",
              )
            }
            className="flex flex-row items-center justify-center gap-2 rounded-sm text-sm font-semibold transition-colors duration-300 hover:bg-black hover:text-white hover:shadow-sm"
          >
            <span>Logout</span>
            <FiLogOut />
          </Button>
        ) : (
          <Button
            onClick={() => navigate("/login")}
            className="flex flex-row items-center justify-center gap-2 rounded-sm text-sm font-semibold transition-colors duration-300 hover:bg-black hover:text-white hover:shadow-sm"
          >
            <span>Login</span>
            <FiLogIn />
          </Button>
        )}
        <div className="flex items-center justify-between">
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
          <IconButton onClick={handleThemeChange} className="hover:rotate-45">
            <VscColorMode />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
