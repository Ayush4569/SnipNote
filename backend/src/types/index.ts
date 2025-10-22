import { Types } from "mongoose";

export interface User {
    _id: Types.ObjectId;
    name: string;
    email: string;
    picture?: string | null;
    googleId: string;
    createdAt?: Date;
    updatedAt?: Date;
    isPro: boolean;
}

export interface GoogleOAuthPayload {
    sub: string;
    email: string;
    name: string;
    picture: string;
    email_verified?: boolean;
    aud?: string;
    iss?: string;
    iat?: number;
    exp?: number;
  }
  export interface UserInfo {
    googleId: string;
    email: string;
    name: string;
    picture: string;
  }
  