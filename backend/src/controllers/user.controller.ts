import type { Request, Response, NextFunction } from "express";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { handleAsyncError } from "../middlewares/async-handler.middleware.js";
import { sendResponse } from "../utils/response.util.js";

export const getCurrentUser = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const user = await req.user!.populate("currentWorkspace");

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: user.omitPassword(),
    });
});
