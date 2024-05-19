import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
import url from 'url';
import { decodeTokenUserId } from './auth/auth';
import { User } from './UserSocketManager';
const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager();

console.log("niga man ssup ");

wss.on('connection', function connection(ws,req) {
    const token = url.parse(req.url as string, true).query.token;
    const userId = decodeTokenUserId(token as string);
    gameManager.addUser(new User(userId as string,ws))
    ws.on('disconnect',()=> gameManager.removeUser(ws))
});