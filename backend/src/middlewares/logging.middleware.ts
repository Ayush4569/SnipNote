import { Request, Response, NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();

    console.log("---- Incoming Request ----");
    console.log("Method :", req.method);
    console.log("Endpoint :", req.originalUrl);
    console.log("IP :", req.ip);

    res.on("finish", () => {
        const duration = Date.now() - now;
        console.log("Status :", res.statusCode);
        console.log("Duration :", duration, "ms");
        console.log("--------------------------\n");
    })

    next();

}   