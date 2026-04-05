import type { Request, Response } from "express";

import { config } from "../config/app.config.js";
import { HTTPSTATUSCODE } from "../config/http.config.js";
import { logger } from "../config/logger.config.js";
import { AccountProviderEnum } from "../enums/account-provider.enum.js";
import { handleAsyncError } from "../middlewares/async-handler.middleware.js";
import { ensureUser } from "../services/auth.service.js";
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

export const registerUser = handleAsyncError(async function (req: Request, res: Response) {
    const { name, email, password } = registerUserSchema.parse({ ...req.body });
    const user = await ensureUser({
        provider: AccountProviderEnum.EMAIL,
        name: name,
        providerId: email,
        email: email,
        password: password,
        picture: null,
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
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
