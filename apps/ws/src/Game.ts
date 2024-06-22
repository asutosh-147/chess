import { Chess, Move } from "chess.js";
import {
  AUTO_ABORT,
  GAME_OVER,
  INIT_GAME,
  INIT_PLAYER_TIME,
  MOVE,
} from "@repo/utils/index";
import { randomUUID } from "crypto";
import { db } from "./db";
import { SocketManager, User } from "./UserSocketManager";
import { GameStatus, Result } from "@repo/utils/index";
import { gameManager } from ".";
export class Game {
  public gameId: string;
  public player1UserId: string;
  public player2UserId: string | null;
  public board: Chess;
  public status: GameStatus;
  public result: Result | null = null;
  public moveCount: number;
  public player1Time: number;
  public player2Time: number;
  private abandonTimer: NodeJS.Timeout | null = null;
  private abandonPopupTimer: NodeJS.Timeout | null = null;
  private PlayerTimer: NodeJS.Timeout | null = null;
  private startTime: Date;

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
    this.status = "IN_PROGRESS";
    this.moveCount = 0;
    this.player1Time = INIT_PLAYER_TIME;
    this.player2Time = INIT_PLAYER_TIME;
  }

  private stopAbandonTimers() {
    if (this.abandonTimer) {
      clearTimeout(this.abandonTimer);
      this.abandonTimer = null;
    }
    if (this.abandonPopupTimer) {
      clearTimeout(this.abandonPopupTimer);
      this.abandonPopupTimer = null;
    }
  }
  private startAbandonTimer() {
    this.abandonPopupTimer = setTimeout(() => {
      SocketManager.getInstance().broadcastMessage(
        this.gameId,
        JSON.stringify({
          type: AUTO_ABORT,
          payload: {
            message: `auto aborting in 30 seconds if ${this.board.turn() === "b" ? "black" : "white"} doesn't move`,
          },
        })
      );
      this.abandonTimer = setTimeout(() => {
        this.endGame(
          "ABANDONED",
          this.board.turn() === "b" ? "WHITE_WINS" : "BLACK_WINS",
          "Auto Abort"
        );
      }, 30 * 1000);
    }, 30 * 1000);
  }
  private startPlayerTimer() {
    this.PlayerTimer = setInterval(() => {
      if (this.board.turn() === "w") {
        this.player1Time -= 100;
      } else {
        this.player2Time -= 100;
      }
      if (this.player1Time === 0 || this.player2Time === 0) {
        this.endGame(
          "TIME_UP",
          this.board.turn() == "b" ? "WHITE_WINS" : "BLACK_WINS",
          "by Timeout"
        );
      }
    }, 100);
  }
  private stopPlayerTimers() {
    if (this.PlayerTimer) clearInterval(this.PlayerTimer);
    this.PlayerTimer = null;
  }
  async addP2ToGame(p2UserId: string) {
    this.player2UserId = p2UserId;

    try {
      await this.addGameToDB();
    } catch (error) {
      console.log("error adding game in db :", error);
      return;
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
          player1Time: this.player1Time,
          player2Time: this.player2Time,
          whitePlayer: {
            name: users.find((user) => user.id === this.player1UserId)?.name,
            profilePic: users.find((user) => user.id === this.player1UserId)
              ?.profilePic,
            id: this.player1UserId,
          },
          blackPlayer: {
            name: users.find((user) => user.id === this.player2UserId)?.name,
            profilePic: users.find((user) => user.id === this.player2UserId)
              ?.profilePic,
            id: this.player2UserId,
          },
          fen: this.board.fen(),
        },
      })
    );
    this.startAbandonTimer();
    this.startPlayerTimer();
  }

  seedAllMoves(
    moves: {
      id: string;
      gameId: string;
      moveNumber: number;
      from: string;
      to: string;
      comments: string | null;
      createdAt: Date;
      piece: string;
      color: string;
      captured: string | null;
      promotion: string | null;
    }[]
  ) {
    moves.forEach((move) => {
      if (move.promotion) {
        this.board.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion,
        });
      } else {
        this.board.move({
          from: move.from,
          to: move.to,
        });
      }
    });
    this.moveCount = moves.length;
  }

  async makeMove(user: User, move: Move) {
    //validation
    const { from, to } = move;
    console.log("inside make move");
    console.log("move count:", this.moveCount);
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
      if (move.promotion) {
        console.log("promoting");
        this.board.move({
          from,
          to,
          promotion: move.promotion,
        });
      } else {
        this.board.move({
          from,
          to,
        });
      }
      console.log("move:", move, "moved");
    } catch (error) {
      console.log("error in making move", error);
      return;
    }
    if (this.abandonPopupTimer || this.abandonTimer) this.stopAbandonTimers();
    //add move to db
    try {
      await this.addMoveToDB(move);
    } catch (error) {
      console.log("error adding move in db:", error);
      return;
    }
    // move made and broadcasted in the room
    SocketManager.getInstance().broadCastMessageToOthers(
      this.gameId,
      user.userId,
      JSON.stringify({
        type: MOVE,
        payload: {
          move: move,
        },
      })
    );
    this.moveCount++;
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
      const by = result === "DRAW" ? "" : "Checkmate";
      this.endGame("COMPLETED", result, by);
      return;
    }
    if (this.moveCount < 2) this.startAbandonTimer();
    console.log("move count:", this.moveCount);
  }
  async endGame(status: GameStatus, result: Result, by: string) {
    const finalGameStatus = await db.game.update({
      where: {
        id: this.gameId,
      },
      data: {
        status: status,
        result: result,
        by: by,
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
          by: by,
        },
      })
    );
    this.stopPlayerTimers();
    this.stopAbandonTimers();
    gameManager.removeGame(this.gameId);
  }
  async addMoveToDB(move: Move) {
    await db.$transaction([
      db.move.create({
        data: {
          from: move.from,
          to: move.to,
          after: move.after,
          before: move.before,
          color: move.color,
          piece: move.piece,
          captured: move?.captured,
          promotion: move?.promotion,
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
