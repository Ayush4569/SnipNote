"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenOptions = exports.accessTokenOptions = void 0;
exports.accessTokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 60 * 60 * 1000, // 1 hour
};
exports.refreshTokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
};
