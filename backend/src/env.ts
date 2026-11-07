import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GEMINI_API_KEY: z.string().optional(),
  PRIMARY_MODEL: z.string().default("gemini-3.6-flash"),
  FALLBACK_MODEL: z.string().default("gemini-3.5-flash-lite"),
  MODEL: z.string().optional(),
});
export const config = envSchema.parse(process.env);