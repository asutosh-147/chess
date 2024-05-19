import { useUser } from "@repo/store/useUser";
import { useEffect, useState } from "react"

const WS_URL = import.meta.env.VITE_APP_WS_URL || "ws://localhost:8080";

export const useSocket = () => {
    const [socket, setSocket] = useState< WebSocket | null >(null);
    const user = useUser();
    useEffect(() => {
        if(!user) return;
        const ws = new WebSocket(`${WS_URL}?token=${user.token}`);
        ws.onopen = () => {
            console.log("Connected to server");
            setSocket(ws);
        }
        ws.onclose = () => {
            console.log("Disconnected from server");
            setSocket(null);
        }
        return () => {
            ws.close();
        }
    }, []);
    return socket;
}
