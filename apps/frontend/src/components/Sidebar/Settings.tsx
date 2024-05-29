import React from "react";
import Dropdown from "./Dropdown";
import { useRecoilState } from "recoil";
import { boardThemeAtom } from "@repo/store/theme";
const themeMapping = {
  brown: {
    black: "bg-blackSquare-brown",
    white: "bg-whiteSquare-brown",
  },
  neo: {
    black: "bg-green-main",
    white: "bg-tan-main",
  },
  gray: {
    black: "bg-gray-700",
    white: "bg-gray-500",
  },
};
const Settings = () => {
  const [boardTheme, setBoardTheme] = useRecoilState(boardThemeAtom);
  const arr: number[][] = [
    [1, 2],
    [4, 5],
  ];
  const handleThemeChange = (theme: typeof boardTheme) => {
    setBoardTheme(theme);
  };
  return (
    <div className="absolute  bg-black bg-opacity-25 p-2 -top-20 -right-56 rounded-lg">
      <div className="flex gap-2 justify-between items-center">
        <div>
          <div className="dropdown dropdown-hover dropdown-top">
            <div tabIndex={0} role="button" className="btn no-animation  m-1">
              Board Theme
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-stone-800 rounded-box space-y-2 border-b-[1]"
            >
              <button className="btn" onClick={() => handleThemeChange("brown")}>
                Brown
              </button>
              <button className="btn" onClick={() => handleThemeChange("neo")}>
                Neo
              </button>
              <button className="btn" onClick={() => handleThemeChange("gray")}>
                Gray
              </button>
            </ul>
          </div>
        </div>
        <div className="flex flex-col">
          {arr.map((row, i) => {
            return (
              <div className="flex">
                {row.map((_, j) => {
                  const isBlackSquare = (i + j) % 2;
                  return (
                    <div
                      className={`size-10 ${isBlackSquare ? themeMapping[boardTheme].black : themeMapping[boardTheme].white}`}
                    ></div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default Settings;
