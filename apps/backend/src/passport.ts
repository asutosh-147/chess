import passport from "passport";
import dotenv from "dotenv";
import { db } from "./db";
const GoogleStrategy = require("passport-google-oauth20").Strategy;

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const initPassport = () => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
  } else {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: "/auth/google/callback",
        },
        async function (
          accessToken: string,
          refreshToken: string,
          profile: any,
          done: (error: any, user?: any) => void
        ) {
          const user = await db.user.upsert({
            where: {
              email: profile.emails[0].value,
            },
            update: {
              name: profile.displayName,
              profilePic:profile.photos[0].value,
            },
            create: {
              email: profile.emails[0].value,
              profilePic:profile.photos[0].value,
              name: profile.displayName,
              authProvider: "GOOGLE",
            },
          });
          done(null, user);
        }
      )
    );
  }
  passport.serializeUser((user: any, done) => {
    process.nextTick(() => {
      return done(null, {
        id: user.id,
        username: user?.username,
        picture: user?.profilePic,
      });
    });
  });
  passport.deserializeUser(function (user: any, cb) {
    process.nextTick(function () {
      return cb(null, user);
    });
  });
};
