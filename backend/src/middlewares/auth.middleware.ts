import { Response, Request, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { decodeRefreshToken, generateAccessToken } from "../utils/generateTokens";
import { User } from "../models/user.model";
import { Types } from 'mongoose';
import { accessTokenOptions, refreshTokenOptions } from "../utils/cookiesOptions";

interface Decoded extends JwtPayload {
    id: Types.ObjectId
    name: string;
    email: string;
    picture: string
    isPro: boolean
}

export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const accessToken = req.cookies?.accessToken || bearerToken;

    if (accessToken) {
        try {
            const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as Decoded;

            req.user = decodedToken;
            return next();
        } catch (err) {
            console.error('Access token invalid or expired, falling back to refresh token:', err);
        }
    }

    const refreshToken = req.cookies?.refreshToken || (req.headers['x-refresh-token'] as string);

    if (!refreshToken) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const decoded = decodeRefreshToken(refreshToken);
        if (!decoded) throw new Error("Invalid refresh token");

        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            throw new Error("Refresh token mismatch");
        }

        const newAccessToken = generateAccessToken({
            _id: user._id as Types.ObjectId,
            name: user.name,
            email: user.email,
            picture: user.picture || "",
            isPro: user.isPro,
        });

        res.cookie("accessToken", newAccessToken, accessTokenOptions);
        res.setHeader("x-access-token", newAccessToken);

        req.user = {
            id: user._id as Types.ObjectId,
            name: user.name,
            email: user.email,
            picture: user.picture || "",
            isPro: user.isPro,
        };

        return next();
    } catch (err) {
        res.clearCookie("accessToken", accessTokenOptions);
        res.clearCookie("refreshToken", refreshTokenOptions);
        return res.status(401).json({ success: false, message: "Session expired" });
    }
}
