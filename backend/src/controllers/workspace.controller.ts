import type { Request, Response, NextFunction } from "express";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { handleAsyncError } from "../middlewares/async-handler.middleware.js";
import {
    createWorkspaceService,
    getAllWorkspacesUserIsMemberService,
} from "../services/workspace.service.js";
import { sendResponse } from "../utils/response.util.js";
import { createWorkspaceSchema } from "../validations/workspace.validations.js";

export const createWorkspace = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const body = createWorkspaceSchema.parse(req.body);
    const userId = req.user?._id.toString() as string;
    const newWorkspace = await createWorkspaceService(userId, {
        name: body.name,
        description: body.description,
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: { workspace: newWorkspace },
    });
});

export const getAllWorkspacesUserIsMember = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const userId = req.user?._id.toString() as string;
    const workspaces = await getAllWorkspacesUserIsMemberService(userId);

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: { workspaces: workspaces },
    });
});
