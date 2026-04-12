import type { RoleDocument } from "../models/role.model.js";
import type { Request, Response, NextFunction } from "express";

import { HTTPSTATUSCODE } from "../config/http.config.js";
import { ErrorCodeEnum } from "../enums/error-code.enum.js";
import { PermissionEnum } from "../enums/role.enum.js";
import { handleAsyncError } from "../middlewares/async-handler.middleware.js";
import WorkspaceModel from "../models/workspace.model.js";
import { ensureUserMembershipInWorkspaceService } from "../services/member.service.js";
import {
    createProjectService,
    getProjectsInWorkspaceService,
} from "../services/project.service.js";
import { roleGuard } from "../services/role.service.js";
import { AppError } from "../utils/errors/app-error.util.js";
import { sendResponse } from "../utils/response.util.js";
import {
    createProjectSchema,
    projectPaginationQuerySchema,
} from "../validations/project.validations.js";
import { workspaceIdSchema } from "../validations/workspace.validations.js";

export const createProject = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { name, emoji, description } = createProjectSchema.parse(req.body);
    const workspaceId = workspaceIdSchema.parse(req.params["workspaceId"]);

    const userId = req.user!._id.toString() as string;
    const workspace = await WorkspaceModel.findById(workspaceId);

    if (!workspace) {
        throw new AppError({
            publicMessage: `Workspace not found with id:${workspaceId}`,
            statusCode: HTTPSTATUSCODE.NOT_FOUND,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    const membership = await ensureUserMembershipInWorkspaceService({ userId, workspace });

    if (!membership) {
        throw new AppError({
            statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
            publicMessage: `membership of user:${userId} at workspace:${workspaceId} not found`,
            errorCode: ErrorCodeEnum.ACCESS_UNAUTHORIZED,
        });
    }

    roleGuard({
        role: membership.role as RoleDocument,
        requiredPermissions: [PermissionEnum.CREATE_PROJECT],
    });

    const project = await createProjectService({
        userId: userId,
        workspaceId: workspaceId,
        body: { emoji, name, description },
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: { project },
    });
});

export const getAllProjectsInWorkspace = handleAsyncError(async function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const workspaceId = await workspaceIdSchema.parseAsync(req.params["workspaceId"]);
    const userId = req.user!._id.toString() as string;

    const workspace = await WorkspaceModel.findById(workspaceId);

    if (!workspace) {
        throw new AppError({
            publicMessage: `Workspace not found with id:${workspaceId}`,
            statusCode: HTTPSTATUSCODE.NOT_FOUND,
            errorCode: ErrorCodeEnum.RESOURCE_NOT_FOUND,
        });
    }

    const membership = await ensureUserMembershipInWorkspaceService({ userId, workspace });

    if (!membership) {
        throw new AppError({
            statusCode: HTTPSTATUSCODE.UNAUTHORIZED,
            publicMessage: `membership of user:${userId} at workspace:${workspaceId} not found`,
            errorCode: ErrorCodeEnum.ACCESS_UNAUTHORIZED,
        });
    }

    roleGuard({
        role: membership.role as RoleDocument,
        requiredPermissions: [PermissionEnum.VIEW_ONLY],
    });

    const { pageSize, pageNumber } = await projectPaginationQuerySchema.parseAsync(req.query);
    const { projects, pagination } = await getProjectsInWorkspaceService({
        workspace,
        pageSize: pageSize,
        pageNumber: pageNumber,
    });

    sendResponse(res, {
        statusCode: HTTPSTATUSCODE.OK,
        status: "success",
        data: {
            projects,
            pagination,
        },
    });
});
