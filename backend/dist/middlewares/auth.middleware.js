"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function authMiddleware(req, res, next) {
    const token = req.cookies.accessToken || req.headers['authorization']?.replace("Bearer ", "");
    if (!token) {
        res.status(401).json({ success: false, message: 'No token' });
        return;
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (typeof (decodedToken) === 'object' && 'id' in decodedToken) {
            req.user = decodedToken;
            next();
            return;
        }
        else {
            res.status(403).json({ success: false, message: 'Invalid token payload' });
            return;
        }
    }
    catch (error) {
        console.error('JWT verification error:', error);
        res.status(401).json({ error: 'Token verification failed', success: false });
        return;
    }
}
