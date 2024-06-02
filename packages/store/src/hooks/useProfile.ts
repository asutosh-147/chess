import { useRecoilValue } from "recoil";
import { userProfileAtom } from "../atoms/user";

export const useProfile = () =>{
    const userProfileData = useRecoilValue(userProfileAtom);
    return userProfileData;
}