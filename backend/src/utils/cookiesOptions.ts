import { CookieOptions } from "express";

export const accessTokenOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' ? true : false,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 60 * 60 * 1000, // 1 hour
};

export const refreshTokenOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production' ? true : false,
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
};