import { Response, Request, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Types } from 'mongoose';

interface Decoded extends JwtPayload {
    id: Types.ObjectId
    name: string;
    email: string;
    picture: string
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {

    const token = req.cookies.accessToken || req.headers['authorization']?.replace("Bearer ", "");

    if (!token) {
        res.status(401).json({ success: false, message: 'No token' });
        return
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as Decoded

        if (typeof (decodedToken) === 'object' && 'id' in decodedToken) {
            req.user = decodedToken
            next();
            return;
        }
        
        else {
            res.status(403).json({ success: false, message: 'Invalid token payload' });
            return
        }

    } catch (error) {
        console.error('JWT verification error:', error);
        res.status(401).json({ error: 'Token verification failed', success: false });
        return;
    }
}
