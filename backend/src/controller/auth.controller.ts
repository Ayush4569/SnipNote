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

const googleSignIn = asyncHandler(async (req: Request, res: Response) => {
    try {
        const code = req.query.code as string;

        if (!code || typeof code !== 'string') {
            res
                .status(400)
                .redirect(`${process.env.FRONTEND_URL}/auth/error?message=No authorization code received`);
            return;
        }

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        if (!tokens.id_token) {
            res
                .status(400)
                .redirect(`${process.env.FRONTEND_URL}/auth/error?message=No ID token received`);
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
                .redirect(`${process.env.FRONTEND_URL}/auth/error?message=Invalid token payload`);
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
        return res.status(200).redirect(`${process.env.FRONTEND_URL}/auth/success`);

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).redirect(`${process.env.FRONTEND_URL}/auth/error?message=Authentication failed`);
    }
})

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


const logoutUser = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) {
        throw new CustomError(401, "Unauthorized")
    }
    await User.findByIdAndUpdate(user.id, {
        refreshToken: null
    });
    res
        .status(200)
        .clearCookie("accessToken", accessTokenOptions)
        .clearCookie("refreshToken", refreshTokenOptions)
        .json({
            success: true,
            message: "Logout successful",
        });
    return;
}

export {
    googleSignIn,
    getUser,
    logoutUser
};