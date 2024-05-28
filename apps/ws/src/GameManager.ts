import WebSocket from "ws";
import {
  ADDED_GAME,
  CREATE_ROOM,
  DELETE_ROOM,
  GAME_ALERT,
  INIT_GAME,
  JOIN_GAME,
  MOVE,
  RESIGN,
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
    
    //if it has created a room and then exited
    const game = this.games.find(game => game.player1UserId === user.userId);
    if(game && game.player2UserId === null && this.pendingGameId != game.gameId){
        this.removeGame(game.gameId);
    }

    //if it has pending game
    if (this.pendingGameId) {
      const game = this.games.find(
        (game) => game.gameId === this.pendingGameId
      );
      if (game && game.player1UserId === user.userId) {
        console.log("user going out");
        this.removeGame(game.gameId);
        this.pendingGameId = null;
        return;
      }
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

      if (message.type === CREATE_ROOM) {
        const availableGame = this.games.find(
          (game) =>
            game.player1UserId === user.userId ||
            game.player2UserId === user.userId
        );
        if (availableGame) {
          this.joinGame(availableGame.gameId, user);
          return;
        }
        const game = new Game(user.userId, null);
        this.games.push(game);
        SocketManager.getInstance().addUserToMapping(game.gameId, user);
        socket.send(
          JSON.stringify({
            type: CREATE_ROOM,
            payload: {
              gameId: game.gameId,
              message: "waiting for other player to join!!!",
            },
          })
        );
      }

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

      if (message.type === RESIGN) {
        const { gameId } = message.payload;
        const game = this.games.find((game) => game.gameId === gameId);
        if (game && game.status === "IN_PROGRESS") {
          if (game.player1UserId === user.userId) {
            game.endGame("COMPLETED", "BLACK_WINS", "White Resigns");
          } else if (game.player2UserId === user.userId) {
            game.endGame("COMPLETED", "WHITE_WINS", "Black Resigns");
          }
        }
      }
      if (message.type === DELETE_ROOM) {
        const availGame = this.games.find(
          (game) => game.player1UserId === user.userId
        );
        if (!availGame) {
          socket.send(
            JSON.stringify({
              type: GAME_ALERT,
              payload: {
                message: "GAME NOT FOUND",
              },
            })
          );
        } else {
          this.games = this.games.filter(
            (game) => game.gameId !== availGame?.gameId
          );
          socket.send(
            JSON.stringify({
              type: DELETE_ROOM,
              payload: {
                message: "game deleted",
              },
            })
          );
        }
      }
    });
  }
  private async joinGame(gameId: string, user: User) {
    const socket = user.socket;
    let availableGame = this.games.find((game) => game.gameId === gameId);
    if(availableGame && availableGame.player2UserId && availableGame.player1UserId !== user.userId && availableGame.player2UserId !== user.userId){
      user.socket.send(JSON.stringify({
        type:GAME_ALERT,
        payload:{
          message:"permission denied"
        }
      }))
      return;
    }
    SocketManager.getInstance().addUserToMapping(gameId, user);
    if (
      availableGame &&
      availableGame.player1UserId != user.userId &&
      availableGame.player2UserId === null
    ) {
      availableGame.addP2ToGame(user.userId);
      return;
    }
    if (
      availableGame &&
      availableGame.player1UserId === user.userId &&
      availableGame.player2UserId === null &&
      this.pendingGameId !== availableGame.gameId
    ) {
      user.socket.send(
        JSON.stringify({
          type: CREATE_ROOM,
          payload: {
            gameId,
            message: "room already created",
          },
        })
      );
      return;
    }
    if (
      availableGame &&
      availableGame.player1UserId === user.userId &&
      availableGame.player2UserId === null
    ) {
      console.log("game already in queue");
      user.socket.send(
        JSON.stringify({
          type: GAME_ALERT,
          payload: {
            gameId,
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
          by: gameInDb.by,
          blackPlayer: gameInDb.blackPlayer,
          whitePlayer: gameInDb.whitePlayer,
        },
      })
    );
  }
}
