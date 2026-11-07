import { CookieOptions } from "express";

const isProduction = process.env.NODE_ENV === "production";
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

export const accessTokenOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  domain: cookieDomain,
  path: "/",
  maxAge: 60 * 60 * 1000, // 1 hour
};

export const refreshTokenOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  domain: cookieDomain,
  path: "/",
  maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
};
