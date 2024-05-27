import { atom, selector } from "recoil";
const BACKEND_URL = "http://ec2-65-0-93-72.ap-south-1.compute.amazonaws.com:3000";

export type User = {
  token: string;
  id: string;
  name: string;
  profilePic: string;
};

export const userAtom = atom<User>({
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
