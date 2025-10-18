import { Request, Response, NextFunction } from "express";

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

    console.log("Error", err);

    return res.
        status(statusCode)
        .json({
            success: false,
            message
        })
}