import { WebSocket } from "ws";
import { Chess, Move } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";
import { randomUUID } from "crypto";
import { db } from "./db";
import { SocketManager, User } from "./UserSocketManager";
type Result = "WHITE_WINS" | "BLACK_WINS" | "DRAW";
type GameStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED" | "TIME_UP";
export class Game {
  public gameId: string;
  public player1UserId: string;
  public player2UserId: string | null;
  public board: Chess;
  private startTime: Date;
  private moveCount: number;

  constructor(
    p1UserId: string,
    p2UserId: string | null,
    gameId?: string,
    startTime?: Date
  ) {
    this.gameId = gameId ?? randomUUID();
    this.player1UserId = p1UserId;
    this.player2UserId = p2UserId;
    this.board = new Chess();
    this.startTime = startTime ?? new Date();
    this.moveCount = 0;
  }

  async addP2ToGame(p2UserId: string) {
    this.player2UserId = p2UserId;

    try {
      await this.addGameToDB();
    } catch (error) {
      console.log("error adding game in db :", error);
    }

    const users = await db.user.findMany({
      where: {
        id: {
          in: [this.player1UserId, this.player2UserId ?? ""],
        },
      },
    });

    SocketManager.getInstance().broadcastMessage(
      this.gameId,
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          roomId: this.gameId,
          whitePlayer: {
            name: users.find((user) => user.id === this.player1UserId)?.name,
            profilePic: users.find((user) => user.id === this.player1UserId)?.profilePic,
            id: this.player1UserId,
          },
          blackPlayer: {
            name: users.find((user) => user.id === this.player2UserId)?.name,
            profilePic: users.find((user) => user.id === this.player2UserId)?.profilePic,
            id: this.player2UserId,
          },
          fen: this.board.fen(),
        },
      })
    );
  }

  async makeMove(user: User, move: Move) {
    //validation
    const { from, to } = move;
    console.log("inside make move");
    console.log("board move number:", this.moveCount);
    if (this.moveCount % 2 === 0 && user.userId !== this.player1UserId) {
      console.log("player2 moved instead of player1");
      return;
    } else if (this.moveCount % 2 !== 0 && user.userId !== this.player2UserId) {
      console.log("player1 moved instead of player2");
      return;
    }

    //make the move
    try {
      console.log("inside make move try block");
      this.board.move({
        from,
        to,
      });
      console.log("move:", move, "moved");
    } catch (error) {
      console.log("error in making move", error);
      return;
    }

    //add move to db
    try {
      await this.addMoveToDB(move);
    } catch (error) {
      console.log("error adding move in db:", error);
      return;
    }
    // move made and broadcasted in the room
    SocketManager.getInstance().broadcastMessage(
      this.gameId,
      JSON.stringify({
        type: MOVE,
        payload: {
          move: move,
        },
      })
    );
    console.log("move broadcasted");
    //if game gets over
    if (this.board.isGameOver()) {
      console.log("game is over");
      const isDraw = this.board.isDraw();
      const result = isDraw
        ? "DRAW"
        : this.board.turn() === "w"
          ? "BLACK_WINS"
          : "WHITE_WINS";
      this.endGame("COMPLETED", result);
      return;
    }

    this.moveCount++;
    console.log("move count:", this.moveCount);
  }
  async endGame(status: GameStatus, result: Result) {
    const finalGameStatus = await db.game.update({
      where: {
        id: this.gameId,
      },
      data: {
        status: status,
        result: result,
        endAt: new Date(),
      },
      include: {
        moves: {
          orderBy: {
            moveNumber: "asc",
          },
        },
      },
    });
    SocketManager.getInstance().broadcastMessage(
      this.gameId,
      JSON.stringify({
        type: GAME_OVER,
        payload: {
          result,
          status,
        },
      })
    );
  }
  async addMoveToDB(move: Move) {
    await db.$transaction([
      db.move.create({
        data: {
          from: move.from,
          to: move.to,
          after: move.after,
          before: move.before,
          game: {
            connect: {
              id: this.gameId,
            },
          },
          moveNumber: this.moveCount,
        },
      }),
      db.game.update({
        where: {
          id: this.gameId,
        },
        data: {
          currentFen: this.board.fen(),
        },
      }),
    ]);
  }

  async addGameToDB() {
    const game = await db.game.create({
      data: {
        id: this.gameId,
        status: "IN_PROGRESS",
        startAt: this.startTime,
        startingFen: this.board.fen(),
        currentFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        whitePlayer: {
          connect: {
            id: this.player1UserId,
          },
        },
        blackPlayer: {
          connect: {
            id: this.player2UserId ?? "",
          },
        },
      },
      include: {
        whitePlayer: true,
        blackPlayer: true,
      },
    });
    console.log("game added in db:", game.id, "ws game id:", this.gameId);
  }
}
