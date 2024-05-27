import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'myJWTsecret@1234'
export const decodeTokenUserId = (token: string) => {
    const decodedToken = jwt.verify(token,JWT_SECRET) as { userId:string};
    return decodedToken?.userId;
}