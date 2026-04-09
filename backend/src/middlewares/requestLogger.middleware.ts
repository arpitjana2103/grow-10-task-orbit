import type { Request, Response, NextFunction } from "express";

import { logger } from "../config/logger.config.js";
import { handleAsyncError } from "./async-handler.middleware.js";

export const requestLogger = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const start = Date.now();

    logger.info(
        {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
        },
        "Incoming request",
    );

    res.on("finish", () => {
        const duration = Date.now() - start;

        logger.info(
            {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
            },
            "Request completed",
        );
    });

    next();
});
