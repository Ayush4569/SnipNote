import { User } from "./../types";
import { config } from "../env";
import jwt from "jsonwebtoken";


export function generateAccessToken(user: Pick<User, '_id' | 'email' | 'name' | 'picture'>) {
    const token = jwt.sign({
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
    },
        config.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: '1h',
        })
    return token;
}
export function generateRefreshToken(user: Pick<User, '_id' | 'email' | 'name' | 'picture'>) {
    const token = jwt.sign({
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
    },
        config.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: '7d',
        })
    return token;
}

export const decodeRefreshToken = (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string);
        return decoded as {
            id: string;
            email: string;
            name: string;
            picture: string | null;
        }
    } catch (error) {
        return null;
    }
}