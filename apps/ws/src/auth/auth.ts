import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'pussy_cat'
export const decodeTokenUserId = (token: string) => {
    const decodedToken = jwt.verify(token,JWT_SECRET) as { userId:string};
    return decodedToken?.userId;
}