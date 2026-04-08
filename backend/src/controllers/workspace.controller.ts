import type { Request, Response, NextFunction } from "express";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { handleAsyncError } from "../middlewares/async-handler.middleware.js";
import WorkspaceModel from "../models/workspace.model.js";
import {
    ensureUserMembershipInWorkspace,
    getMembersInWorkspace,
} from "../services/member.service.js";
import {
    createWorkspaceService,
    getAllWorkspacesUserIsMemberService,
} from "../services/workspace.service.js";
import { AppError } from "../utils/errors/app-error.util.js";
import { sendResponse } from "../utils/response.util.js";
import { createWorkspaceSchema, workspaceIdSchema } from "../validations/workspace.validations.js";

export const createWorkspace = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const body = createWorkspaceSchema.parse(req.body);
    const userId = req.user!._id.toString() as string;
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
    const userId = req.user!._id.toString() as string;
    const workspaces = await getAllWorkspacesUserIsMemberService(userId);

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: { workspaces: workspaces },
    });
});

export const getWorkspaceByIdwithMembers = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const workspaceId = workspaceIdSchema.parse(req.params["id"]);
    const userId = req.user!._id.toString() as string;

    const workspace = await WorkspaceModel.findById(workspaceId);

    if (!workspace) {
        throw new AppError({
            publicMessage: `Workspace not found with id:${workspaceId}`,
            statusCode: HTTPSTATUSCODE.NOT_FOUND,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    const membership = await ensureUserMembershipInWorkspace({ userId, workspace });

    if (!membership) {
        throw new AppError({
            statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
            publicMessage: `membership of user:${userId} at workspace:${workspaceId} not found`,
            errorCode: ErrorCodeEnum.ACCESS_UNAUTHORIZED,
        });
    }

    const members = await getMembersInWorkspace({ workspace });

    await workspace.populate({ path: "owner", select: "name email profilePicture" });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: { workspace: { ...workspace.toObject(), members } },
    });
});
