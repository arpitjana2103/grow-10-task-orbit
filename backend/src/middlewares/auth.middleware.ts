import type { Request, Response, NextFunction } from "express";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { AppError } from "../utils/errors/app-error.util.js";
import { handleAsyncError } from "./async-handler.middleware.js";

export const authProtect = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (req.isAuthenticated()) return next();
    else
        throw new AppError({
            publicMessage: "Authentication required for this operation",
            internalMessage: "User is not authenticated (req.isAuthenticated() === false)",
            statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
            errorCode: ErrorCodeEnum.AUTH_UNAUTHORIZED_ACCESS,
        });
});
