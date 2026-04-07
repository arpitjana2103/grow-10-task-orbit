import type { NextFunction, Request, Response } from "express";

import { config } from "../config/app.config.js";
import { HTTPSTATUSCODE } from "../config/http.config.js";
import { logger } from "../config/logger.config.js";
import { AccountProviderEnum, AuthStrategyEnum } from "../enums/account-provider.enum.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { handleAsyncError } from "../middlewares/async-handler.middleware.js";
import { ensureUserService } from "../services/auth.service.js";
import { AppError } from "../utils/errors/app-error.util.js";
import { sendResponse } from "../utils/response.util.js";
import { registerUserSchema } from "../validations/auth.validations.js";

export const handleGoogleAuthSuccess = handleAsyncError(async function (
    req: Request,
    res: Response,
) {
    const currentWorkspaceId = req.user?.currentWorkspace;
    // Handle User with no currentWorkspace

    return res.redirect(`${config.FRONTEND_ORIGIN}/workspace/${currentWorkspaceId}`);
});

export const registerUser = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { name, email, password } = registerUserSchema.parse({ ...req.body });
    const user = await ensureUserService({
        provider: AccountProviderEnum.EMAIL,
        name: name,
        providerId: email,
        email: email,
        password: password,
        picture: null,
        strategy: AuthStrategyEnum.EMAIL,
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.CREATED,
        status: "success",
        message: "user created",
        data: {
            user: {
                name: user.name,
                email: user.email,
            },
        },
    });
});

export const loginUser = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        message: "user logged in",
        data: {
            user: req.user?.omitPassword(),
        },
    });
});

export const logoutUser = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    req.logOut(function (err) {
        if (err) throw err;
        req.session.destroy(function (err) {
            if (err) throw err;
            res.clearCookie("to-session");

            sendResponse(res, {
                statusCode: HTTPSTATUSCODE.OK,
                status: "success",
                message: "user logged out",
            });
        });
    });
});
