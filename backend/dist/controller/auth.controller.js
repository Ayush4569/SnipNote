"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.refreshAccessToken = exports.getUser = exports.googleSignIn = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const oauth_service_1 = require("../services/oauth.service");
const user_model_1 = require("../models/user.model");
const generateTokens_1 = require("../utils/generateTokens");
const cookiesOptions_1 = require("../utils/cookiesOptions");
const apiError_1 = require("../utils/apiError");
const googleSignIn = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const code = req.query.code;
        if (!code || typeof code !== 'string') {
            res
                .status(400)
                .redirect(`${process.env.FRONTEND_URL}/auth/error?message=No authorization code received`);
            return;
        }
        const { tokens } = await oauth_service_1.oauth2Client.getToken(code);
        oauth_service_1.oauth2Client.setCredentials(tokens);
        if (!tokens.id_token) {
            res
                .status(400)
                .redirect(`${process.env.FRONTEND_URL}/auth/error?message=No ID token received`);
            return;
        }
        const ticket = await oauth_service_1.oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            res
                .status(400)
                .redirect(`${process.env.FRONTEND_URL}/auth/error?message=Invalid token payload`);
            return;
        }
        const userInfo = {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
        };
        let newUser = await user_model_1.User.findOne({ googleId: userInfo.googleId });
        if (!newUser) {
            newUser = await user_model_1.User.create({
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
            _id: newUser._id,
            isPro: newUser.isPro
        };
        const accessToken = (0, generateTokens_1.generateAccessToken)(user);
        const refreshToken = (0, generateTokens_1.generateRefreshToken)(user);
        newUser.refreshToken = refreshToken;
        await newUser.save();
        res.cookie('refreshToken', refreshToken, cookiesOptions_1.refreshTokenOptions);
        res.cookie('accessToken', accessToken, cookiesOptions_1.accessTokenOptions);
        return res.status(200).redirect(`${process.env.FRONTEND_URL}/auth/success`);
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).redirect(`${process.env.FRONTEND_URL}/auth/error?message=Authentication failed`);
    }
});
exports.googleSignIn = googleSignIn;
const getUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user) {
        throw new apiError_1.CustomError(401, "Unauthorized");
    }
    ;
    const user = await user_model_1.User.findById(req.user.id).select('_id name email picture');
    if (!user) {
        throw new apiError_1.CustomError(404, "User not found");
    }
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
            isPro: user.isPro
        },
        message: "User fetched successfully",
    });
    return;
});
exports.getUser = getUser;
const refreshAccessToken = async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (!incomingRefreshToken) {
        throw new apiError_1.CustomError(401, "Unauthorized pls login to generate refreshToken");
    }
    const decodedUser = (0, generateTokens_1.decodeRefreshToken)(incomingRefreshToken);
    if (!decodedUser) {
        throw new apiError_1.CustomError(401, "Invalid refresh token");
    }
    const user = await user_model_1.User.findById(decodedUser.id);
    if (!user) {
        res.status(401).clearCookie("refreshToken", incomingRefreshToken).json({
            success: false,
            message: "User not found",
        });
        return;
    }
    if (incomingRefreshToken !== user.refreshToken) {
        res.
            status(401).
            clearCookie("refreshToken", incomingRefreshToken).
            json({
            success: false,
            message: "Token mismatch, please login again",
        });
        return;
    }
    const accessToken = (0, generateTokens_1.generateAccessToken)(user);
    res
        .status(200)
        .cookie("accessToken", accessToken, cookiesOptions_1.accessTokenOptions)
        .json({
        success: true,
        message: "Access token refreshed successfully",
    });
    return;
};
exports.refreshAccessToken = refreshAccessToken;
const logoutUser = async (req, res) => {
    const user = req.user;
    if (!user) {
        throw new apiError_1.CustomError(401, "Unauthorized");
    }
    await user_model_1.User.findByIdAndUpdate(user.id, {
        refreshToken: null
    });
    res
        .status(200)
        .clearCookie("accessToken", cookiesOptions_1.accessTokenOptions)
        .clearCookie("refreshToken", cookiesOptions_1.refreshTokenOptions)
        .json({
        success: true,
        message: "Logout successful",
    });
    return;
};
exports.logoutUser = logoutUser;
