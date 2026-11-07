import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { oauth2Client } from "../services/oauth.service";
import { GoogleOAuthPayload, UserInfo } from "../types";
import { User } from "../models/user.model";
import { decodeRefreshToken, generateAccessToken, generateRefreshToken } from "../utils/generateTokens";
import { accessTokenOptions, refreshTokenOptions } from "../utils/cookiesOptions";
import { CustomError } from "../utils/apiError";
import { Types } from "mongoose";
import { Subscription } from "../models/subscription.model";

function getCleanFrontendUrl(): string {
    return (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

const googleSignIn = asyncHandler(async (req: Request, res: Response) => {
    const frontendUrl = getCleanFrontendUrl();
    try {
        const code = req.query.code as string;

        if (!code || typeof code !== 'string') {
            res
                .status(400)
                .redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('No authorization code received')}`);
            return;
        }

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        if (!tokens.id_token) {
            res
                .status(400)
                .redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('No ID token received')}`);
            return;
        }


        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload() as GoogleOAuthPayload;
        if (!payload) {
            res
                .status(400)
                .redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('Invalid token payload')}`);
            return
        }
        const userInfo: UserInfo = {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
        };

        let newUser = await User.findOne({ googleId: userInfo.googleId });

        if (!newUser) {
            newUser = await User.create({
                name: userInfo.name,
                email: userInfo.email,
                googleId: userInfo.googleId,
                picture: userInfo.picture,
            });
        }

        const user = {
            name: newUser.name,
            email: newUser.email,
            picture: newUser.picture || '',
            _id: newUser._id as Types.ObjectId,
            isPro: newUser.isPro
        }

        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)

        newUser.refreshToken = refreshToken;
        await newUser.save();
        res.cookie('refreshToken', refreshToken, refreshTokenOptions)
        res.cookie('accessToken', accessToken, accessTokenOptions)
        return res.redirect(`${frontendUrl}/auth/success?token=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`);

    } catch (error) {
        console.error('Authentication error:', error);
        return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
    }
})

const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken =
        req.cookies?.refreshToken || (req.headers["x-refresh-token"] as string);

    if (!incomingRefreshToken) {
        throw new CustomError(401, "No refresh token provided");
    }

    const decoded = decodeRefreshToken(incomingRefreshToken);
    if (!decoded) {
        throw new CustomError(401, "Invalid or expired refresh token");
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== incomingRefreshToken) {
        throw new CustomError(401, "Refresh token mismatch or revoked");
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

    return res.status(200).json({
        success: true,
        accessToken: newAccessToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture ?? "",
            createdAt: user.createdAt,
            isPro: user.isPro,
        },
        message: "Token refreshed successfully",
    });
});

const getUser = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new CustomError(401, "Unauthorized")
    };
    const user = await User.findById(req.user.id).select("-refreshToken -googleId -__v -updatedAt -pdfSummaryFile  -subscriptionId");

    if (!user) {
        throw new CustomError(404, "User not found")
    }
    let canGeneratePdf: boolean
    if (user.isPro) {

        const proUser = await Subscription.findOne({
            userId: user._id,
            status: "active"
        })
        canGeneratePdf = proUser?.canGeneratePdf() ?? false;
    }
    else canGeneratePdf = user.canGeneratePdf();

    res
        .status(200)
        .json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                picture: user.picture ?? "",
                createdAt: user.createdAt,
                isPro: user.isPro,
                canGeneratePdf
            },
            message: "User fetched successfully",
        });
    return;
})


const logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;
    if (user?.id) {
        await User.findByIdAndUpdate(user.id, {
            refreshToken: null
        });
    }
    res
        .status(200)
        .clearCookie("accessToken", accessTokenOptions)
        .clearCookie("refreshToken", refreshTokenOptions)
        .json({
            success: true,
            message: "Logout successful",
        });
    return;
});

export {
    googleSignIn,
    getUser,
    refreshAccessToken,
    logoutUser
};