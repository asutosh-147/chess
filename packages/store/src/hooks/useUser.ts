import { useRecoilValue } from "recoil";
import { userAtom } from "../atoms/user";

export const useUser = () => {
    const atomValue = useRecoilValue(userAtom);
    return atomValue;
}