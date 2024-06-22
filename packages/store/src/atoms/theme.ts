import { atom } from "recoil";

export const themeMapping = {
  brown: {
    black: "#b88762",
    white: "#edd6b0",
  },
  neo: {
    black: "#739552",
    white: "#e8e9ce",
  },
  gray: {
    black: "#6b7280",
    white: "#d1d5db",
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
