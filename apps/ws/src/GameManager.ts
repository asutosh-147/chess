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
    const user = this.users.find((user) => user.socket === socket);
    if (!user) {
      console.error("User not found?");
      return;
    }
    this.users.filter((user) => user.socket !== socket);

    if (this.pendingGameId === user.userId) {
      this.pendingGameId = null;
    }
    SocketManager.getInstance().removeUser(user.userId);
  }

  removeGame(gameId: string) {
    const game = this.games.find((game) => game.gameId === gameId);
    if (!game) {
      console.error("Game not found?");
      return;
    }
    this.games = this.games.filter((game) => game.gameId !== gameId);
    SocketManager.getInstance().removeUser(game.player1UserId);
    SocketManager.getInstance().removeUser(game.player2UserId ?? "");
    console.log("game removed successfully");
  }
  private addHandler(user: User) {
    const socket = user.socket;
    socket.on("message", async (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === INIT_GAME) {
        const availableGame = this.games.find(
          (game) =>
            game.player1UserId === user.userId ||
            game.player2UserId === user.userId
        );
        if (availableGame) {
          this.joinGame(availableGame.gameId, user);
          return;
        }
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
        // const game = this.games.find(
        //   (game) =>
        //     game.player1UserId === user.userId ||
        //     game.player2UserId === user.userId
        // );
        const game = this.games.find(
          (game) => game.gameId === message.payload.gameId
        );
        if (!game) {
          console.error("Game not found");
          return;
        }
        game.makeMove(user, message.payload.move);
      }

      if (message.type === JOIN_GAME) {
        const { gameId } = message.payload;
        console.log("join game req initialised");
        this.joinGame(gameId, user);
      }
    });
  }
  private async joinGame(gameId: string, user: User) {
    const socket = user.socket;
    SocketManager.getInstance().addUserToMapping(gameId, user);
    let availableGame = this.games.find((game) => game.gameId === gameId);
    if (
      availableGame &&
      availableGame.player1UserId === user.userId &&
      availableGame.player2UserId === null
    ) {
      console.log("game already in queue")
      user.socket.send(
        JSON.stringify({
          type: GAME_ALERT,
          payload: {
            message: "already in queue",
          },
        })
      );
      return;
    }
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
    if (!availableGame && gameInDb.status === "IN_PROGRESS") {
      const game = new Game(
        gameInDb.whitePlayerId,
        gameInDb.blackPlayerId,
        gameId
      );
      game.seedAllMoves(gameInDb.moves);
      this.games.push(game);
      availableGame = game;
    }

    socket.send(
      JSON.stringify({
        type: JOIN_GAME,
        payload: {
          gameId,
          moves: gameInDb.moves,
          result: gameInDb.result,
          status: gameInDb.status,
          blackPlayer: gameInDb.blackPlayer,
          whitePlayer: gameInDb.whitePlayer,
        },
      })
    );
  }
}
