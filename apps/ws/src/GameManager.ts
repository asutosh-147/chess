import WebSocket from "ws";
import { ADDED_GAME, GAME_ALERT, INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";
import { SocketManager, User } from "./UserSocketManager";
export class GameManager {
  private games: Game[];
  private users: User[];
  private pendingGameId: string | null;
  constructor() {
    this.games = [];
    this.users = [];
    this.pendingGameId = null;
  }

  addUser(user: User) {
    this.users.push(user);
    this.addHandler(user);
  }
  removeUser(socket:WebSocket) {
    this.users.filter( user => user.socket !== socket);
  }

  removeGame(game: Game) {
    this.games = this.games.filter((g) => g.gameId !== game.gameId);
  }
  private addHandler(user: User) {
    const socket = user.socket;
    socket.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === INIT_GAME) {
        if (this.pendingGameId) {
          const game = this.games.find(
            (game) => game.gameId === this.pendingGameId
          );
          if (!game) {
            console.error("Pending Game not found");
            return;
          }
          if (this.pendingGameId === game.player1UserId) {
            SocketManager.getInstance().broadcastMessage(
              game.gameId,
              JSON.stringify({
                type: GAME_ALERT,
                payload: {
                  message: "Can't play with yourself xD",
                },
              })
            );
            return;
          }
          SocketManager.getInstance().addUserToMapping(game.gameId, user);
          game.addP2ToGame(user.userId);
          this.pendingGameId = null;
        } else {
          const game = new Game(user.userId, null);
          this.games.push(game);
          this.pendingGameId = game.gameId;
          SocketManager.getInstance().addUserToMapping(game.gameId, user);
          SocketManager.getInstance().broadcastMessage(
            game.gameId,
            JSON.stringify({
              type: ADDED_GAME,
            })
          );
        }
      }

      if (message.type === MOVE) {
        const game = this.games.find(game =>
            game.player1UserId === user.userId || game.player2UserId === user.userId    
        )
        if(!game){
            console.error("Game not found")
            return;
        }
        game.makeMove(user, message.payload.move);
      }
    });
  }
}
