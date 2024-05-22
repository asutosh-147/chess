import React from "react";
import { FiLogOut } from "react-icons/fi";
import { IoMdSettings } from "react-icons/io";
import Button from "../ui/Button";
import { GrHelp } from "react-icons/gr";
import { VscColorMode } from "react-icons/vsc";
import { FaChess } from "react-icons/fa";
import IconButton from "@/components/ui/IconButton";
import { Link } from "react-router-dom";
const Sidebar = () => {
  return (
    <div className="flex flex-col gap-2 p-4 justify-between shadow-sm bg-stone-900 h-full w-40 z-[3]">
      <div className="flex flex-col">
        <Link to={'/'} className="text-white text-6xl flex justify-center items-center my-4 border-b-gray-100 border-b-[1px] border-opacity-50 pb-4">
          <FaChess />
        </Link>
        <Button className="rounded-sm shadow-sm p-1 text-black font-bold hover:animate-pulse text-lg">
          Play
        </Button>
      </div>
      <div className="flex flex-col gap-5 ">
        <Button className=" flex gap-2 flex-row items-center justify-center rounded-sm hover:bg-black transition-colors duration-300 hover:shadow-sm text-sm hover:text-white font-semibold">
          <FiLogOut />
          <span>Logout</span>
        </Button>
        <div className="flex justify-between items-center">
          <IconButton className="hover:-rotate-45">
            <IoMdSettings />
          </IconButton>
          <IconButton>
            <GrHelp />
          </IconButton>
          <IconButton className="hover:rotate-45">
            <VscColorMode />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
