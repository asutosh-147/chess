import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import testRouter from './router/v1';
import authRouter from './router/auth';
import { initPassport } from './passport';
const app = express();
dotenv.config();

const allowedHosts = process.env.HOSTS_ALLOWED? process.env.HOSTS_ALLOWED.split(',') : [];
console.log(allowedHosts);
app.use(cors({
    origin:allowedHosts,
    methods:'GET,POST,PUT,DELETE',
    credentials:true
}));
app.use(session({
    secret:process.env.COOKIE_SECRET || 'pussy_cat',
    resave:false,
    saveUninitialized:true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));

initPassport();
app.use(passport.initialize());
app.use(passport.authenticate('session'));


app.use(testRouter);
app.use('/auth',authRouter);
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
});



