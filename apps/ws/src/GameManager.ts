import WebSocket from "ws";
import {
  ADDED_GAME,
  GAME_ALERT,
  INIT_GAME,
  JOIN_GAME,
  MOVE,
} from "@repo/utils/index";
import { Game } from "./Game";
import { SocketManager, User } from "./UserSocketManager";
import { db } from "./db";
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
  removeUser(socket: WebSocket) {
    this.users.filter((user) => user.socket !== socket);
  }

  removeGame(game: Game) {
    this.games = this.games.filter((g) => g.gameId !== game.gameId);
  }
  private addHandler(user: User) {
    const socket = user.socket;
    socket.on("message", async (data) => {
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
        const game = this.games.find(
          (game) =>
            game.player1UserId === user.userId ||
            game.player2UserId === user.userId
        );
        if (!game) {
          console.error("Game not found");
          return;
        }
        game.makeMove(user, message.payload.move);
      }

      if (message.type === JOIN_GAME) {
        const { gameId } = message.payload;
        console.log("join game req initialised")
        const availableGame = this.games.find((game) => game.gameId === gameId);
        const gameInDb = await db.game.findUnique({
          where: {
            id: gameId,
          },
          include: {
            moves: {
              orderBy: {
                moveNumber: "asc",
              },
            },
            blackPlayer: true,
            whitePlayer: true,
          },
        });
        if (!gameInDb) {
          socket.send(
            JSON.stringify({
              type: GAME_ALERT,
              payload: {
                message: "Game not found",
              },
            })
          );
          return;
        }
        if (!availableGame) {
          const game = new Game(gameInDb.whitePlayerId,gameInDb.blackPlayerId, gameId);
          gameInDb.moves.forEach((move)=>game.board.move(move));
          game.moveCount = gameInDb.moves.length;
          this.games.push(game);
        }
        
        SocketManager.getInstance().addUserToMapping(gameId, user);
        socket.send(
          JSON.stringify({
            type: JOIN_GAME,
            payload: {
              gameId,
              moves: gameInDb.moves,
              blackPlayer: gameInDb.blackPlayer,
              whitePlayer: gameInDb.whitePlayer,
            },
          })
        );
      }
    });
  }
}
