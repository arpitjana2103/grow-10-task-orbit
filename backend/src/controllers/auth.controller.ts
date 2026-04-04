import type { Request, Response } from "express";

import { config } from "../config/app.config.js";
import { logger } from "../config/logger.config.js";
import { handleAsyncError } from "../middlewares/async-handler.middleware.js";

export const handleGoogleAuthSuccess = handleAsyncError(async function (
    req: Request,
    res: Response,
) {
    const currentWorkspaceId = req.user?.currentWorkspace;
    // Handle User with no currentWorkspace

    return res.redirect(`${config.FRONTEND_ORIGIN}/workspace/${currentWorkspaceId}`);
});
