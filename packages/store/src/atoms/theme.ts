import { atom } from "recoil";

export const themeMapping = {
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

export const themeAtom = atom<"light" | "dark">({
  key: "theme",
  default: "dark",
});
export const boardThemeAtom = atom<"brown" | "neo" | "gray">({
  key: "boardThemeatom",
  default: "brown",
});
