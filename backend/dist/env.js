"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive().default(8000),
    DATABASE_URL: zod_1.z.string().min(1),
    JWT_SECRET: zod_1.z.string().min(1),
    ACCESS_TOKEN_SECRET: zod_1.z.string(),
    REFRESH_TOKEN_SECRET: zod_1.z.string(),
    NODE_ENV: zod_1.z.enum(["development", "production"]).default("development"),
    GOOGLE_CLIENT_ID: zod_1.z.string().min(1),
    GOOGLE_CLIENT_SECRET: zod_1.z.string().min(1),
});
exports.config = envSchema.parse(process.env);
