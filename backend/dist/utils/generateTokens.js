"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeRefreshToken = void 0;
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
const env_1 = require("../env");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function generateAccessToken(user) {
    const token = jsonwebtoken_1.default.sign({
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isPro: user.isPro,
    }, env_1.config.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
    });
    return token;
}
function generateRefreshToken(user) {
    const token = jsonwebtoken_1.default.sign({
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        isPro: user.isPro,
    }, env_1.config.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });
    return token;
}
const decodeRefreshToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.decodeRefreshToken = decodeRefreshToken;
