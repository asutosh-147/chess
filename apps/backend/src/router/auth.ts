import { Request, Response, Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { db } from "../db";
import dotenv from "dotenv";
const authRouter = Router();
dotenv.config();

const REDIRECT_URL =
  process.env.REDIRECT_URL || "http://localhost:5173/play/start";
const JWT_SECRET = process.env.JWT_SECRET || "pussy_cat";
const LOGOUT_REDIRECT_URL =
  process.env.LOGOUT_REDIRECT_URL || "http://localhost:5173/";
type User = {
  id: string;
};

authRouter.get("/profile", async (req: Request, res: Response) => {
  if (req.user) {
    const user = req.user as User;
    const userDb = await db.user.findUnique({
      where: {
        id: user.id,
      },
    });
    const gamesPlayed = await db.game.findMany({
      where: {
        OR: [
          {
            whitePlayerId: user.id,
          },
          {
            blackPlayerId: user.id,
          },
        ],
      },
      include: {
        whitePlayer: {
          select: {
            name: true,
          },
        },
        blackPlayer: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            moves: true,
          },
        },
      },
      orderBy: {
        startAt: "desc",
      },
    });
    if (!userDb) {
      return res.status(400).json({ message: "user not found" });
    }
    res.json({ ...userDb, games: gamesPlayed });
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

authRouter.get("/refresh", async (req: Request, res: Response) => {
  if (req.user) {
    const user = req.user as User;

    const userDb = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({
      token,
      id: user.id,
      name: userDb?.name,
      profilePic: userDb?.profilePic,
    });
  } else {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
});

authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: REDIRECT_URL,
    failureRedirect: "/login/failed",
  })
);
authRouter.get("/login/failed", (req: Request, res: Response) => {
  res.status(401).json({ message: "Login failed" });
});
authRouter.get("/logout", (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    } else {
      res.clearCookie("session");
      res.redirect(LOGOUT_REDIRECT_URL);
    }
  });
});
export default authRouter;
