import { Request, Response, NextFunction } from "express";
import { type Summary } from "../models/summary.model";

export class CustomError extends Error {
    statusCode: number;
    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode
        this.message = message
        Object.setPrototypeOf(this, CustomError.prototype)
    }
}

interface ErrorWithStatusCode extends Error {
    statusCode: number
}


export const errorHandler = (err: ErrorWithStatusCode, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal server error"

    console.error("---- Error Occurred ----");
    console.error("Method:", req.method);
    console.error("Endpoint:", req.originalUrl);
    console.error("Message:", err.message);
    console.error("Stack:", err.stack);

    return res.
        status(statusCode)
        .json({
            success: false,
            message
        })
}

export const failSummary = async (
    summaryDoc: Summary,
    statusCode: number,
    message: string,
    tokenUsed?: number
  ):Promise<never> => {
    summaryDoc.status = 'failed';
    summaryDoc.error = message;
    summaryDoc.tokenUsed = tokenUsed || 0;
    summaryDoc.summaryText = [];
    await summaryDoc.save();
    throw new CustomError(statusCode, message);
  };
  