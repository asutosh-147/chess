import { atom, selector } from "recoil";

const BACKEND_URL =
  "http://ec2-13-234-20-33.ap-south-1.compute.amazonaws.com:3000";
import { User, Game } from "@prisma/client";


export type AuthUser = {
  token: string;
  id: string;
  name: string;
  profilePic: string;
};
type newGame = Game & {
  whitePlayer: {
    name: string;
  };
  blackPlayer: {
    name: string;
  };
  _count: {
    moves: number;
  };
};
type UserProfile = User & {
  games: newGame[];
};
export const userAtom = atom<AuthUser>({
  key: "user",
  default: selector({
    key: "user/default",
    get: async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (error) {
        console.error("Error fetching user token", error);
      }
      return null;
    },
  }),
});

export const userProfileAtom = atom<UserProfile>({
  key: "userProfile",
  default: selector({
    key: "userProfile/default",
    get: async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          return data;
        }
      } catch (error) {
        console.log("error in fetching profile", error);
      }
      return null;
    },
  }),
});
