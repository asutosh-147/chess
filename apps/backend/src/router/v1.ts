import { Router } from "express";

const testRouter = Router();

const isLoggedIn = (req:any,res:any,next:any)=>{
    if(req.user){
        return next();
    }
    res.status(401).send('Unauthorized');
}
testRouter.get('/welcome',(req,res)=>{
    res.send('Welcome to the backend!');
})
type User = {
    id:string;
    username:string;
    picture:string;
}
testRouter.get('/protected', isLoggedIn ,(req,res)=>{
    console.log(req.user);
    const user = req.user as User;
    res.send(`you are authenticated route ${user.username} <img src={${user.picture}}/>`);
});

export default testRouter;