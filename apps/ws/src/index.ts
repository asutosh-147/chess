import { WebSocketServer } from "ws";
import { GameManager } from "./GameManager";
import url from "url";
import { decodeTokenUserId } from "./auth/auth";
import { User } from "./UserSocketManager";
const wss = new WebSocketServer({ port: 8080 });
export const gameManager = new GameManager();

wss.on("connection", function connection(ws, req) {
  const token = url.parse(req.url as string, true).query.token;
  const userId = decodeTokenUserId(token as string);
  console.log("new user joining");
  gameManager.addUser(new User(userId as string, ws));
  ws.on("close", () => {
    console.log("user disconnected");
    gameManager.removeUser(ws);
  });
});
