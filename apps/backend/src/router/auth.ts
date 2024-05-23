import { Request, Response, Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { db } from '../db';
const authRouter = Router();

const REDIRECT_URL = process.env.REDIRECT_URL || 'http://localhost:5173/play/start';
const JWT_SECRET = process.env.JWT_SECRET || 'pussy_cat';
type User = {
    id: string;
};
authRouter.get('/refresh', async (req: Request, res: Response) => {
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
      res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  });

authRouter.get('/google',
    passport.authenticate('google',{scope:['email','profile']})
)

authRouter.get('/google/callback',
    passport.authenticate('google',{
        successRedirect:REDIRECT_URL,
        failureRedirect:'/login/failed'
    })
)
authRouter.get('/login/failed',(req:Request,res:Response)=>{
    res.status(401).json({message:'Login failed'});
})
authRouter.get('/logout',(req:Request,res:Response)=>{
    req.logout((err)=>{
        if(err){
            return res.status(500).json({message:'Logout failed'});
        }else{
            res.clearCookie('session');
            res.redirect("http://localhost:5173/");
        }
    });
})
export default authRouter;