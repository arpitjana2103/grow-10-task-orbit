import type { ErrorRequestHandler, Response } from "express";

import { runningOnDevelopment, runningOnProduction } from "../config/app.config.js";
import { HTTPSTATUSCODE } from "../config/http.config.js";
import { logger } from "../config/logger.config.js";
import { AppError } from "../utils/app-error.js";

// Middleware: Global error handler with env-based response strategy
// - Routes errors to dev/prod handlers based on runtime environment
export const handleGlobalError: ErrorRequestHandler = function (err: unknown, _req, res, _next) {
    if (runningOnDevelopment()) {
        return sendErrForDev(err, res);
    }

    if (runningOnProduction()) {
        return sendErrForProd(err, res);
    }

    res.status(HTTPSTATUSCODE.INTERNAL_SERVER_ERROR).json({
        status: "error",
        message: "Something went wrong.",
    });
};

// Helper: Development error formatter
// - Sends detailed error response (message, stack, errorCode) while env is "development"
function sendErrForDev(err: unknown, res: Response): void {
    if (err instanceof AppError) {
        logger.error({ error: err }, err.internalMessage || err.message);

        res.status(err.statusCode).json({
            env: "development",
            status: "error",
            message: err.publicMessage,
            internalMessage: err.internalMessage,
            errorCode: err.errorCode,
            stack: err.stack,
        });
    } else {
        logger.error({ error: err });

        res.status(HTTPSTATUSCODE.INTERNAL_SERVER_ERROR).json({
            env: "development",
            status: "error",
            error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
        });
    }
}

// Helper: Production error formatter
// - Sends sanitized error response (no stack) while env is "production"
function sendErrForProd(err: unknown, res: Response): void {
    if (err instanceof AppError && err.isOperational) {
        logger.error({ error: err }, err.internalMessage || err.message);

        res.status(err.statusCode).json({
            env: "production",
            status: "error",
            message: err.publicMessage,
            errorCode: err.errorCode,
        });
    } else {
        logger.error({ error: err });

        res.status(HTTPSTATUSCODE.INTERNAL_SERVER_ERROR).json({
            env: "production",
            status: "error",
            message: "Something went wrong",
        });
    }
}
